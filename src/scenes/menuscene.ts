export class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: "MenuScene"
        });
    }

    preload(): void {        
    }
    create(): void {
        this.add.text(256 + 64, 256 + 128, 
            "Keep the datacenter alive!\n\n\nClick Anywhere to start!")
            .setScale(1);

        this.input.once('pointerdown', this.loadScene, this);
    }

    loadScene() {
        this.scene.start('MainScene');
    }
}
