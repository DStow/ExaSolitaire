export class CardSlot {
    slot = -1;
    width = 245;
    height= 335;
    cards = [];

    constructor(slot) {
        this.slot = slot;
    }

    draw(ctx) {
        // Draw a polygon
        ctx.beginPath();
        ctx.lineWidth = "5";

        ctx.strokeStyle = "black"; // Green path
        ctx.setLineDash([15, 15]);

        let xPos = 30 + (this.slot * (this.width + 30));
        let yPos = 20;

        ctx.moveTo(10 + xPos, yPos); // tl
        ctx.lineTo(235 + xPos, yPos); // tr
        ctx.lineTo(245 + xPos, 15 + yPos); //trc
        ctx.lineTo(245 + xPos, 325 + yPos); //br
        ctx.lineTo(235 + xPos, 335 + yPos); //brc
        ctx.lineTo(10 + xPos, 335 + yPos);
        ctx.lineTo(0 + xPos, 325 + yPos);
        ctx.lineTo(0 + xPos, 15 + yPos);
        ctx.lineTo(10 + xPos, yPos);
        ctx.stroke(); // Draw it
    }
}