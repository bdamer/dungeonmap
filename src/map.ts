
export enum CellFlavor {
    Regular,
    Corridor,
    Seed
};

export class Cell {
    constructor(public x: number, public y: number, public flavor: CellFlavor) { }
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

export class Map {

    cells: Cell[];
    zones: Zone[];

    constructor(public width: number, public height: number) {
        this.cells = new Array(width * height);
        this.zones = [];
    }

}