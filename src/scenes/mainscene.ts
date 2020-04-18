import { Coordinate } from "../Coordinate";
import { MoveType } from "../MoveType";

export class MainScene extends Phaser.Scene {

    private readonly world: Array<Array<Tile>> = [];
    private readonly worldWidth = 42
    private readonly worldHeight = 42
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

    //for player movement and animation 
    private player: any;
    private dX: integer = 0;
    private dY: integer = 0;
    private facing: string = "south";
    private playerPos: Coordinate = new Coordinate(0, 0);//this is the position in "tile coords"
    private playerMapPos: Coordinate = new Coordinate(0, 0);//this is the position in "screen coords"
    private playerSpeed = 2.0;

    //private playerSprite = new GameObjects.Sprite(this, 0,0,'');

    constructor() {
        super({
            key: "MainScene"
        });

    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        let spritesheetconfig = {
            frameWidth: 32,
            frameHeight: 48,
            startFrame: 0,
            endFrame: 5,
            margin: 0,
            spacing: 0
        };
        this.load.image("emptyTile", 'assets/graphics/empty_tile.png')
        this.load.image("playerTile", 'assets/graphics/player_tile.png')
        this.load.image("serverTile", '/assets/graphics/server.png')
        this.load.image("brokenServerTile", 'assets/graphics/server.png');
    }

    create(): void {
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
        for (let i = 0; i < this.worldWidth; i++) {
            let inner = [];
            for (let j = 0; j < this.worldHeight; j++) {
                let tc = this.getWorldToScreenCoords(new Coordinate(i, j));

                let tileType = (Math.random() < 0.24) ? TileType.SERVER_TILE : TileType.EMPTY_TILE;

                let tile = new Tile(this, tc.x, tc.y, tileType, tileType, i, j);
                this.add.existing(tile);

                tile.setDepth(this.centerY + tc.y);

                inner.push(tile);
            }
            this.world.push(inner);
        }

        //this player tile is just for testing the game logic until we have a player done
        this.playerPos = new Coordinate(21, 21);
        this.playerMapPos = this.getWorldToScreenCoords(this.playerPos);
        let playerTile = this.world[this.playerPos.x][this.playerPos.y];
        playerTile.setTileType(TileType.PLAYER_TILE)

        let cursors = this.input.keyboard.createCursorKeys();

        //some testing for camera
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
        this.detectKeyInput();
        //TODO animations
        /*
        if (this.dY == 0 && this.dX == 0)
        {
            this.player.animations.stop();
            this.player.animations.currentAnim.frame=0;
        }else{
            if(this.player.animations.currentAnim!=this.facing){
                this.player.animations.play(this.acing);
            }
        }*/

        //TODO connect to game logic for tiles
        this.playerMapPos.x += this.playerSpeed * this.dX;
        this.playerMapPos.y += this.playerSpeed * this.dY;
        //get the new player map tile
        let targetPosition = this.getScreenToWorldCoords(this.playerMapPos);
        //TODO now connect this new potential coordinate to the existing logic.
        console.log("targetPosition: " + targetPosition);


        //game logic for player and server movements
        let oldPlayerPos = new Coordinate(this.playerPos.x, this.playerPos.y);
        let moved = false;

        let isSpaceDown = this.spaceKey!.isDown

        //handle keyboard input
        let moveType;
        if (this.keyboard.JustDown(this.downKey!)) {
            moveType = this.getMoveType(Dir.DOWN, isSpaceDown, this.playerPos.x, this.playerPos.y + 1);
            if (moveType != MoveType.Illegal) {
                this.playerPos.y++;
                moved = true;
            }
        }
        if (this.keyboard.JustDown(this.upKey!)) {
            moveType = this.getMoveType(Dir.UP, isSpaceDown, this.playerPos.x, this.playerPos.y - 1);
            if (moveType != MoveType.Illegal) {
                this.playerPos.y--;
                moved = true;
            }
        }
        if (this.keyboard.JustDown(this.leftKey!)) {
            moveType = this.getMoveType(Dir.LEFT, isSpaceDown, this.playerPos.x - 1, this.playerPos.y);
            if (moveType != MoveType.Illegal) {
                this.playerPos.x--;
                moved = true;
            }
        }
        if (this.keyboard.JustDown(this.rightKey!)) {
            moveType = this.getMoveType(Dir.RIGHT, isSpaceDown, this.playerPos.x + 1, this.playerPos.y);
            if (moveType != MoveType.Illegal) {
                this.playerPos.x++;
                moved = true;
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
        let x = Math.floor((((c.x - this.centerX) / this.tileWidthHalf) + ((c.y - this.centerY) / this.tileHeightHalf))/2);
        return new Coordinate(
            x,
            Math.floor((c.y-this.centerY)/this.tileHeightHalf) - x
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

    outOfBounds(x: integer, y: integer): Boolean {
        return x < 0 || y < 0 || x >= this.worldWidth! || y >= this.worldHeight!;
    }

    cellEmpty(x: integer, y: integer): Boolean {
        return this.world![x][y].getTileType() === TileType.EMPTY_TILE;
    }

    detectKeyInput(): void {//assign direction for character & set x,y speed components
        if (this.upKey?.isDown) {
            this.dY = -1;
        }
        else if (this.downKey?.isDown) {
            this.dY = 1;
        }
        else {
            this.dY = 0;
        }
        if (this.rightKey?.isDown) {
            this.dX = 1;
            if (this.dY == 0) {
                this.facing = "east";
            }
            else if (this.dY == 1) {
                this.facing = "southeast";
                this.dX = this.dY = 0.5;
            }
            else {
                this.facing = "northeast";
                this.dX = 0.5;
                this.dY = -0.5;
            }
        }
        else if (this.leftKey?.isDown) {
            this.dX = -1;
            if (this.dY == 0) {
                this.facing = "west";
            }
            else if (this.dY == 1) {
                this.facing = "southwest";
                this.dY = 0.5;
                this.dX = -0.5;
            }
            else {
                this.facing = "northwest";
                this.dX = this.dY = -0.5;
            }
        }
        else {
            this.dX = 0;
            if (this.dY == 0) {
                //facing="west";
            }
            else if (this.dY == 1) {
                this.facing = "south";
            }
            else {
                this.facing = "north";
            }
        }
    }
}


class Tile extends Phaser.GameObjects.Image {

    private tileType: TileType
    public readonly row: number
    public readonly col: number

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, tileType: TileType, row: number, col: number, frame?: string | integer) {
        super(scene, x, y, texture, frame)
        this.tileType = tileType
        this.row = row
        this.col = col
    }

    setTileType(tileType: TileType) {
        this.tileType = tileType
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
    SERVER_TILE = "serverTile"
}

const enum Dir {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}
