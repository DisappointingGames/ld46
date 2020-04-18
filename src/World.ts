import { Cell } from "./Cell";
import { CellType } from "./CellType";

export class World {
    
    private width: integer;
    private height: integer;

    constructor(width: number, height: number) {        
        this.width = width;
        this.height = height;
    }

    /**
     * initialize world of default size with servers and walk space
     */
    initialize() {

    }

    /**
     * moving a wall. Idea is that you can only move repaired servers
     * if you disagree, just add brokenserver as an or in from.celltype
     * @param from 
     * @param to 
     */
    moveWall(from: Cell, to: Cell) {
        if(from.celltype == CellType.Server && (to.celltype == CellType.Empty || to.celltype == CellType.PowerUp)) {
            to.celltype = from.celltype;
            from.celltype = CellType.Empty;            
        }
    }

    /**
     * generate emergency event at random location in world
     */
    createEmergency() {
        
    }

    /**
     * increase the size of the world
     */
    increaseSize() {

    }
}
