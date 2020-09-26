export class CardSlot {
    slot = -1;
    width = 245;
    height = 335;
    cards = [];

    constructor(slot) {
        this.slot = slot;
    }

    getXPos() {
        if (this.slot >= 0) {
            return 30 + (this.slot * (this.width + 30));
        } else {
            return 30;
        }
    }

    getYPos() {
        if (this.slot >= 0) {
            return 20;
        } else {
            return 1125;
        }
    }

    draw(ctx) {
        this.drawCardSlot(ctx);

        if (this.cards.length > 0) {
            this.tumbleDrawCards(ctx, this.cards[0], 0);
        }
    }

    tumbleDrawCards(ctx, card, depth) {
        if (card.selected) { return; } // We don't draw selected cards bruh

        card.draw(ctx, this, 80 * depth);

        if (card.childCard) {
            this.tumbleDrawCards(ctx, card.childCard, depth + 1);
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
        if(this.cards.length > 0) {
        return this.getSelectedCardStackRec(x, y, this.cards[0]);
        } else {
            return;
        }
    }

    getSelectedCardStackRec(x, y, card) {
        if (card.containsPos(x, y) && card.getCanChildrenBeMoved()) {
            
            if(card.childCard) {
                // Go and test children so we grab from the 'top' of the stack
                // as the user would see it
                let tryChild = this.getSelectedCardStackRec(x, y, card.childCard);
                if(tryChild) {
                    return tryChild;
                }
            }

            return card;
        } else if (card.childCard) {
            return this.getSelectedCardStackRec(x, y, card.childCard);
        } else {
            return;
        }
    }

    isSlotAtPoint(x, y) {
        console.log("Checking is slot is at point: " + x + "," + y);
        let result = (x > this.getXPos() && x <= this.getXPos() + this.width
            && y > this.getYPos() && y <= this.getYPos() + this.height);
        console.log("Result: " + result);
        return result;
    }

    addCardToSlot(currentCard, newCard) {
        if (!currentCard.childCard) {
            currentCard.childCard = newCard;
        } else {
            this.addCardToSlot(currentCard.childCard, newCard);
        }
    }

    hasCard(card) {
        if(this.cards.length == 0) { return false; }
        return this.hasCardRec(this.cards[0], card);
    }

    hasCardRec(currentCard, card) {
        if (currentCard == card) {
            return true;
        } else if (currentCard.childCard) {
            return this.hasCardRec(currentCard.childCard, card);
        } else {
            return false;
        }
    }

    removeCardLink(card) {
        if (this.cards[0] == card) {
            this.cards.pop();
        } else {
            this.removeCardLinkRec(this.cards[0], card);
        }
    }

    removeCardLinkRec(currentCard, card) {
        if (currentCard.childCard) {
            if (currentCard.childCard == card) {
                currentCard.childCard = undefined;
            } else {
                this.removeCardLinkRec(currentCard.childCard, card);
            }
        }
    }
}