import { Map, Cell, CellFlavor, Zone } from "./map";
import { Renderer } from "./renderer"; 
import { Generator } from "./generator";

const renderer = new Renderer(<HTMLCanvasElement>document.getElementById('map'));

function generate() {
    const map = new Map(30, 10);

    // Add zones
    const zones = <Array<number>>eval("[" + (<HTMLInputElement>document.getElementById("cellDensity")).value + "]");
    for (let i = 0; i < zones.length; i++) {
        map.zones.push(new Zone(10, zones[i]));
    }

    // Add seed cells
    const seedCells = <Array<Array<number>>>eval("[" + (<HTMLInputElement>document.getElementById("seedCells")).value + "]");
    seedCells.forEach(element => {
        map.cells.push(new Cell(element[0], element[1], CellFlavor.Seed));
    });

    // Initialize generator
    const gen = new Generator((<HTMLInputElement>document.getElementById("seed")).value);
    gen.margins = [ 1, 0, 1, 0 ];

    // Map generation
    gen.addCells(map);

    // Rendering
    renderer.render(map);
}

// Init event handlers
(<HTMLInputElement>document.getElementById("generate")).addEventListener('click', (e:Event) => generate());
