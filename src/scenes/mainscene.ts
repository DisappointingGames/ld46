import { World } from "../World";
import { Renderer } from "phaser";

export class MainScene extends Phaser.Scene {

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        
    }

    create(): void {
        this.add.text(256 + 64, 256 + 128, "Go find the server and fix it").setScale(1);


        let world = new World(100, 100);

        this.render(world)
    }

    render(world: World) {
        
    }
}
