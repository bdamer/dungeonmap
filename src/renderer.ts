import { Map, Cell, CellFlavor } from './map';
import { rgbToHex } from './util';

export class Renderer {

    readonly scale = 32;

    ctx : CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
    }

    render(map: Map) {
        let offset = 0;
        const scalar = map.width / (2 * map.zones.length);
        for (let i = 0; i < map.zones.length; i++) {
            this.ctx.fillStyle = rgbToHex(offset * scalar, offset * scalar, offset * scalar);
            this.ctx.fillRect(offset * this.scale, 0, map.zones[i].range * this.scale, map.height * this.scale);
            offset += map.zones[i].range;
        }

        for (let i = 0; i < map.cells.length; i++) {
            const cell = map.cells[i];
            if (cell == null) {
                continue;
            }
            switch (cell.flavor) {
            case CellFlavor.Regular:
                this.ctx.fillStyle = "#c7cfdd";
                break;
            case CellFlavor.Corridor:
                this.ctx.fillStyle = "#858585";
                break;
            case CellFlavor.Seed:
                this.ctx.fillStyle = "#ffa214";
                break;
            }
            this.ctx.fillRect(cell.x * this.scale, cell.y * this.scale, this.scale, this.scale);
        }
    }
}