import { World } from "../World";
import { WorldRenderer} from "../WorldRenderer"
import { Scene } from "phaser";

export class MainScene extends Phaser.Scene {

    private renderers: Renderers | any = null
    private gameState: GameState | any = null

    constructor() {
        super({
            key: "MainScene"
        });
    }

    // noinspection JSUnusedGlobalSymbols
    preload(): void {
        this.renderers = new Renderers(this)
    }

    create(): void {
        this.add.text(256 + 64, 256 + 128, "Go find the server and fix it").setScale(1);

        let world = new World(100, 100);

        this.gameState = new GameState(world)
    }

    update(time: number, delta: number) {
        this.renderers.worldRenderer.render(this, this.gameState.world)
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
