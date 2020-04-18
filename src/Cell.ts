import { Coordinate } from './Coordinate';
import { CellType } from './CellType';

export class Cell {
    public coordinate: Coordinate;
    public celltype: CellType;

    constructor(coordinate: Coordinate, celltype: CellType) {
        this.coordinate = coordinate;
        this.celltype = celltype;
    }

    break() {
        this.celltype = CellType.BrokenServer;
    }

    repair() {
        this.celltype = CellType.Server;
    }

    toString():string {
        return "Coordinate " + this.coordinate.toString + " type: " + this.celltype;
    }
}
