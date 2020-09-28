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
    suitImage;

    constructor(xPos, yPos, value, cardSuit) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.value = value;
        this.cardSuit = cardSuit;
        this.suitImage = new Image();
        if (this.cardSuit == CardSuits.HEARTS) {
            this.suitImage.src = "../images/heart.png";
        } else if (this.cardSuit == CardSuits.CLUBS) {
            this.suitImage.src = "../images/clubs.png";
        } else if (this.cardSuit == CardSuits.DIAMONDS) {
            this.suitImage.src = "../images/diamonds.png";
        } else if (this.cardSuit == CardSuits.ACES) {
            this.suitImage.src = "../images/spades.png";
        }
    }

    drawSelected(ctx, x, y) {
        this.xPos = x;
        this.yPos = y;

        this.drawCard(ctx);
    }

    draw(ctx, cardSlot, yOffset) {
        if (!this.selected) {
            this.xPos = cardSlot.getXPos();
            this.yPos = cardSlot.getYPos() + yOffset;
        }

        this.drawCard(ctx);
    }

    drawCard(ctx) {

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
        ctx.textAlign ="center";
        ctx.fillText(this.value, 35 + this.xPos, 15 + this.yPos);

        let rightX = -35;
        //if (this.value == 10) { rightX = -65; }
        ctx.fillText(this.value, this.xPos + this.width + rightX, 15 + this.yPos)

     //   ctx.fillText(this.getSuitName(this.cardSuit), this.xPos + (this.width / 2), this.yPos + (this.height / 2));

        ctx.fillText(this.value, 35 + this.xPos, 285 + this.yPos);
        ctx.fillText(this.value, this.xPos + this.width + rightX, 285 + this.yPos);

        ctx.drawImage(this.suitImage, this.xPos + (this.width / 2) - 20, this.yPos + 15, 40, 40);
        ctx.drawImage(this.suitImage, this.xPos + (this.width / 2) - 20, this.yPos + 285, 40, 40);

        // Draw center text
        ctx.font = "60px Arial";
        let writeVal = this.value;
        let xPos = this.xPos + (this.width / 2);
        let yPos = this.yPos + (this.height / 2);
        ctx.textBaseline = "middle";
        ctx.fillText(writeVal, xPos,yPos );
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
                return "Aces";
            case 2:
                return "Clubs";
            case 3:
                return "Hearts";
            case 4:
                return "Diamonds";
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
            var result = this.tumbleChildrenPictureCards(this);
            return result;
        } else {
            var result = this.tumbleChildrenNumberCards(this);
            return result;
        }
    }

    tumbleChildrenPictureCards(card) {
        if (card.getIsPictureCard() == false) { return false; }

        if (!card.childCard) { return true; }

        if (card.childCard.cardSuit != card.cardSuit) {
            return false;
        }


        if (card.childCard && card.childCard.tumbleChildrenPictureCards(card.childCard)) {
            return true;
        } else if (!card.childCard) {
            return true;
        }
    }

    tumbleChildrenNumberCards(card) {
        if (card.getIsPictureCard()) { return false; } // Can't tumble if a number card

        if (!card.childCard) { return true; } // No more children to tumble so if this far we are golden

        // Check suits
        if (card.cardSuit <= 2 && card.childCard.cardSuit <= 2) { return false; }
        if (card.cardSuit >= 3 && card.childCard.cardSuit >= 3) { return false; }

        // Check value
        if (card.childCard.value != card.value - 1) { return false; }

        if (card.childCard.tumbleChildrenNumberCards(card.childCard)) {
            return true;
        }
    }
}