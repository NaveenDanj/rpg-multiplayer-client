import Phaser from 'phaser'
import { io } from "socket.io-client";

export default class HelloWorldScene extends Phaser.Scene
{
	constructor()
	{
		super('hello-world');
        this.players = {};
        this.speed = 100;
	}

	preload()
    {
        this.load.atlas('player' , 'assets/Character/fauna.png' , 'assets/Character/Character.json' );
        this.socket = io("http://localhost:9001");

    }

    create()
    {
        this.player = this.physics.add.sprite(120 , 100 , 'player');
        this.cursor = this.input.keyboard.createCursorKeys();

        this.socket.on('socketConfirmation' , arg => {
            this.socket.id = arg.id
            console.log('my socket id is ' , this.socket.id);
            this.player.x = arg.x;
            this.player.y = arg.y;
        });


        this.socket.on('newUser' , arg => {
            console.log('new user connected to the room');
            let x = Math.random() * 780;
            let y = Math.random() * 600;
            this.addNewPlayer(arg , x , y);
        });

        this.socket.emit('getAllUsers' , null);

        this.socket.on("allUsers" , arg => {

            console.log('user list is ' , arg);

            for(let i = 0; i < arg.length; i++){
                let x = Math.random()*780;
                let y = Math.random()*600;
                this.addNewPlayer(arg[i] , x , y);
            }

            this.physics.add.overlap(this.player, Object.values(this.players)[0] , this.handleCollide);

        });

        this.socket.on('playerMoved' , arg => {
            this.players[arg.id].x = arg.x;
            this.players[arg.id].y = arg.y;

        });

        this.socket.on('userDisconnected' , arg => {
            this.players[arg].destroy();
        });



    }

    update(){

        if(this.cursor.left.isDown){
            this.player.setVelocity(-this.speed , 0);
            this.socket.emit('playerMoved' , {id : this.socket.id , x : this.player.x , y : this.player.y , direction : 'left'});
        }else if(this.cursor.right.isDown){
            this.player.setVelocity(this.speed , 0); 
            this.socket.emit('playerMoved' , {id : this.socket.id , x : this.player.x , y : this.player.y , direction : 'right'});
        }else if(this.cursor.up.isDown){
            this.player.setVelocity(0 , -this.speed);
            this.socket.emit('playerMoved' , {id : this.socket.id , x : this.player.x , y : this.player.y , direction : 'up'});
        }else if(this.cursor.down.isDown){
            this.player.setVelocity(0 , this.speed);
            this.socket.emit('playerMoved' , {id : this.socket.id , x : this.player.x , y : this.player.y , direction : 'down'});
        }else{
            this.player.setVelocity(0 , 0 );
        }

    }

    addNewPlayer(id , x , y){
        this.players[id] = this.physics.add.sprite(x , y , 'player');
    }

    handleCollide(){
        console.log('player collide');
    }


}
