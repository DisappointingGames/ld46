export class HUDScene extends Phaser.Scene {

    constructor() {
        super({ key: 'HUDScene', active: true });
    }

    //private mainScene: MainScene | null = null;
    private scoreText: Phaser.GameObjects.Text | null = null;
    private serverText: Phaser.GameObjects.Text | null = null;


    preload(): void {

    }

    create(): void {
        this.scoreText = this.add.text(64, 64,
            "Score: 0")
            .setScale(1);

        this.serverText = this.add.text(64, 80,
            "Nr Broken Servers: 0")
            .setScale(1);

        let mainScene = this.scene.get('MainScene');
        mainScene.events.on('updateHUD', this.updateHUD, this);
    }

    updateHUD(score: integer, nrBrokenServers: integer): void {
        this.scoreText!.setText("Score: " + score);
        this.serverText!.setText("Nr Broken Servers: " + nrBrokenServers);
    }
}
