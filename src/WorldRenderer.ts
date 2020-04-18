import { Scene } from "phaser";
import { World } from "./World";

export class WorldRenderer {

    private readonly emptyTile: Phaser.Loader.LoaderPlugin;
    private readonly serverTile: Phaser.Loader.LoaderPlugin;
    private readonly brokenServerTile: Phaser.Loader.LoaderPlugin;
    private readonly scene: Scene;

    // needs to be called in preload magic
    constructor(scene: Scene) {
        this.scene = scene;
        // 300x300 tiles
        this.emptyTile = scene.load.image("emptyTile", 'assets/graphics/server.png')
        this.serverTile = scene.load.image("serverTile", '/assets/graphics/server.png')
        this.brokenServerTile = scene.load.image("brokenServerTile", 'assets/graphics/server.png');
    }
    
    render(currentScene: Scene, world: World) {
        console.log(this.serverTile)
        world.coordinates().map(c => {            
            currentScene.add.image(
              c.x * 300,
              c.y * 300,
              "serverTile"
          )        
        })
    }
}
