import { Cell } from "./Cell";
import { CellType } from "./CellType";
import { Coordinate } from "./Coordinate";

export class World {
    
    public readonly width: integer;
    public readonly height: integer;

    public cells: Array<Array<Cell>>;

    constructor(width: number, height: number) {        
        this.width = width;
        this.height = height;

        this.cells = new Array();

        for (let i = 0; i < width; i++) {
            let inner = new Array<Cell>();
            for (let j = 0; j < height; j++) {
                inner.push(
                    new Cell(new Coordinate(i,j), CellType.BrokenServer)
                );                
            }
            this.cells.push(inner)            
        }
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

    getCellAt(c: Coordinate): Cell {
        return this.cells[c.x][c.y];
    }

    coordinates(): Array<Coordinate> {
        let coordinates = new Array<Coordinate>();
        for (let i = 0; i < this.width; i++) {            
            for (let j = 0; j < this.height; j++) {
                coordinates.push(
                    new Coordinate(i,j)
                );                
            }                   
        }
        return coordinates;
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
