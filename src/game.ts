import 'phaser';
import { MenuScene } from './scenes/menuscene';
import { MainScene } from './scenes/mainscene';
import { HUDScene } from './scenes/HUDScene';

export default class Demo extends Phaser.Scene
{
    constructor () {
        super('demo');
    }
    preload () {        
        
    }
    create () {        
        
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#636363',
    width: 1024,
    height: 800,
    scene: [MenuScene, MainScene, HUDScene], 
    input: { 
        mouse: true
    }
};

const game = new Phaser.Game(config);
