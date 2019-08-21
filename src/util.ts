
export enum Direction {
    Left = 0,
    Up = 1,
    Right = 2,
    Down = 3
}

export class Vector2 {
	constructor(public x: number, public y: number) { }
}

function toHex(c: number) : string {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) : string {
    return "#" + toHex(r) + toHex(g) + toHex(b);
}