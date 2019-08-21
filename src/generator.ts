import { Dungeon, Cell, CellRel, CellFlavor } from "./dungeon";
import { Direction, Vector2, rgbToHex } from "./util";


// Cluster of cells
class Cluster {

    // Both ID and color
    id : string;
	// Cells that are part of this cluster 
	cells: Cell[];
	// Center cell of this cluster 
	center: Cell;

    constructor() { 
        this.id = rgbToHex(
            Math.floor(Math.random() * 256), 
            Math.floor(Math.random() * 256), 
            Math.floor(Math.random() * 256));
		this.cells = [];
    }
	
	findCenter(optimum: Vector2) {
		let best = -1;
		this.cells.forEach(cell => {
			const x = (cell.x - optimum.x) * (cell.x - optimum.x);
			const y = (cell.y - optimum.y) * (cell.y - optimum.y);
			const dist = Math.sqrt(x + y);
			if (best == -1 || dist < best) {
				this.center = cell;
				best = dist;
			}
		});
	}
}

export class Generator {

    // left, top, right, bottom margins
    margins: number[];
    // Seeded random number generator
    rng: any;
	// List of cell clusters
	clusters: Map<string,Cluster>;

    constructor(public seed: string) {
        const seedrandom = require('seedrandom');
        this.rng = seedrandom(seed);
        this.margins = [ 0, 0, 0, 0 ];
		this.clusters = new Map<string,Cluster>();
    }

    /**
     * Adds cells to the provided map.
     * 
     * @param map The map.
     */
    addCells(dungeon: Dungeon) {
        let zone_idx = -1;
        let zone_max = 0;
        for (let x = this.margins[0]; x < (dungeon.width - this.margins[2]); x++) {
            if (x >= zone_max) { // shift to next zone
                zone_idx++;
                zone_max += dungeon.zones[zone_idx].range;
            }

            for (let y = this.margins[1]; y < (dungeon.height - this.margins[3]); y++) {
                let idx = y * dungeon.width + x;
                if (dungeon.cells[idx] != null) {
                    continue;                    
                }
                if (dungeon.zones[zone_idx].density > this.rng()) {
                    dungeon.cells[idx] = new Cell(x, y, CellFlavor.Regular);
                }
            }
        }
    }

    /**
     * Populates neighbor relationship between cells.
     * 
     * @param map The map.
     */
    identifyNeighbors(dungeon: Dungeon) {
        for (let y = 0; y < dungeon.height - 1; y++)
        {
            for (let x = 0; x < dungeon.width - 1; x++)
            {
                // populate neighbors to the right and down
                const idx = y * dungeon.width + x;
                const cell = dungeon.cells[idx];
                if (cell == null) {
                    continue;
                }
                // right
                const right_cell = dungeon.cells[idx + 1];
                if (right_cell != null) {
                    cell.neighbors[Direction.Right] = new CellRel(cell, right_cell);
                    right_cell.neighbors[Direction.Left] = new CellRel(right_cell, cell);
                }
                // down
                const down_cell = dungeon.cells[idx + dungeon.width];
                if (down_cell != null) {
                    cell.neighbors[Direction.Down] = new CellRel(cell, down_cell);
                    down_cell.neighbors[Direction.Up] = new CellRel(down_cell, cell);
                }
            }
        }
    }

    clusterWalk(dungeon: Dungeon, cell: Cell, cluster: Cluster) {
        if (cell.visited)
            return; // we're done
        if (cluster == null) {
            cluster = new Cluster();
			this.clusters.set(cluster.id, cluster);
        }
        cell.visited = true;
        cell.cluster = cluster.id;
		cluster.cells.push(cell);
		// Walk each linked neighbor
        for (let i = 0; i < 4; i++) {
			let rel = cell.neighbors[i];
			if (rel != null && rel.linked) {
				this.clusterWalk(dungeon, rel.to, cluster);
			}
		}		
    }

	// Performs initial clustering
    generateClusters(dungeon: Dungeon) {
		this.clusters = new Map<string,Cluster>();
        dungeon.cells.forEach(cell => { cell.visited = false; });
        // cluster
        dungeon.cells.forEach(cell => { 
            if (cell.visited)
                return;
            // Create new cluster & walk
            this.clusterWalk(dungeon, cell, null);		
        });
		// for each cluster, determine point closest to center of dungeon
		this.clusters.forEach(cluster => cluster.findCenter(new Vector2(dungeon.width / 2, dungeon.height / 2)));		
    }
	
	linkClusters(dungeon: Dungeon) {
		if ((this.clusters == null) || (this.clusters.size < 2))
			return; // nothing to do

		// Order clusters by number of cells
		let clusterList = Array.from(this.clusters.values());
		clusterList.sort((a, b) => { return a.cells.length - b.cells.length; });

		for (var i = 0; i < clusterList.length - 1; i++) {			
			const i_cell = clusterList[i].center;

			// find closest unlinked cluster
			let minDist = -1;
			let nearest_cluster = null;
			for (var j = i + 1; j < clusterList.length; j++) {
				const j_cell = clusterList[j].center;
				const dist = Math.sqrt((i_cell.x - j_cell.x) * (i_cell.x - j_cell.x) + (i_cell.y - j_cell.y) * (i_cell.y - j_cell.y));
				if (minDist == -1 || dist < minDist) {
					minDist = dist;
					nearest_cluster = clusterList[j];
				}
			}
			
			// connect this cluster to nearest cluster 
			this.connectCluster(dungeon, clusterList[i], nearest_cluster);	
			break;			
		}		
	}

	connectCluster(dungeon: Dungeon, from: Cluster, to: Cluster) {
		let done : boolean = false;
		let cell : Cell = from.center;
		
		// console.log("=== Connect ", from.id, "@", from.center.x, ",", from.center.y, " to ", to.id, "@", to.center.x, ",", to.center.y, "===");
		while (!done)
		{
			let dx = to.center.x - cell.x;
			let dy = to.center.y - cell.y;
			let nx : number, ny : number;
			let dir : Direction = null, inverseDir : Direction = null;
			if (Math.abs(dx) > Math.abs(dy)) // move in x direction
			{
				nx = cell.x + Math.sign(dx);
				ny = cell.y;
				dir = Math.sign(dx) == 1 ? Direction.Right : Direction.Left;
				inverseDir = Math.sign(dx) == 1 ? Direction.Left : Direction.Right;
			}
			else // move in y direction
			{
				nx = cell.x;
				ny = cell.y + Math.sign(dy);
				dir = Math.sign(dy) == 1 ? Direction.Down : Direction.Up;
				inverseDir = Math.sign(dy) == 1 ? Direction.Up : Direction.Down;
			}

			// 3 cases based on next cell type
			let next = dungeon.cells[ny * dungeon.width + nx];
			if (next == null) // next cell is empty
			{
				// Create link cell
				next = new Cell(nx, ny, CellFlavor.Corridor);
				next.cluster = from.id; // make next a member of current cluster
				from.cells.push(next);
				next.neighbors[inverseDir] = new CellRel(next, cell);
				next.neighbors[inverseDir].linked = true;
				cell.neighbors[dir] = new CellRel(cell, next);
				cell.neighbors[dir].linked = true;
				dungeon.cells[ny * dungeon.width + nx] = next;				
				cell = next;
			}
			else if (next.cluster != from.id) // next cell is another cluster - connect the two
			{
				next.neighbors[inverseDir] = new CellRel(next, cell);
				next.neighbors[inverseDir].linked = true;				
				cell.neighbors[dir] = new CellRel(cell, next);
				cell.neighbors[dir].linked = true;
				
				// larger cluster will take over smaller
				let actualCluster = this.clusters.get(next.cluster);
				if (actualCluster.cells.length > from.cells.length) {
					from.cells.forEach(cell => {
						cell.cluster = actualCluster.id;
						actualCluster.cells.push(cell);
					});
					this.clusters.delete(from.id);					
					actualCluster.findCenter(new Vector2(dungeon.width / 2, dungeon.height / 2));
				} else {
					actualCluster.cells.forEach(cell => {
						cell.cluster = from.id;
						from.cells.push(cell);
					});
					this.clusters.delete(actualCluster.id);
					from.findCenter(new Vector2(dungeon.width / 2, dungeon.height / 2));					
				}
				done = true; // and we're done
			}
			// next cell is part of our cluster - continue moving
			else if (next.cluster == from.id)
			{
				// if current room is a link, connect it to next room
				if (next.flavor == CellFlavor.Corridor) {
					next.neighbors[inverseDir] = new CellRel(next, cell);
					next.neighbors[inverseDir].linked = true;				
					cell.neighbors[dir] = new CellRel(cell, next);
					cell.neighbors[dir].linked = true;					
				}
				if (cell == next) {
					from.findCenter(new Vector2(dungeon.width / 2, dungeon.height / 2));
					done = true;
				}
				cell = next;				
			}
		}
	}
}