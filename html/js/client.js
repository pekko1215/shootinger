enchant();
var canvassize = { x: $('canvas').width(), y: $('canvas').height() }

var Player = enchant.Class.create(enchant.Sprite, { //プレイヤー(自機)の定義
        initialize: function(x, y) {
                enchant.Sprite.call(this, 16, 16); //自機をスプライトとして定義する
                this.image = game.assets['graphic.png']; //画像を読み込む
                this.x = x;
                this.y = y;
                this.frame = 0; //↓以下はマウスクリックで移動する処理
                game.rootScene.addEventListener('touchstart', function(e) {
                        player.x = e.x;
                        player.y = e.y;
                        game.touched = true;
                });
                game.rootScene.addEventListener('touchend', function(e) {
                        player.x = e.x;
                        player.y = e.y;
                        game.touched = false;
                });
                game.rootScene.addEventListener('touchmove', function(e) {
                        player.x = e.x;
                        player.y = e.y;
                });
                this.addEventListener('enterframe', function() {
                        if (game.touched && game.frame % 3 == 0) {
                                var s = new PlayerShoot(this.x, this.y);
                        }
                });
                game.rootScene.addChild(this);
        }
});
var Enemy = enchant.Class.create(enchant.Sprite, { //敵キャラの定義
        initialize: function(x, y, omega, script) {
                enchant.Sprite.call(this, 16, 16);
                this.image = game.assets['graphic.png'];
                this.x = x;
                this.y = y;
                this.script = script;
                this.frame = 3;
                this.time = 0;
                this.direction = Math.PI;
                this.moveSpeed = 3;
                this.script.onload(mkfunc(this));
                this.in =
                        this.addEventListener('enterframe', function() { //敵キャラの動きを設定する
                                this.script.onframe(mkfunc(this));
                                if (this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
                                        this.remove(); //画面外に出てしまったら自爆する
                                }
                                this.time++
                        });
                this.addEventListener('enter', function() {
                        this.script.onload(mkfunc(this))
                })
                game.rootScene.addChild(this);
        },
        remove: function() {
                this.script.ondamage(mkfunc(this))
                game.rootScene.removeChild(this);
                delete enemies[this.key];
                delete this;
        }
});
var Shoot = enchant.Class.create(enchant.Sprite, { //弾を定義
        initialize: function(x, y, direction, speed) {
                enchant.Sprite.call(this, 16, 16);
                this.image = game.assets['graphic.png'];
                this.x = x;
                this.y = y;
                this.frame = 1;
                this.moveSpeed = speed;
                this.direction = direction;
                this.addEventListener('enterframe', function() { //弾を毎フレーム動かす
                        this.x += this.moveSpeed * Math.cos(this.direction);
                        this.y += this.moveSpeed * Math.sin(this.direction);
                        if (this.y > 320 || this.x > 320 || this.x < -this.width || this.y < -this.height) {
                                this.remove();
                        }
                });
                game.rootScene.addChild(this);
        },
        remove: function() {
                game.rootScene.removeChild(this);
                delete this;
        }
});
var PlayerShoot = enchant.Class.create(Shoot, { //プレイヤーの弾を定義
        initialize: function(x, y) {
                Shoot.call(this, x, y, 0, 10);
                this.addEventListener('enterframe', function() {
                        for (var i in enemies) {
                                if (enemies[i].intersect(this)) { //敵に当たったら、敵を消してスコアを足す
                                        this.remove();
                                        enemies[i].remove();
                                        game.score += 100;
                                }
                        }
                });
        }
});
var EnemyShoot = enchant.Class.create(Shoot, { //敵の弾を定義
        initialize: function(x, y, direction,speed) {
                Shoot.call(this, x, y, direction, speed);
                this.addEventListener('enterframe', function() { //プレイヤーに当たったら即ゲームオーバーさせる
                        if (player.within(this, 4)) { game.end(game.score, "SCORE: " + game.score) }
                });
        }
});
window.onload = function() {
        game = new Game(320, 320); //ゲームの初期化
        game.fps = 24;
        game.score = 0;
        game.touched = false;
        game.preload('graphic.png');
        game.onload = function() {
                player = new Player(0, 152); //プレイヤーを作成する
                enemies = [];
                game.rootScene.backgroundColor = 'black';
                game.rootScene.addEventListener('enterframe', function() { //↓ランダムなタイミングで敵を出現させる
                        if (rand(1000) < game.frame / 20 * Math.sin(game.frame / 100) + game.frame / 20 + 50) {
                                var y = rand(320); //敵の出現位置はランダム
                                var omega = y < 160 ? 1 : -1;
                                var enemy = new Enemy(320, y, omega, enemmyscript);
                                enemy.key = game.frame;
                                enemies[game.frame] = enemy;
                        }
                        scoreLabel.score = game.score;
                });
                scoreLabel = new ScoreLabel(8, 8);
                game.rootScene.addChild(scoreLabel);
        }
        game.start();
}

function mkfunc(Class) {
        return { in : {
                        x: (function() {
                                return Class.x
                        })(),
                        y: (function() {
                                return Class.y
                        })(),
                        omega: Class.omega,
                        direction: Class.direction,
                        time: Class.time,
                        getPlayer: function() {
                                return player;
                        },
                        class: Class
                },
                out: {
                        Shoot: function(direction,speed) {
                                new EnemyShoot(Class.x, Class.y, direction,speed)
                        },
                        move: function(pw, rad) {
                                Class.direction = rad;
                                $('#con').text(rad)
                                Class.x += pw * Math.cos(Class.direction)
                                Class.y += pw * Math.sin(Class.direction)
                                return { x: Class.x, y: Class.y }
                        },
                        moveLine: function(pw) {
                                Class.x += pw * Math.cos(Class.direction)
                                Class.y += pw * Math.sin(Class.direction)
                                return { x: Class.x, y: Class.y }
                        },
                        moveVect(x, y) {
                                Class.direction = Math.atan2(y, x);
                                Class.x += x;
                                Class.y += y;
                        }
                }
        }
}
