

var enemmyscript = {
	onframe:function(io){
		player = io.in.getPlayer()
		var y = player.y;
		var x =player.x;
		var direction = Math.atan2(y-io.in.y,x-io.in.x)
		if(io.in.class.count!=30){
			io.out.moveLine(4,Math.PI)
			if(io.in.class.count<30&&io.in.class.count%10==0){
				io.out.Shoot(direction,5)
			}
		}else{
			io.out.Shoot(direction,3)
			io.out.Shoot(direction+Math.PI/12,3)
			io.out.Shoot(direction-Math.PI/12,3)
			io.out.Shoot(direction+Math.PI/12*2,3)
			io.out.Shoot(direction-Math.PI/12*2,3)
			io.out.move(12,-direction)
		}
		io.in.class.count++
	},
	onload:function(io){
		io.in.class.count = 0;
	},
	ondamage:function(io){
		player = io.in.getPlayer()
		var y = player.y;
		var x = player.x;
		var direction = Math.atan2(y-io.in.y,x-io.in.x)
		io.out.Shoot(direction,1)
	}
}


/*

●0,py


　　　　　　　　● x,y

*/