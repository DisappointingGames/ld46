export class HUDScene extends Phaser.Scene {

    constructor() {
        super({ key: 'HUDScene', active: true });
    }

    //private mainScene: MainScene | null = null;
    private scoreText: Phaser.GameObjects.Text | null = null;
    private serverText: Phaser.GameObjects.Text | null = null;

    private score: integer | null = null;
    private nrBrokenServers: integer | null = null;

    preload(): void {

    }

    create(): void {
        this.scoreText = this.add.text(64, 64,
            "Score: ")
            .setScale(1);

        this.serverText = this.add.text(64, 80,
            "Nr Broken Servers: ")
            .setScale(1);

        let mainScene = this.scene.get('MainScene');
        mainScene.events.on('fix', this.processFix, this);
        mainScene.events.on('break', this.processBreakage, this);
    }

    processFix(): void {
        this.score!++;
        this.nrBrokenServers!--;
        this.updateTexts();
    }

    processBreakage(): void {
        this.nrBrokenServers!++;
        this.updateTexts();
    }

    updateTexts() {
        this.scoreText!.setText("Score: " + this.score);
        this.serverText!.setText("Nr Broken Servers: " + this.nrBrokenServers);
    }

    update(): void {

    }
}
