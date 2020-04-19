import { MainScene } from "./mainscene";

export class HUDScene extends Phaser.Scene {

    //private mainScene: MainScene | null = null;
    private four: integer | null = null;
    private scoreText: Phaser.GameObjects.Text | null = null;
    private serverText: Phaser.GameObjects.Text | null = null;
    
    constructor(/*mainScene: MainScene*/ four: integer) {
        super({
            key: "HUDScene"
        });
        //this.mainScene = mainScene;
        this.four = four;
    }

    preload(): void {
    }

    create(): void {
        this.scoreText = this.add.text(64, 64,
            "Score: ")
            .setScale(1);
            
        this.serverText = this.add.text(64, 80,
            "Nr Broken Servers: ")
            .setScale(1);                    
    }

    update(): void {
        this.scoreText?.setText("Score: " + this.four);
        //this.scoreText?.setText("Score: " + this.mainScene?.score);
        //this.serverText?.setText("Nr Broken Servers: " + this.mainScene?.nrBrokenServers);
    }
}
