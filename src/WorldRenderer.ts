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

    // needs to be called in preload magic
    constructor(scene: Scene) {
        this.scene = scene;
        // 300x300 tiles
        
        /*this.emptyTile = scene.load.image("emptyTile", 'assets/graphics/server.png')
        this.serverTile = scene.load.image("serverTile", '/assets/graphics/server.png')
        this.brokenServerTile = scene.load.image("brokenServerTile", 'assets/graphics/server.png');
        */
       
        this.tileWidth = 32;
        // 176x300 tiles
        this.emptyTile = scene.load.image("emptyTile", 'assets/graphics/server_trimmed.png')
        this.serverTile = scene.load.image("serverTile", '/assets/graphics/server_trimmed.png')
        this.brokenServerTile = scene.load.image("brokenServerTile", 'assets/graphics/server_trimmed.png');
    }

    render(currentScene: Scene, world: World) {
        console.log(this.serverTile)

        for (var i = 0; i < world.cells.length; i++) {
            for (var j = 0; j < world.cells[i].length; j++) {
                if (world.cells[i][j].celltype != CellType.Empty) {
                    this.drawTileIso(currentScene, world.cells[i][j].celltype, i, j);
                }
            }
        }
    }

    drawTileIso(currentScene: Scene, celltype: CellType, i: number, j: number) {
        var cartPt = new Coordinate(j*this.tileWidth, i*this.tileWidth);
        let isoPt = this.cartesianToIsometric(cartPt);
        
        let wallHeight = 48;
        let borderOffset = new Coordinate(32,32);

        currentScene.add.image(isoPt.x+borderOffset.x, isoPt.y+borderOffset.y-wallHeight, "serverTile");
    }

    cartesianToIsometric(c: Coordinate): Coordinate {
        return new Coordinate(c.x-c.y, (c.x+c.y)/2);
    }

}
