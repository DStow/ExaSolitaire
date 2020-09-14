import { CardSuits } from './enums.js';

export class Card {
    xPos = 0;
    yPos = 0;
    value = -1;
    selected = false;
    width = 245;
    height = 335;
    cardSuit = CardSuits.UNKNOWN;
    childCard;

    constructor(xPos, yPos, value, cardSuit) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.value = value;
        this.cardSuit = cardSuit;
    }

    draw(ctx, cardSlot, yOffset) {
        if (!this.selected) {
            this.xPos = cardSlot.getXPos();
            this.yPos = cardSlot.getYPos() + yOffset;
        }
        // Draw a polygon
        ctx.beginPath();
        ctx.lineWidth = "5";
        if (!this.selected) {
            ctx.strokeStyle = "black"; // Green path
            ctx.lineWidth = "5";
        } else {
            ctx.strokeStyle = "red";
            ctx.lineWidth = "10";
        }
        ctx.fillStyle = "#fff9e8";
        ctx.setLineDash([]);
        ctx.moveTo(10 + this.xPos, this.yPos); // tl
        ctx.lineTo(235 + this.xPos, this.yPos); // tr
        ctx.lineTo(245 + this.xPos, 15 + this.yPos); //trc
        ctx.lineTo(245 + this.xPos, 325 + this.yPos); //br
        ctx.lineTo(235 + this.xPos, 335 + this.yPos); //brc
        ctx.lineTo(10 + this.xPos, 335 + this.yPos);
        ctx.lineTo(0 + this.xPos, 325 + this.yPos);
        ctx.lineTo(0 + this.xPos, 15 + this.yPos);
        ctx.lineTo(10 + this.xPos, this.yPos);
        ctx.stroke(); // Draw it
        ctx.fill();

        // Draw number text
        ctx.font = "40px Arial";
        if (this.cardSuit > 2) {
            ctx.fillStyle = "red";
        } else {
            ctx.fillStyle = "black";
        }
        ctx.textBaseline = "top";
        ctx.fillText(this.value + " - " + this.getSuitName(this.cardSuit).substr(0, 3), 35 + this.xPos, 15 + this.yPos);

        ctx.fillText(this.getSuitName(this.cardSuit), this.xPos + (this.width / 2), this.yPos + (this.height / 2));

        ctx.fillText(this.value, 260 - 45 + this.xPos, 335 - 45 + this.yPos);
    }

    update(progress) {

    }

    containsPos(x, y) {
        return (x > this.xPos && x <= this.xPos + this.width
            && y > this.yPos && y <= this.yPos + this.height);

    }

    setPos(x, y) {
        this.xPos = x;
        this.yPos = y;
    }

    getSuitName(suit) {
        switch (suit) {
            case 1:
                return "Ace";
            case 2:
                return "Club";
            case 3:
                return "Heart";
            case 4:
                return "Diamond";
        }

        return "Unknown";
    }

    getIsPictureCard() {
        return this.value == "K" || this.value == "Q" || this.value == "J" || this.value == "A";
    }

    getCanChildrenBeMoved() {
        // As this doesn't have a child it can be moved no issue
        // ToDo: Will need to check if it's a completed picture card?
        if (!this.childCard) { return true; }

        if (this.getIsPictureCard()) {
            // Have to check if all the children are picture cards
            console.info("Checking if can tamble picture cards:");
            var result = this.tumbleChildrenPictureCards(this);
            console.info(result);
            return result;
        } else {
            console.info ("checking ica can tumble number cards:");
            var result = this.tumbleChildrenNumberCards(this);
            console.info(result);
            return result;
        }
    }

    tumbleChildrenPictureCards(card) {
        if (card.getIsPictureCard() == false) { return false; }

        if(!card.childCard) { return true; }

        if(card.childCard.cardSuit != card.cardSuit) {
            return false;
        }


        if (card.childCard && card.childCard.tumbleChildrenPictureCards(card.childCard)) {
            return true;
        } else if (!card.childCard) {
            return true;
        }
    }

    tumbleChildrenNumberCards(card) {
        if(card.getIsPictureCard()) { return false; } // Can't tumble if a number card

        if(!card.childCard) { return true; } // No more children to tumble so if this far we are golden

        // Check suits
        if(card.cardSuit <= 2 && card.childCard.cardSuit <= 2) { return false; }
        if(card.cardSuit >= 3 && card.childCard.cardSuit >= 3) { return false; }

        // Check value
        if(card.childCard.value != card.value - 1) { return false; }

        if(card.childCard.tumbleChildrenNumberCards(card.childCard)) {
            return true;
        } 
    }
}