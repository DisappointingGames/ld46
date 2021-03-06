import { Scene, GameObjects, Time } from "phaser";
import { Coordinate } from "../Coordinate";
import { MoveType } from "../MoveType";

export class MainScene extends Phaser.Scene {

    private readonly world: Array<Array<Tile>> = [];
    private readonly worldWidth: integer = 10
    private readonly worldHeight: integer = 10
    private readonly tileWidthHalf = 88
    private readonly tileHeightHalf = 50
    private readonly centerX = (this.worldWidth / 2) * this.tileWidthHalf
    private readonly centerY = (this.worldHeight / 2) * this.tileHeightHalf;

    //for key handling
    private keyboard = Phaser.Input.Keyboard;
    private downKey: Phaser.Input.Keyboard.Key | null = null;
    private upKey: Phaser.Input.Keyboard.Key | null = null;
    private leftKey: Phaser.Input.Keyboard.Key | null = null;
    private rightKey: Phaser.Input.Keyboard.Key | null = null;
    private spaceKey: Phaser.Input.Keyboard.Key | null = null;
    private shiftKey: Phaser.Input.Keyboard.Key | null = null;

    //for player movement and animation 
    private playerPos: Coordinate = new Coordinate(0, 0);//this is the position in "tile coords"
    private playerSpeed = 2.0;

    //private playerSprite = new GameObjects.Sprite(this, 0,0,'');

    private crashTimer: Time.TimerEvent | null = null;

    //sounds    
    private serverCrashSound: Phaser.Sound.BaseSound | null = null;
    private moveWallSound: Phaser.Sound.BaseSound | null = null;
    private backgroundSound: Phaser.Sound.BaseSound | null = null;
    private fixedSound: Phaser.Sound.BaseSound | null = null;

    //scoring    
    private score: integer = 0;
    private nrBrokenServers: integer = 0;

    constructor() {
        super({
            key: "MainScene",
            mapAdd: { time: "time" }
        });
    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.load.image("emptyTile", 'assets/graphics/empty_tile.png')
        this.load.image("playerTile", 'assets/graphics/player_tile.png')
        let spritesheetconfig = {
            frameWidth: 176,
            frameHeight: 300,
            startFrame: 0,
            endFrame: 14,
            margin: 0,
            spacing: 0
        };
        this.load.spritesheet('serverTile', 'assets/graphics/server-working-tex.png', spritesheetconfig);
        this.load.spritesheet('brokenServerTile', 'assets/graphics/server-error-tex.png', spritesheetconfig);

        //sounds
        this.load.audio('serverCrash', './assets/sound/hdd-break1.mp3');
        this.load.audio('moveWall', './assets/sound/move-wall.mp3');
        this.load.audio('backgroundHumm', './assets/sound/bg-humm.mp3');
        this.load.audio('fixedSound', './assets/sound/powerup.mp3');
    }

    create(): void {
        this.crashTimer = this.time.addEvent({ delay: 1000, paused: true, callback: this.createEmergency, callbackScope: this, loop: true });

        //set camera
        this.cameras.main.setViewport(0, 0, 1024, 800);
        this.cameras.main.setScroll(42, 42);

        //create sounds
        this.serverCrashSound = this.sound.add('serverCrash');
        this.fixedSound = this.sound.add('fixedSound');
        this.moveWallSound = this.sound.add('moveWall');
        this.backgroundSound = this.sound.add('backgroundHumm');
        this.backgroundSound.play({ volume: 0.3, loop: true })

        //define keyboard input
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        //blinking
        this.anims.create({
            key: 'serverBlinking',
            frames: this.anims.generateFrameNames('serverTile', { start: 0, end: 14 }),
            frameRate: 6,
            repeat: Phaser.FOREVER
        })
        this.anims.create({
            key: 'brokenServerBlinking',
            frames: this.anims.generateFrameNames('brokenServerTile', { start: 0, end: 14 }),
            frameRate: 6,
            repeat: Phaser.FOREVER
        })

        //initial world building
        for (let i = 0; i < this.worldWidth; i++) {
            let inner = [];
            for (let j = 0; j < this.worldHeight; j++) {
                let tc = this.getWorldToScreenCoords(new Coordinate(i, j));

                let tileType = (Math.random() < 0.24) ? TileType.SERVER_TILE : TileType.EMPTY_TILE;

                let tile = new Tile(this, tc.x, tc.y, tileType, tileType, i, j);

                tile.setTileType(tileType);//for blinking
                this.add.existing(tile);

                tile.setDepth(this.centerY + tc.y);

                inner.push(tile);
            }
            this.world.push(inner);
        }

        //this player tile is just for testing the game logic until we have a player done
        this.playerPos = new Coordinate(this.worldWidth / 2, this.worldHeight / 2);
        let playerTile = this.world[this.playerPos.x][this.playerPos.y];
        playerTile.setTileType(TileType.PLAYER_TILE)

        let cursors = this.input.keyboard.createCursorKeys();

        this.cameras.main.zoom = 0.4;
        this.crashTimer.paused = false;

        //HUD test
        this.scene.launch('HUDScene');
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

        //game logic for player and server movements
        let oldPlayerPos = new Coordinate(this.playerPos.x, this.playerPos.y);
        let moved = false;

        let spaceDown = this.spaceKey!.isDown
        let shiftDown = this.shiftKey!.isDown

        //handle keyboard input        
        let moveType;
        if (shiftDown) {//trying to fix a server
            let x = this.playerPos.x
            let y = this.playerPos.y - 1
            if (this.cellIsBrokenServer(x, y)) {
                let cell = this.world[x][y];
                cell.fix();
                if (cell.isFixed()) {
                    this.score++;
                    this.nrBrokenServers--;
                    this.events.emit('updateHUD', this.score, this.nrBrokenServers);
                    this.fixedSound!.play();
                    cell.setTileType(TileType.SERVER_TILE);
                }
            }
        } else { //if not fixing, see if you moved
            if (this.keyboard.JustDown(this.downKey!)) {
                moveType = this.getMoveType(Dir.DOWN, spaceDown, this.playerPos.x, this.playerPos.y + 1);
                if (moveType != MoveType.Illegal) {
                    this.playerPos.y++;
                    moved = true;
                }
            }
            if (this.keyboard.JustDown(this.upKey!)) {
                moveType = this.getMoveType(Dir.UP, spaceDown, this.playerPos.x, this.playerPos.y - 1);
                if (moveType != MoveType.Illegal) {
                    this.playerPos.y--;
                    moved = true;
                }
            }
            if (this.keyboard.JustDown(this.leftKey!)) {
                moveType = this.getMoveType(Dir.LEFT, spaceDown, this.playerPos.x - 1, this.playerPos.y);
                if (moveType != MoveType.Illegal) {
                    this.playerPos.x--;
                    moved = true;
                }
            }
            if (this.keyboard.JustDown(this.rightKey!)) {
                moveType = this.getMoveType(Dir.RIGHT, spaceDown, this.playerPos.x + 1, this.playerPos.y);
                if (moveType != MoveType.Illegal) {
                    this.playerPos.x++;
                    moved = true;
                }
            }
        }

        //update player //todo obviously should be proper movement checking and such
        if (moved) {
            let x = oldPlayerPos.x
            let y = oldPlayerPos.y

            //first, if push then we must push the thing that was first in our way one further      
            if (moveType == MoveType.PushDown) {
                let oldType = this.world[x][y + 1].getTileType();
                this.world[x][y + 2].setTileType(oldType);
            }
            if (moveType == MoveType.PushUp) {
                let oldType = this.world[x][y - 1].getTileType();
                this.world[x][y - 2].setTileType(oldType);
            }
            if (moveType == MoveType.PushLeft) {
                let oldType = this.world[x - 1][y].getTileType();
                this.world[x - 2][y].setTileType(oldType);
            }
            if (moveType == MoveType.PushRight) {
                let oldType = this.world[x + 1][y].getTileType();
                this.world[x + 2][y].setTileType(oldType);
            }

            //if pull, we have to clear its old position and put the server where the player was
            if (moveType == MoveType.PullDown) {
                let oldType = this.world[x][y - 1].getTileType();
                this.world[x][y].setTileType(oldType);

                this.world[x][y - 1].empty()
            }
            if (moveType == MoveType.PullUp) {
                let oldType = this.world[x][y + 1].getTileType();
                this.world[x][y].setTileType(oldType);

                this.world[x][y + 1].empty()
            }
            if (moveType == MoveType.PullLeft) {
                let oldType = this.world[x + 1][y].getTileType();
                this.world[x][y].setTileType(oldType);

                this.world[x + 1][y].empty()
            }
            if (moveType == MoveType.PullRight) {
                let oldType = this.world[x - 1][y].getTileType();
                this.world[x][y].setTileType(oldType);

                this.world[x - 1][y].empty()
            }

            //if normal step or push, the old pos becomes empty
            if (moveType == MoveType.Step || moveType == MoveType.PushDown || moveType == MoveType.PushUp || moveType == MoveType.PushLeft || moveType == MoveType.PushRight) {
                this.world[x][y].empty()
            }

            //regardless, the new player position becomes player tile
            let playerTile = this.world[this.playerPos!.x][this.playerPos!.y];
            playerTile.setTileType(TileType.PLAYER_TILE);

            if (!(moveType === MoveType.Illegal || moveType === MoveType.Step)) {
                this.moveWallSound!.play();
            }
        }

        //update camera
        let cameraCenter = this.getWorldToScreenCoords(this.playerPos);
        this.cameras.main.setScroll(cameraCenter.x, cameraCenter.y);
    }

    getWorldToScreenCoords(c: Coordinate): Coordinate {
        return new Coordinate(
            (c.x - c.y) * this.tileWidthHalf + this.centerX,
            (c.x + c.y) * this.tileHeightHalf + this.centerY
        );
    }

    getScreenToWorldCoords(c: Coordinate): Coordinate {
        //I'm on cocaine
        let x = Math.floor((((c.x - this.centerX) / this.tileWidthHalf) + ((c.y - this.centerY) / this.tileHeightHalf)) / 2);
        return new Coordinate(
            x,
            Math.floor((c.y - this.centerY) / this.tileHeightHalf) - x
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
                    case Dir.DOWN:
                        if (!this.outOfBounds(targetX, targetY - 2) && !this.cellEmpty(targetX, targetY - 2)) {
                            return MoveType.PullDown;
                        }
                        break;

                    case Dir.UP:
                        if (!this.outOfBounds(targetX, targetY + 2) && !this.cellEmpty(targetX, targetY + 2)) {
                            return MoveType.PullUp;
                        }
                        break;

                    case Dir.LEFT:
                        if (!this.outOfBounds(targetX + 2, targetY) && !this.cellEmpty(targetX + 2, targetY)) {
                            return MoveType.PullLeft;
                        }
                        break;

                    case Dir.RIGHT:
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
            case Dir.DOWN:
                if (!this.outOfBounds(targetX, targetY + 1) && this.cellEmpty(targetX, targetY + 1)) {
                    return MoveType.PushDown;
                }
                break;
            case Dir.UP:
                if (!this.outOfBounds(targetX, targetY - 1) && this.cellEmpty(targetX, targetY - 1)) {
                    return MoveType.PushUp;
                }
                break;
            case Dir.LEFT:
                if (!this.outOfBounds(targetX - 1, targetY) && this.cellEmpty(targetX - 1, targetY)) {
                    return MoveType.PushLeft;
                }
                break;
            case Dir.RIGHT:
                if (!this.outOfBounds(targetX + 1, targetY) && this.cellEmpty(targetX + 1, targetY)) {
                    return MoveType.PushRight;
                }
                break;
        }

        return MoveType.Illegal; //catching the "should never happen" ase
    }

    createEmergency(): void {
        let x = Phaser.Math.Between(0, this.worldWidth - 1);
        let y = Phaser.Math.Between(0, this.worldHeight - 1);
        if (this.cellIsWorkingServer(x, y)) {
            //console.log("Broke server at (%d, %d)", x, y);
            this.world![x][y].setTileType(TileType.BROKEN_TILE);
            this.serverCrashSound!.play();
            this.nrBrokenServers++;
            this.events.emit('updateHUD', this.score, this.nrBrokenServers);
        }
        else {
            /* We missed? Player lucky or just find the nearest working server and break that? */
            //console.log("Missed! (%d, %d)", x, y);
        }
    }

    cellIsWorkingServer(x: integer, y: integer): Boolean {
        return this.world![x][y].getTileType() === TileType.SERVER_TILE;
    }

    cellIsBrokenServer(x: integer, y: integer): Boolean {
        return this.world![x][y].getTileType() === TileType.BROKEN_TILE;
    }

    outOfBounds(x: integer, y: integer): Boolean {
        return x < 0 || y < 0 || x >= this.worldWidth! || y >= this.worldHeight!;
    }

    cellEmpty(x: integer, y: integer): Boolean {
        return this.world![x][y].getTileType() === TileType.EMPTY_TILE;
    }
}

class Tile extends Phaser.GameObjects.Sprite {

    private tileType: TileType
    public readonly row: number
    public readonly col: number
    private amountFixed: number

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, tileType: TileType, row: number, col: number, frame?: string | integer) {
        super(scene, x, y, texture, frame)
        this.tileType = tileType
        this.row = row
        this.col = col
        this.amountFixed = 0
    }

    fix() {
        this.amountFixed++;
    }

    isFixed() {
        if (this.amountFixed == 20) {
            this.amountFixed = 0;
            return true;
        }
    }

    setTileType(tileType: TileType) {
        this.tileType = tileType

        if (this.anims.isPlaying) {
            this.anims.stop();
        }
        if (tileType == TileType.SERVER_TILE) {
            this.anims.play('serverBlinking', false, Math.floor(Math.random() * 15));
        }
        if (tileType == TileType.BROKEN_TILE) {
            this.anims.play('brokenServerBlinking', false, Math.floor(Math.random() * 15));
        }

        this.setTexture(tileType)
    }

    getTileType() {
        return this.tileType
    }

    empty() {
        this.setTileType(TileType.EMPTY_TILE)
    }
}

const enum TileType {
    EMPTY_TILE = "emptyTile",
    PLAYER_TILE = "playerTile",
    SERVER_TILE = "serverTile",
    BROKEN_TILE = "brokenServerTile"
}

const enum Dir {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}
