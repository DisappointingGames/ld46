import { World } from "../World";
import { WorldRenderer} from "../WorldRenderer"
import { Scene } from "phaser";
import { Coordinate } from "../Coordinate";
import { CellType } from "../CellType";

export class MainScene extends Phaser.Scene {

    private world: World;

    //for key handling
    private keyboard = Phaser.Input.Keyboard;
    private downKey: Phaser.Input.Keyboard.Key | null = null;
    private upKey: Phaser.Input.Keyboard.Key | null = null;
    private leftKey: Phaser.Input.Keyboard.Key | null = null;
    private rightKey: Phaser.Input.Keyboard.Key | null = null;
    private spaceKey: Phaser.Input.Keyboard.Key | null = null;

    //just for testing, later should depend on player position
    private camerapos = new Coordinate(100,100);


    private tileWidth = 88;
    private borderOffset = new Coordinate(250,50);//to centralise the isometric level display


    constructor() {
        super({
            key: "MainScene"
        });

        this.world = new World(100,100);
    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.load.image("emptyTile", 'assets/graphics/server_trimmed.png')
        this.load.image("serverTile", '/assets/graphics/server_trimmed.png')
        this.load.image("brokenServerTile", 'assets/graphics/server_trimmed.png');
    }

    create(): void {
        //set camera
        this.cameras.main.setScroll(100,100);

        //define keyboard input
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //initial drawing
        for (var i = 0; i < this.world.cells.length; i++) {
            for (var j = 0; j < this.world.cells[i].length; j++) {
                if (this.world.cells[i][j].celltype != CellType.Empty) {
                    this.drawTileIso(this.world.cells[i][j].celltype, i, j);
                }
            }
        }
    }
    
    drawTileIso(celltype: CellType, i: number, j: number) {
        var cartPt = new Coordinate(j*this.tileWidth, i*this.tileWidth);
        let isoPt = this.cartesianToIsometric(cartPt);
        
        let wallHeight = 300;
        let borderOffset = new Coordinate(32,32);

        this.add.sprite(isoPt.x+borderOffset.x, isoPt.y+borderOffset.y-wallHeight, "serverTile");
    }

    cartesianToIsometric(c: Coordinate): Coordinate {
        return new Coordinate(c.x-c.y, (c.x+c.y)/2);
    }

    update(time: number, delta: number) {
        //handle keyboard input
        if(this.downKey?.isDown) {
            this.world.moveDown();
        }
        if(this.upKey?.isDown) {
            this.world.moveUp();
        }
        if(this.leftKey?.isDown) {
            this.world.moveLeft();
        }
        if(this.rightKey?.isDown) {
            this.world.moveRight();
        }

        this.cameras.main.setScroll(this.world.playerPos.x, this.world.playerPos.y);
    }
}

