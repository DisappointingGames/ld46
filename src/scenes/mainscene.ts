import { World } from "../World";
import { Scene } from "phaser";
import { Coordinate } from "../Coordinate";
import { CellType } from "../CellType";
import { Cell } from "../Cell";

export class MainScene extends Phaser.Scene {

    //just putting the world in here too, refactor later back to separate class
    private world: Array<Phaser.GameObjects.Image> | null = null;
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

    //just for testing, later should depend on player position
    private camerapos = new Coordinate(100,100);

    private borderOffset = new Coordinate(250,50);//to centralise the isometric level display
    private controls: Phaser.Cameras.Controls.SmoothedKeyControl | null = null;


    constructor() {
        super({
            key: "MainScene"
        });

    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.load.image("emptyTile", 'assets/graphics/server_trimmed.png')
        this.load.image("serverTile", '/assets/graphics/server_trimmed.png')
        this.load.image("brokenServerTile", 'assets/graphics/server_trimmed.png');
    }

    create(): void {
        //set camera
        this.cameras.main.setScroll(42,42);

        //define keyboard input
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //initial world building
        this.worldWidth = 100;
        this.worldHeight = 100;

        this.tileWidthHalf = 88;
        this.tileHeightHalf = 150;

        this.centerX = (this.worldWidth / 2) * this.tileWidthHalf;
        this.centerY = -100;

        this.world = new Array();
        for (let i = 0; i < this.worldWidth; i++) {
            for (let j = 0; j < this.worldHeight; j++) {
                let tx = (i - j) * this.tileWidthHalf;
                let ty = (i + j) * this.tileHeightHalf;

                let tileType = (i%3==0 && j%3==0) ? 'serverTile' : 'emptyTile';
                let tile = this.add.image(this.centerX + tx, this.centerY + ty, tileType);

                tile.setData('row', i);
                tile.setData('col', j);

                tile.setDepth(this.centerY + ty);

                this.world.push(tile);
            }            
        }

        //todo init player
        this.playerPos = new Coordinate(50,50);

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

        this.cameras.main.zoom = 0.62;
        this.cameras.main.setScroll(5000,5000)
    }
    
    update(time: number, delta: number) {
        
        this.controls?.update(delta);
        
        //handle keyboard input
        if(this.downKey?.isDown) {
            this.playerPos.y++;
        }
        if(this.upKey?.isDown) {
            this.playerPos.y--;
        }
        if(this.leftKey?.isDown) {
            this.playerPos.x++;
        }
        if(this.rightKey?.isDown) {
            this.playerPos.x--;
        }

        //this.cameras.main.setScroll(this.playerPos.x, this.playerPos.y);

    }

}

