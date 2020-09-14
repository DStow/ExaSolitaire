export class CardSlot {
    slot = -1;
    width = 245;
    height= 335;
    cards = [];

    constructor(slot) {
        this.slot = slot;
    }

    getXPos() {
       return 30 + (this.slot * (this.width + 30));
    }

    getYPos() {
        return 20;
    }

    draw(ctx) {
        this.drawCardSlot(ctx);

        for(var i = 0; i < this.cards.length; i++) {
            this.cards[i].draw(ctx, this, i * 80); // 80 is the vertical offset between stacked cards
        }
    }

    drawCardSlot(ctx) {
        // Draw a polygon
        ctx.beginPath();
        ctx.lineWidth = "5";

        ctx.strokeStyle = "black"; // Green path
        ctx.setLineDash([15, 15]);

        let xPos = this.getXPos();
        let yPos = this.getYPos();

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


        ctx.font = "40px Arial";
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";
        ctx.fillText(this.cards.length, 35 + xPos, 15 + yPos);
    }

    getSelectedCardStack(x, y) {
        for(var i = this.cards.length - 1; i >= 0; i--) {
            if(this.cards[i].containsPos(x,y)) {
                // Check if can be moved
                if(this.cards[i].getCanChildrenBeMoved()) {
                    return this.cards[i];
                } else {
                    return;
                }
            };
        }

        return;
    }
}