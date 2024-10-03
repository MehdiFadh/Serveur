var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 900,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
    preload: preload,
    create: create,
    update: update
    } 
};

var game = new Phaser.Game(config);

function preload() {
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.image('ground', 'assets/platform.png');
    this.load.image('ground2', 'assets/platform2.png');
    this.load.image('sky','assets/sky2.png');
}


function create() {
    var self = this;
    this.socket = io();

    cursors = this.input.keyboard.createCursorKeys();

    this.add.image(400, 300,'sky');

    plateforms = this.physics.add.staticGroup();

    plateforms.create(400, 568, 'ground').setScale(2).refreshBody();

    plateforms.create(600,400,'ground');
    plateforms.create(50,250,'ground');
    plateforms.create(750,220,'ground');

    this.otherPlayers = this.physics.add.group();
    this.socket.on('currentPlayers', function (players){
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                addPlayer(self, players[id]);
            }
            else {
                addOtherPlayers(self, players[id]);
            }
        });
    });
    
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 10,
        repeat: -1
    });


    this.socket.on('disconnection', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
        }
        });
        this.socket.emit('playerMovement', { x: this.perso.x, y: this.perso.y});
        });

        this.socket.on('playerMoved', function (playerInfo) {
            self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
           }
        });
        });

}

function update() {

    if (this.perso) {
        if (cursors.up.isDown && this.perso.body.touching.down)
        {
            this.perso.setVelocityY(-330);
        }
        if(this.input.activePointer.isDown && this.perso.body.touching.down){
            this.perso.setVelocityY(-330);
        }
        else if (cursors.left.isDown) {
            this.perso.setVelocityX(-160);
            this.perso.anims.play('left', true);
        } else if (cursors.right.isDown) {
            this.perso.setVelocityX(160);
            this.perso.anims.play('right', true);
        } 
        else {
            this.perso.setVelocityX(0);
            this.perso.anims.play('turn');
        }
    }
}

 function addPlayer(self, playerInfo) {
    self.perso = self.physics.add.sprite(100, 450, 'dude',4);
    self.perso.setTint(playerInfo.c);
    self.perso.setCollideWorldBounds(true);
    self.perso.setGravityY(300);
    self.perso.setBounce(0.2);
    self.physics.add.collider(self.perso, plateforms);
   } 
   function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'dude',4);
    otherPlayer.setTint(playerInfo.c);
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
   }