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
    }
}
