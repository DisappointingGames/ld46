import { Scene } from "phaser";
import { World } from "./World";
import { CellType } from "./CellType";
import { Coordinate } from "./Coordinate";

export class WorldRenderer {

    private readonly emptyTile: Phaser.Loader.LoaderPlugin;
    private readonly serverTile: Phaser.Loader.LoaderPlugin;
    private readonly brokenServerTile: Phaser.Loader.LoaderPlugin;
    private readonly scene: Scene;

    private tileWidth: integer;
    private borderOffset = new Coordinate(250,50);//to centralise the isometric level display

    // needs to be called in preload magic
    constructor(scene: Scene) {
        this.scene = scene;
        
        // 176x300 tiles
        this.emptyTile = scene.load.image("emptyTile", 'assets/graphics/server_trimmed.png')
        this.serverTile = scene.load.image("serverTile", '/assets/graphics/server_trimmed.png')
        this.brokenServerTile = scene.load.image("brokenServerTile", 'assets/graphics/server_trimmed.png');
        
        this.tileWidth = 88;

        //scene.load.atlas('hero', 'https://dl.dropboxusercontent.com/s/hradzhl7mok1q25/hero_8_4_41_62.png?dl=0', 'https://dl.dropboxusercontent.com/s/95vb0e8zscc4k54/hero_8_4_41_62.json?dl=0');
        scene.load.image("player", "asserts/graphics/stickman.png");
    }

    render(currentScene: Scene, world: World, camerapos: Coordinate) {
        

        this.scene.cameras.main.setScroll(world.playerPos.x, world.playerPos.y);

        console.log(this.serverTile)

        for (var i = 0; i < world.cells.length; i++) {
            for (var j = 0; j < world.cells[i].length; j++) {
                if (world.cells[i][j].celltype != CellType.Empty) {
                    this.drawTileIso(currentScene, world.cells[i][j].celltype, i, j);
                }
            }
        }

        this.renderPlayer(currentScene, world);
    }

    renderPlayer(currentScene : Scene, world : World){    
        this.drawHeroIso(currentScene, world);
    }
    
    drawHeroIso(currentScene : Scene, world : World){
        var isoPt= new Coordinate(0,0);//It is not advisable to create points in update loop
        var heroCornerPt=new Coordinate(
            world.playerPos.x * this.tileWidth + (this.tileWidth/3),
            world.playerPos.y * this.tileWidth);
        isoPt=this.cartesianToIsometric(heroCornerPt);//find new isometric position for hero from 2D map position
        
        let borderOffset = new Coordinate(32,32);
        currentScene.add.sprite(isoPt.x+borderOffset.x, isoPt.y+borderOffset.y-40, 'player').setScale(2);
    }
    drawTileIso(currentScene: Scene, celltype: CellType, i: number, j: number) {
        var cartPt = new Coordinate(j*this.tileWidth, i*this.tileWidth);
        let isoPt = this.cartesianToIsometric(cartPt);
        
        let wallHeight = 300;
        let borderOffset = new Coordinate(32,32);

        currentScene.add.sprite(isoPt.x+borderOffset.x, isoPt.y+borderOffset.y-wallHeight, "serverTile");
    }

    cartesianToIsometric(c: Coordinate): Coordinate {
        return new Coordinate(c.x-c.y, (c.x+c.y)/2);
    }

}
