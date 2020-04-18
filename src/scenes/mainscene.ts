export class MainScene extends Phaser.Scene {

    constructor() {
        super({
            key: "MainScene"
        });
    }

    preload(): void {
        
    }

    create(): void {
        this.add.text(256 + 64, 256 + 128, "This is the main screen for the game").setScale(1);
    }
}
