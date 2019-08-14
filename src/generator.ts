import { Map, Cell, CellFlavor } from "./map";

export class Generator {

    // left, top, right bottom margins
    margins: number[];
    // Random
    rng: any;

    constructor(public seed: string) {
        const seedrandom = require('seedrandom');
        this.rng = seedrandom(seed);
        this.margins = [ 0, 0, 0, 0 ];
    }

    /**
     * Adds cells to the provided map.
     * 
     * @param map The map.
     */
    addCells(map: Map) {
        let zone_idx = -1;
        let zone_max = 0;
        for (let x = this.margins[0]; x < (map.width - this.margins[2]); x++) {
            if (x >= zone_max) { // shift to next zone
                zone_idx++;
                zone_max += map.zones[zone_idx].range;
            }

            for (let y = this.margins[1]; y < (map.height - this.margins[3]); y++) {
                let idx = y * map.width + x;
                if (map.cells[idx] != null) {
                    continue;                    
                }
                if (map.zones[zone_idx].density > this.rng()) {
                    map.cells[idx] = new Cell(x, y, CellFlavor.Regular);
                }
            }
        }
    }
}