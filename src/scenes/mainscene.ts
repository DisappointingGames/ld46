import { World } from "../World";
import { WorldRenderer} from "../WorldRenderer"
import { Scene } from "phaser";

export class MainScene extends Phaser.Scene {

    private renderers?: Renderers 
    private gameState?: GameState 


    private serverTile?: Phaser.Loader.LoaderPlugin;

    constructor() {
        super({
            key: "MainScene"
        });
    }

    

    preload(): void {
        this.serverTile = this.load.image("waah", 'assets/graphics/server.png')
        
    }

    create(): void {
        this.add.text(256 + 64, 256 + 128, "Go find the server and fix it").setScale(1);


        let world = new World(100, 100);

        this.renderers = new Renderers(this)
        this.gameState = new GameState(world)
        // this.renderers.worldRenderer.render(this, this.gameState.world)

        
        
     
            
    }

    loop(): void {

    }

    update(time: number, delta: number) {
        //this.renderers!!.worldRenderer.render(this, this.gameState!!.world) 
        
        this.add.image(
            10,
            10,
            "waah"
        )   
    }

    
}

class Renderers {
    public readonly worldRenderer: WorldRenderer;

    constructor(scene: Scene) {
        this.worldRenderer = new WorldRenderer(scene);            
    }
}

class GameState {
    public readonly world: World

    constructor(world: World) {
        this.world = world
    }
}