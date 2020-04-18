export class MenuScene extends Phaser.Scene {

    constructor() {
        super({
            key: "MenuScene"
        });
    }

    preload(): void {
        this.load.image('background', '../assets/graphics/Background/Background.png');
        this.load.image('sun', '../assets/graphics/Background/Sun.png');
        this.load.image('cloud-big', '../assets/graphics/Background/Cloud-big.png');
        this.load.image('tree', '../assets/graphics/Background/tree2.png');
        this.load.image('tilesprite', '../assets/graphics/block-floor.png');
    }

    create(): void {
        this.add.sprite(0, 0, 'background').setOrigin(0, 0);
        this.add.sprite(256 - 64, 256 - 64, 'sun').setScale(0.5);
        this.add.sprite(512 + 256, 256, 'cloud-big').setScale(0.5);
        this.add.sprite(128, 512 + 128, 'tree').setScale(0.5);

        this.add.text(256 + 64, 256 + 128, "Z/X to rotate\nArrows to move blocks\n\nFix the road before you fall!\n\n\nClick Anywhere to start!").setScale(2);

        this.add.tileSprite(0, 896, 1024 * 16, 1024, 'tilesprite').setScale(0.25);

        this.input.once('pointerdown', function () {

            // @ts-ignore 
            this.scene.start('MainScene');            

        }, this);
    }
}
