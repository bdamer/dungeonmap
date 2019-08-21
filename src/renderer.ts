import { Dungeon, Cell, CellFlavor } from './dungeon';
import { Direction, rgbToHex } from './util';

export class Renderer {

    readonly scale = 32;

    ctx : CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
    }

    render(dungeon: Dungeon) {
        let offset = 0;
        const scalar = dungeon.width / (2 * dungeon.zones.length);
        for (let i = 0; i < dungeon.zones.length; i++) {
            this.ctx.fillStyle = rgbToHex(offset * scalar, offset * scalar, offset * scalar);
            this.ctx.fillRect(offset * this.scale, 0, dungeon.zones[i].range * this.scale, dungeon.height * this.scale);
            offset += dungeon.zones[i].range;
        }

        for (let i = 0; i < dungeon.cells.length; i++) {
            const cell = dungeon.cells[i];
            if (cell == null) {
                continue;
            }
			// FILL
            switch (cell.flavor) {
            case CellFlavor.Regular:
                this.ctx.fillStyle = "#dddddd";
				this.renderCell(cell);
                break;
            case CellFlavor.Seed:
                this.ctx.fillStyle = "#ffa214";
				this.renderCell(cell);
                break;
            case CellFlavor.Corridor:
				this.renderCorridor(cell);
                break;
            }
		}
    }
	
	renderCell(cell: Cell) {
		if (cell.cluster != null) {
			this.ctx.fillStyle = cell.cluster;
		}
        this.ctx.fillRect(cell.x * this.scale, cell.y * this.scale, this.scale, this.scale);

		// WALLS
		this.ctx.strokeStyle = "#999999";
		this.ctx.lineWidth = 1;
		let upRel = cell.neighbors[Direction.Up];
		if (upRel == null || !upRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo(cell.x * this.scale, cell.y * this.scale);
			this.ctx.lineTo((cell.x + 1) * this.scale, cell.y * this.scale);
			this.ctx.stroke();
		}
		let rightRel = cell.neighbors[Direction.Right];
		if (rightRel == null || !rightRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo((cell.x + 1) * this.scale, cell.y * this.scale);
			this.ctx.lineTo((cell.x + 1) * this.scale, (cell.y + 1) * this.scale);
			this.ctx.stroke();
		}
		let downRel = cell.neighbors[Direction.Down];
		if (downRel == null || !downRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo(cell.x * this.scale, (cell.y + 1) * this.scale);
			this.ctx.lineTo((cell.x + 1) * this.scale, (cell.y + 1) * this.scale);
			this.ctx.stroke();
		}
		let leftRel = cell.neighbors[Direction.Left];
		if (leftRel == null || !leftRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo(cell.x * this.scale, cell.y * this.scale);
			this.ctx.lineTo(cell.x * this.scale, (cell.y + 1) * this.scale);
			this.ctx.stroke();
		}
	}
	
	renderCorridor(cell: Cell) {
		if (cell.cluster != null) {
			this.ctx.strokeStyle = cell.cluster;
		}
		this.ctx.lineWidth = 10;
		
		let upRel = cell.neighbors[Direction.Up];
		if (upRel != null && upRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo((cell.x + 0.5) * this.scale, cell.y * this.scale);
			this.ctx.lineTo((cell.x + 0.5) * this.scale, (cell.y + 0.5) * this.scale);
			this.ctx.stroke();
		}
		let rightRel = cell.neighbors[Direction.Right];
		if (rightRel != null && rightRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo((cell.x + 0.5) * this.scale, (cell.y + 0.5) * this.scale);
			this.ctx.lineTo((cell.x + 1) * this.scale, (cell.y + 0.5) * this.scale);
			this.ctx.stroke();
		}
		let downRel = cell.neighbors[Direction.Down];
		if (downRel != null && downRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo((cell.x + 0.5) * this.scale, (cell.y + 0.5) * this.scale);
			this.ctx.lineTo((cell.x + 0.5) * this.scale, (cell.y + 1) * this.scale);
			this.ctx.stroke();
		}
		let leftRel = cell.neighbors[Direction.Left];
		if (leftRel != null && leftRel.linked) {
			this.ctx.beginPath();
			this.ctx.moveTo(cell.x * this.scale, (cell.y + 0.5) * this.scale);
			this.ctx.lineTo((cell.x + 0.5) * this.scale, (cell.y + 0.5) * this.scale);
			this.ctx.stroke();
		}		
	}
}