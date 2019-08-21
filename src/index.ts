import { Dungeon, Cell, CellFlavor, Zone } from "./dungeon";
import { Renderer } from "./renderer"; 
import { Generator } from "./generator";

const renderer = new Renderer(<HTMLCanvasElement>document.getElementById('map'));
let dungeon : Dungeon = null;
let gen : Generator = null;

function createMap() {
    dungeon = new Dungeon(30, 10);

    // Add zones
    const zones = <Array<number>>eval("[" + (<HTMLInputElement>document.getElementById("cellDensity")).value + "]");
    for (let i = 0; i < zones.length; i++) {
        dungeon.zones.push(new Zone(10, zones[i]));
    }

    // Add seed cells
    const seedCells = <Array<Array<number>>>eval("[" + (<HTMLInputElement>document.getElementById("seedCells")).value + "]");
    seedCells.forEach(element => {
		let c = new Cell(element[0], element[1], CellFlavor.Seed);
        dungeon.cells[c.y * dungeon.width + c.x] = c;
    });

    // Initialize generator
    gen = new Generator((<HTMLInputElement>document.getElementById("seed")).value);
    gen.margins = [ 1, 0, 1, 0 ];

    // Map generation
    gen.addCells(dungeon);
    gen.identifyNeighbors(dungeon);
	
    // Rendering
    renderer.render(dungeon);
}

function cluster() {
    gen.generateClusters(dungeon);
    renderer.render(dungeon);
}

function link() {
	gen.linkClusters(dungeon);
    renderer.render(dungeon);
}

function decluster() {
	dungeon.cells.forEach(cell => { cell.cluster = null; });
	renderer.render(dungeon);
}

// Init event handlers
(<HTMLInputElement>document.getElementById("createMap")).addEventListener('click', (e:Event) => createMap());
(<HTMLInputElement>document.getElementById("cluster")).addEventListener('click', (e:Event) => cluster());
(<HTMLInputElement>document.getElementById("link")).addEventListener('click', (e:Event) => link());
(<HTMLInputElement>document.getElementById("decluster")).addEventListener('click', (e:Event) => decluster());


