export class Coordinate {
    public x: integer;
    public y: integer;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    static overlaps(a: Coordinate, b:Coordinate):boolean {
        return ((a.x == b.x) && (a.y == b.y));
    }

    toString():string {
        return "x: " + this.x + " y: " + this.y;
    }
}
