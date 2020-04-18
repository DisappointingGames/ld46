export class MenuScene extends Phaser.Scene {

    constructor() {
        super({
            key: "MenuScene"
        });
    }

    preload(): void {
        
    }

    create(): void {
        this.add.text(256 + 64, 256 + 128, "Test title screen!\n\n\nClick Anywhere to start!").setScale(1);

        this.input.once('pointerdown', function () {

            // @ts-ignore 
            this.scene.start('MainScene');            

        }, this);
    }
}
