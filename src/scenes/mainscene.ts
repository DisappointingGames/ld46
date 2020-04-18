import { World } from "../World";
import { Scene, GameObjects, Time } from "phaser";
import { Coordinate } from "../Coordinate";
import { CellType } from "../CellType";
import { Cell } from "../Cell";
import { MoveType } from "../MoveType";

//Player sprite, if we want to change it between scenes
export class MainScene extends Phaser.Scene {


    //just putting the world in here too, refactor later back to separate class
    private world: Array<Array<Tile>> = [];
    private worldWidth: integer;
    private worldHeight: integer;
    private tileWidthHalf: integer | null = null;
    private tileHeightHalf: integer | null = null;
    private centerX: integer | null = null;
    private centerY: integer | null = null;
    private playerPos: Coordinate = new Coordinate(50, 50);
    private playerSpeed = 2.0;
    public playerDir = "up";

    //for key handling
    private keyboard = Phaser.Input.Keyboard;
    private downKey: Phaser.Input.Keyboard.Key | null = null;
    private upKey: Phaser.Input.Keyboard.Key | null = null;
    private leftKey: Phaser.Input.Keyboard.Key | null = null;
    private rightKey: Phaser.Input.Keyboard.Key | null = null;
    private spaceKey: Phaser.Input.Keyboard.Key | null = null;

    //private playerSprite = new GameObjects.Sprite(this, 0,0,'');

    private crashTimer : Time.TimerEvent | null = null;
    constructor() {
        super({
            key: "MainScene", 
            mapAdd: {time: "time"}
        });

        this.worldHeight = 42;
        this.worldWidth = 42;

    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.load.image("emptyTile", 'assets/graphics/empty_tile.png')
        this.load.image("playerTile", 'assets/graphics/player_tile.png')
        this.load.image("serverTile", '/assets/graphics/server.png')
        this.load.image("brokenServerTile", 'assets/graphics/server.png');
    }

    create(): void {
        
        this.crashTimer = this.time.addEvent({delay: 1000, paused: true, callback : this.createEmergency, loop : true});
        //set camera
        this.cameras.main.setViewport(0, 0, 1024, 800);
        this.cameras.main.setScroll(42, 42);

        //define keyboard input
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //initial world building
        this.worldWidth = 42;
        this.worldHeight = 42;

        this.tileWidthHalf = 88;
        this.tileHeightHalf = 50;

        this.centerX = (this.worldWidth / 2) * this.tileWidthHalf;
        this.centerY = (this.worldHeight / 2) * this.tileHeightHalf;

        this.world = [];
        for (let i = 0; i < this.worldWidth; i++) {
            let inner = [];
            for (let j = 0; j < this.worldHeight; j++) {
                let tc = this.getWorldToScreenCoords(new Coordinate(i, j));

                let tileType = (Math.random() < 0.24) ? 'serverTile' : 'emptyTile';

                let tile = new Tile(this, tc.x, tc.y, tileType, tileType, i, j);
                this.add.existing(tile);

                tile.setDepth(this.centerY + tc.y);

                inner.push(tile);
            }
            this.world.push(inner);
        }

        //todo init player
        //this player tile is just for testing the game logic until we have a player done
        this.playerPos = new Coordinate(21, 21);
        let playerTile = this.world[this.playerPos.x][this.playerPos.y];
        this.world[this.playerPos.x][this.playerPos.y].setTexture('playerTile');

        let cursors = this.input.keyboard.createCursorKeys();

        //some testing
        let controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            zoomIn: cursors.up,
            zoomOut: cursors.down,
            acceleration: 0.04,
            drag: 0.0005,
            maxSpeed: 0.7
        };


        this.cameras.main.zoom = 0.2;
        this.crashTimer.paused = false;
    }


    moveUp() {
        this.playerPos.y -= this.playerSpeed;
    }

    moveDown() {
        this.playerPos.y += this.playerSpeed;
    }

    moveLeft() {
        this.playerPos.x -= this.playerSpeed;
    }
    moveRight() {
        this.playerPos.x += this.playerSpeed;
    }

    update(time: number, delta: number) {

        let oldPlayerPos = new Coordinate(this.playerPos.x, this.playerPos.y);
        let moved = false;

        //handle keyboard input
        let moveType;
        if (this.keyboard.JustDown(this.downKey!)) {
            moveType = this.getMoveType('down', this.spaceKey?.isDown!, this.playerPos.x, this.playerPos.y + 1);
            if (moveType != MoveType.Illegal) {
                this.playerPos.y++;
                moved = true;
            }
        }
        if (this.keyboard.JustDown(this.upKey!)) {
            moveType = this.getMoveType('up', this.spaceKey?.isDown!, this.playerPos.x, this.playerPos.y - 1);
            if (moveType != MoveType.Illegal) {
                this.playerPos.y--;
                moved = true;
            }
        }
        if (this.keyboard.JustDown(this.leftKey!)) {
            moveType = this.getMoveType('left', this.spaceKey?.isDown!, this.playerPos.x - 1, this.playerPos.y);
            if (moveType != MoveType.Illegal) {
                this.playerPos.x--;
                moved = true;
            }
        }
        if (this.keyboard.JustDown(this.rightKey!)) {
            moveType = this.getMoveType('right', this.spaceKey?.isDown!, this.playerPos.x + 1, this.playerPos.y);
            if (moveType != MoveType.Illegal) {
                this.playerPos.x++;
                moved = true;
            }
        }

        /*
        var newDir = "";
        var dY = 0, dX = 0;
        //handle keyboard input
        if(this.downKey?.isDown) {
            newDir = "north";
            dY = -1;
        }
        if(this.upKey?.isDown) {
            newDir = "south";
            dY = 1;
        }
        if(this.leftKey?.isDown) {
            newDir += "west";
            dX = -1;
        }
        if(this.rightKey?.isDown) {
            newDir += "east";
            dX = 1;
        }
        */

        //update player //todo obviously should be proper movement checking and such
        if (moved) {
            //first, if push then we must push the thing that was first in our way one further      
            if (moveType == MoveType.PushDown) {
                let oldType = this.world![oldPlayerPos!.x][oldPlayerPos!.y + 1].getTileType();
                this.world![oldPlayerPos!.x][oldPlayerPos!.y + 2].setTileType(oldType);
                this.world![oldPlayerPos!.x][oldPlayerPos!.y + 2].setTexture(oldType);
            }
            if (moveType == MoveType.PushUp) {
                let oldType = this.world![oldPlayerPos!.x][oldPlayerPos!.y - 1].getTileType();
                this.world![oldPlayerPos!.x][oldPlayerPos!.y - 2].setTileType(oldType);
                this.world![oldPlayerPos!.x][oldPlayerPos!.y - 2].setTexture(oldType);
            }
            if (moveType == MoveType.PushLeft) {
                let oldType = this.world![oldPlayerPos!.x - 1][oldPlayerPos!.y].getTileType();
                this.world![oldPlayerPos!.x - 2][oldPlayerPos!.y].setTileType(oldType);
                this.world![oldPlayerPos!.x - 2][oldPlayerPos!.y].setTexture(oldType);
            }
            if (moveType == MoveType.PushRight) {
                let oldType = this.world![oldPlayerPos!.x + 1][oldPlayerPos!.y].getTileType();
                this.world![oldPlayerPos!.x + 2][oldPlayerPos!.y].setTileType(oldType);
                this.world![oldPlayerPos!.x + 2][oldPlayerPos!.y].setTexture(oldType);
            }

            //if pull, we have to clear its old position and put the server where the player was
            if (moveType == MoveType.PullDown) {
                let oldType = this.world![oldPlayerPos!.x][oldPlayerPos!.y - 1].getTileType();
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTileType(oldType);
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTexture(oldType);

                this.world![oldPlayerPos!.x][oldPlayerPos!.y - 1].setTileType('emptyTile');
                this.world![oldPlayerPos!.x][oldPlayerPos!.y - 1].setTexture('emptyTile');
            }
            if (moveType == MoveType.PullUp) {
                let oldType = this.world![oldPlayerPos!.x][oldPlayerPos!.y + 1].getTileType();
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTileType(oldType);
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTexture(oldType);

                this.world![oldPlayerPos!.x][oldPlayerPos!.y + 1].setTileType('emptyTile');
                this.world![oldPlayerPos!.x][oldPlayerPos!.y + 1].setTexture('emptyTile');
            }
            if (moveType == MoveType.PullLeft) {
                let oldType = this.world![oldPlayerPos!.x + 1][oldPlayerPos!.y].getTileType();
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTileType(oldType);
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTexture(oldType);

                this.world![oldPlayerPos!.x + 1][oldPlayerPos!.y].setTileType('emptyTile');
                this.world![oldPlayerPos!.x + 1][oldPlayerPos!.y].setTexture('emptyTile');
            }
            if (moveType == MoveType.PullRight) {
                let oldType = this.world![oldPlayerPos!.x - 1][oldPlayerPos!.y].getTileType();
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTileType(oldType);
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTexture(oldType);

                this.world![oldPlayerPos!.x - 1][oldPlayerPos!.y].setTileType('emptyTile');
                this.world![oldPlayerPos!.x - 1][oldPlayerPos!.y].setTexture('emptyTile');
            }

            //if normal step or push, the old pos becomes empty
            if (moveType == MoveType.Step || moveType == MoveType.PushDown || moveType == MoveType.PushUp || moveType == MoveType.PushLeft || moveType == MoveType.PushRight) {
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTileType('emptyTile');
                this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTexture('emptyTile');
            }

            //regardless, the new player position becomes player tile
            let playerTile = this.world![this.playerPos!.x][this.playerPos!.y];
            this.world![this.playerPos!.x][this.playerPos!.y].setTileType('player');
            this.world![this.playerPos!.x][this.playerPos!.y].setTexture('playerTile');
        }

        //update camera
        let cameraCenter = this.getWorldToScreenCoords(this.playerPos);
        this.cameras.main.setScroll(cameraCenter.x, cameraCenter.y);
    }

    getWorldToScreenCoords(c: Coordinate): Coordinate {
        return new Coordinate(
            (c.x - c.y) * this.tileWidthHalf! + this.centerX!,
            (c.x + c.y) * this.tileHeightHalf! + this.centerY!
        );
    }

    getMoveType(direction: string, pulling: boolean, targetX: integer, targetY: integer): MoveType {
        //first check out of bounds   
        if (this.outOfBounds(targetX, targetY)) {
            return MoveType.Illegal;
        }

        //check if target cell is empty, is so, it's just a step
        if (this.cellEmpty(targetX, targetY)) {
            if (pulling) {
                switch (direction) {
                    case 'down':
                        if (!this.outOfBounds(targetX, targetY - 2) && !this.cellEmpty(targetX, targetY - 2)) {
                            return MoveType.PullDown;
                        }
                        break;

                    case 'up':
                        if (!this.outOfBounds(targetX, targetY + 2) && !this.cellEmpty(targetX, targetY + 2)) {
                            return MoveType.PullUp;
                        }
                        break;

                    case 'left':
                        if (!this.outOfBounds(targetX + 2, targetY) && !this.cellEmpty(targetX + 2, targetY)) {
                            return MoveType.PullLeft;
                        }
                        break;

                    case 'right':
                        if (!this.outOfBounds(targetX - 2, targetY) && !this.cellEmpty(targetX - 2, targetY)) {
                            return MoveType.PullRight;
                        }
                        break;
                }
            }

            //if none of that worked, its just a normal step
            return MoveType.Step;
        }

        //now we know that the target cell is not empty, so we have to check if we can push
        switch (direction) {
            case 'down':
                if (!this.outOfBounds(targetX, targetY + 1) && this.cellEmpty(targetX, targetY + 1)) {
                    return MoveType.PushDown;
                }
                break;
            case 'up':
                if (!this.outOfBounds(targetX, targetY - 1) && this.cellEmpty(targetX, targetY - 1)) {
                    return MoveType.PushUp;
                }
                break;
            case 'left':
                if (!this.outOfBounds(targetX - 1, targetY) && this.cellEmpty(targetX - 1, targetY)) {
                    return MoveType.PushLeft;
                }
                break;
            case 'right':
                if (!this.outOfBounds(targetX + 1, targetY) && this.cellEmpty(targetX + 1, targetY)) {
                    return MoveType.PushRight;
                }
                break;
        }

        return MoveType.Illegal; //catching the "should never happen" ase
    }

    createEmergency()
    {
        //var x = Phaser.Math.Between(0, this.worldWidth-1);
        //var y = Phaser.Math.Between(0, this.worldHeight-1);
        //Above were not working, so I hardcoded the numbers for now
        var x = Math.floor(Math.random()* (42.0) + 0);
        var y = Math.floor(Math.random()* (42.0) + 0);
        if(/*this.cellIsWorkingServer(x,y)*/true)
        {
            this.world![x][y].setTileType('brokenServerTile');
            console.log("Broke server at (%d, %d)", x, y);
            
        }
        else
        {
            /* We missed? Player lucky or just find the nearest working server and break that? */
            console.log("Missed! (%d, %d)", x, y);
        }
    }

    cellIsWorkingServer(x: integer, y: integer): Boolean {
        return this.world![x][y].getTileType() === 'serverTile';
    }
    outOfBounds(x: integer, y: integer): Boolean {
        return x < 0 || y < 0 || x >= this.worldWidth! || y >= this.worldHeight!;
    }

    cellEmpty(x: integer, y: integer): Boolean {
        return this.world![x][y].getTileType() === 'emptyTile';
    }

}

class Tile extends Phaser.GameObjects.Image {

    private tileType: string
    public readonly row: number
    public readonly col: number

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, tileType: string, row: number, col: number, frame?: string | integer) {
        super(scene, x, y, texture, frame)
        this.tileType = tileType
        this.row = row
        this.col = col
    }

    setTileType(tileType: string) {
        this.tileType = tileType
    }

    getTileType() {
        return this.tileType
    }

}

