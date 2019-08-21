
export enum CellFlavor {
    Regular,
    Corridor,
    Seed
}

// Models the relationship between two neighboring cells.
export class CellRel {
    linked: boolean;
    constructor(public from: Cell, public to: Cell) { }
}

export class Cell {
    // left, top, right, bottom
    neighbors: CellRel[];
    // flag to be used for clustering
    visited: boolean;
    // cluster id
    cluster: string;

    constructor(public x: number, public y: number, public flavor: CellFlavor) { 
        this.neighbors = [null,null,null,null];
    }
}

export class Zone {
    /**
     * Creates a new zone.
     * 
     * @param range The width of the zone.
     * @param density Chance to add a cell in this zone.
     */
    constructor(public range: number, public density: number) { }
}

export class Dungeon {

    cells: Cell[];
    zones: Zone[];

    constructor(public width: number, public height: number) {
        this.cells = new Array(width * height);
        this.zones = [];
    }
}