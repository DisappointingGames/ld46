import { World } from "../World";
import { WorldRenderer} from "../WorldRenderer"
import { Scene, GameObjects } from "phaser";
import { Coordinate } from "../Coordinate";
import { CellType } from "../CellType";

//Player sprite, if we want to change it between scenes
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

    private playerSprite = new GameObjects.Sprite(this, 0,0,'');


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
        
        //this.load.atlas('hero', 'https://dl.dropboxusercontent.com/s/hradzhl7mok1q25/hero_8_4_41_62.png?dl=0', 'https://dl.dropboxusercontent.com/s/95vb0e8zscc4k54/hero_8_4_41_62.json?dl=0');
    
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
        //this.addPlayer();
    }
    addPlayer(){    
        this.anims.create({ key: this.world.playerDir, frames: this.anims.generateFrameNames(this.world.playerDir), repeat: -1 });

        this.add.sprite(400,300, 'hero').setScale(1).play(this.world.playerDir);
        //this.drawHeroIso();
    }
    
drawHeroIso(){
    var isoPt= new Coordinate(0,0);//It is not advisable to create points in update loop
    var heroCornerPt=new Coordinate(
        this.world.playerPos.x * this.tileWidth + (this.tileWidth/3),
        this.world.playerPos.y * this.tileWidth);
    isoPt=this.cartesianToIsometric(heroCornerPt);//find new isometric position for hero from 2D map position
    
    let borderOffset = new Coordinate(32,32);
    this.add.sprite(isoPt.x+borderOffset.x, isoPt.y+borderOffset.y-40, 'hero').setScale(1).play(this.world.playerDir);
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
        var newDir = "";
        //handle keyboard input
        if(this.downKey?.isDown) {
            newDir = "north";
            this.world.moveDown();
        }
        if(this.upKey?.isDown) {
            newDir = "south";
            this.world.moveUp();
        }
        if(this.leftKey?.isDown) {
            newDir += "west";
            this.world.moveLeft();
        }
        if(this.rightKey?.isDown) {
            newDir += "east";
            this.world.moveRight();
        }
        this.world.playerDir = newDir;
        this.cameras.main.setScroll(this.world.playerPos.x, this.world.playerPos.y);
    }
}

