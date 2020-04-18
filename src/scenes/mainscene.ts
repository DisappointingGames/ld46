import { World } from "../World";
import { Scene } from "phaser";
import { Coordinate } from "../Coordinate";
import { CellType } from "../CellType";
import { Cell } from "../Cell";

export class MainScene extends Phaser.Scene {

    //just putting the world in here too, refactor later back to separate class
    private world: Array<Array<Phaser.GameObjects.Image>> | null = null;
    private worldWidth: integer | null = null;
    private worldHeight: integer | null = null;
    private tileWidthHalf: integer | null = null;
    private tileHeightHalf: integer | null = null;
    private centerX: integer | null = null;
    private centerY: integer | null = null;
    private playerPos: Coordinate = new Coordinate(50,50);

    //for key handling
    private keyboard = Phaser.Input.Keyboard;
    private downKey: Phaser.Input.Keyboard.Key | null = null;
    private upKey: Phaser.Input.Keyboard.Key | null = null;
    private leftKey: Phaser.Input.Keyboard.Key | null = null;
    private rightKey: Phaser.Input.Keyboard.Key | null = null;
    private spaceKey: Phaser.Input.Keyboard.Key | null = null;

    private controls: Phaser.Cameras.Controls.SmoothedKeyControl | null = null;


    constructor() {
        super({
            key: "MainScene"
        });

    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.load.image("emptyTile", 'assets/graphics/empty_tile.png')
        this.load.image("playerTile", 'assets/graphics/player_tile.png')
        this.load.image("serverTile", '/assets/graphics/server.png')
        this.load.image("brokenServerTile", 'assets/graphics/server.png');
    }

    create(): void {
        //set camera
        this.cameras.main.setViewport(0,0,1024,800);
        this.cameras.main.setScroll(42,42);

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

        this.world = new Array();
        for (let i = 0; i < this.worldWidth; i++) {
            let inner = new Array();
            for (let j = 0; j < this.worldHeight; j++) {
                let tc = this.getWorldToScreenCoords(new Coordinate(i, j));

                let tileType = (Math.random() < 0.42) ? 'serverTile' : 'emptyTile';

                let tile = this.add.image(tc.x, tc.y, tileType);

                tile.setData('tileType', tileType);

                tile.setData('row', i);
                tile.setData('col', j);

                tile.setDepth(this.centerY + tc.y);

                inner.push(tile);
            }
            this.world.push(inner);
        }

        //todo init player
        //this player tile is just for testing the game logic until we have a player done
        this.playerPos = new Coordinate(21,21);
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

        this.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        this.cameras.main.zoom = 0.2;
    }
    
    update(time: number, delta: number) {
        
        let oldPlayerPos = new Coordinate(this.playerPos.x,this.playerPos.y);
        let moved = false;

        //handle keyboard input
        if(this.keyboard.JustDown(this.downKey!)) {
            this.playerPos.y++;
            moved = true;
        }
        if(this.keyboard.JustDown(this.upKey!)) {
            this.playerPos.y--;
            moved = true;
        }
        if(this.keyboard.JustDown(this.leftKey!)) {
            this.playerPos.x--;
            moved = true;
        }
        if(this.keyboard.JustDown(this.rightKey!)) {
            this.playerPos.x++;
            moved = true;
        }

        //update player //todo obviously should be proper movement checking and such
        if(moved) {
            let playerTile = this.world![this.playerPos!.x][this.playerPos!.y];
            this.world![this.playerPos!.x][this.playerPos!.y].setTexture('playerTile');
            this.world![oldPlayerPos!.x][oldPlayerPos!.y].setTexture('emptyTile');
        }

        //update camera
        let cameraCenter = this.getWorldToScreenCoords(this.playerPos);
        this.cameras.main.setScroll(cameraCenter.x, cameraCenter.y);
    }

    getWorldToScreenCoords(c:Coordinate):Coordinate {
        return new Coordinate(
            (c.x - c.y) * this.tileWidthHalf! + this.centerX!,
            (c.x + c.y) * this.tileHeightHalf! + this.centerY!
        );
    }
}

