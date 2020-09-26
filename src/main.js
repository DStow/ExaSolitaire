import { Card } from './card.js';
import { CardSlot } from './card-slot.js';
import { CardSuits } from './enums.js';

function update(progress) {
    cards.forEach(x => x.update(progress));
}

function draw() {
    // Draw the state of the world
    // Use the context to draw to it
    let ctx = gameCanvas.getContext("2d");

    // Create gradient background
    var grd = ctx.createLinearGradient(0, 0, 1000, 0);
    grd.addColorStop(0, "#008fff");
    grd.addColorStop(1, "#00bfff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    // Draw card slots and cards
    cardSlots.forEach(x => x.draw(ctx));

    // Get selected card and draw that
    var selected = cards.filter(x => x.selected)[0];
    if (selected) {
        tumbleDrawSelectedCard(ctx, selected, 0);
    }
}

function tumbleDrawSelectedCard(ctx, card, depth) {
    card.drawSelected(ctx, mouseX - dragOffsetX, mouesY - dragOffsetY + (depth * 80));

    if (card.childCard) {
        tumbleDrawSelectedCard(ctx, card.childCard, depth + 1);
    }
}

function loop(timestamp) {
    var progress = timestamp - lastRender

    update(progress)
    draw()

    lastRender = timestamp
    window.requestAnimationFrame(loop)
}

let dragOffsetX, dragOffsetY;
let mouseX, mouesY;
let selectedSlot;
function mouseDown(event) {
    let canvasX = getScreenXToCanvasX(event.offsetX);
    let canvasY = getScreenYToCanvasY(event.offsetY);

    // Deselect already selected regardless
    let alreadySelected = cards.filter(x => x.selected)[0];
    if (alreadySelected) { alreadySelected.selected = false; }

    console.info("Mouse down?");

    // Go through each card slot and ask if we can pick up the card
    for (var i = 0; i < cardSlots.length; i++) {
        let selectedCard = cardSlots[i].getSelectedCardStack(canvasX, canvasY);
        if (selectedCard) {
            this.selectedSlot = cardSlots[i];
            selectedCard.selected = true;
            dragOffsetX = canvasX - selectedCard.xPos;
            dragOffsetY = canvasY - selectedCard.yPos;
            break;
        }
    }

    // // Select the clicked card if one is clicked
    // var selectedCard = cards.filter(x => x.containsPos(canvasX, canvasY))[0];
    // if (selectedCard) {
    //     selectedCard.selected = true;
    //     dragOffsetX = canvasX - selectedCard.xPos;
    //     dragOffsetY = canvasY - selectedCard.yPos;
    // }
}

function mouseMove(event) {
    // let selectedCard = cards.filter(x => x.selected)[0];
    // if (selectedCard) {
    //     let canvasX = getScreenXToCanvasX(event.offsetX) - dragOffsetX;
    //     let canvasY = getScreenYToCanvasY(event.offsetY) - dragOffsetY;
    //     selectedCard.setPos(canvasX, canvasY);
    // }
    mouseX = getScreenXToCanvasX(event.offsetX);
    mouesY = getScreenYToCanvasY(event.offsetY);
}

function mouseUp(event) {
    console.log("mouse up");
    let alreadySelected = cards.filter(x => x.selected)[0];
    if (alreadySelected) {
        console.log("Found a selected");
        // Find the slot being hovered over
        // Check if it can have the selected card dropped onto it
        // Make the move (remove from current slot and transfer????)
        let canvasX = getScreenXToCanvasX(event.offsetX);
        let canvasY = getScreenYToCanvasY(event.offsetY);

        console.info("Looking for card at " + canvasX + ", " + canvasY);

        // Go through each card slot and ask if we can pick up the card
        for (var i = 0; i < cardSlots.length; i++) {
            let selectedCard = cardSlots[i].getSelectedCardStack(canvasX, canvasY);

            // No card under mouse
            if (!selectedCard) { continue; }

            console.log("Found a hovered card!");

            selectedCard = getBottomCard(selectedCard);

            // Card under mouse has a child
            if (selectedCard.childCard) { return false; }

            // Check if selected card can be attached to bottom of the selected card
            var bottomCard = alreadySelected;

            let canMerge = false;

            if (this.selectedSlot.slot == cardSlots[i].slot) {
                console.log("Slot check failed: " + this.selectedSlot.slot + ", " + cardSlots[i].slot);
                canMerge = false;
            }
            else if (bottomCard.getIsPictureCard() && selectedCard.getIsPictureCard()
                && bottomCard.cardSuit == selectedCard.cardSuit) {
                canMerge = true;
            } else if (bottomCard.getIsPictureCard() == false && selectedCard.getIsPictureCard() == false
                && bottomCard.value == selectedCard.value - 1) {
                canMerge = true;
            }

            if (canMerge && selectedCard != alreadySelected) {
                let slotWithCard = cardSlots.filter(x => x.hasCard(alreadySelected))[0];
                slotWithCard.removeCardLink(alreadySelected);
                console.info("Can merge!");
                console.info("About to merge:");
                console.info(selectedCard);
                console.info("with");
                console.info(alreadySelected);
                //cardSlots[i].cards.push(alreadySelected);
                selectedCard.childCard = alreadySelected;
                break;
            } else {
                alreadySelected.selected = false;
            }
        }

        console.info("Setting selected to false");
        alreadySelected.selected = false;
        this.selectedSlot = undefined;
    }
}

function getBottomCard(card) {
    if (card.childCard) {
        return getBottomCard(card.childCard);
    } else {
        return card;
    }
}

function getScreenXToCanvasX(value) {
    let screenToCanvasRatio = gameCanvas.width / gameCanvas.clientWidth;
    return screenToCanvasRatio * value;
}

function getScreenYToCanvasY(value) {
    let screenToCanvasRatio = gameCanvas.height / gameCanvas.clientHeight;
    return screenToCanvasRatio * value;
}

function shuffleCards(times) {
    for (var repeatCount = 0; repeatCount < times; repeatCount++) {
        for (var i = cards.length - 1; i > 0; i--) {
            let index = Math.floor(Math.random() * (i + 1));

            let a = cards[index];
            cards[index] = cards[i];
            cards[i] = a;
        }
    }
}

let gameCanvas = document.getElementById("gameCanvas");
gameCanvas.addEventListener("mousedown", mouseDown, false);
gameCanvas.addEventListener("mouseup", mouseUp, false);
gameCanvas.addEventListener("mousemove", mouseMove, false);



// These are the 'scale' of the canvas
gameCanvas.width = 2550;
gameCanvas.height = 1000;

// Create all the cards
var cards = [];

for (var cardVal = 6; cardVal <= 10; cardVal++) {
    for (var cardSuit = 1; cardSuit <= 4; cardSuit++) {
        cards.push(new Card(0, 0, cardVal, cardSuit));
    }
}

for (var cardSuit = 1; cardSuit <= 4; cardSuit++) {
    cards.push(new Card(0, 0, "K", cardSuit));
    cards.push(new Card(0, 0, "Q", cardSuit));
    cards.push(new Card(0, 0, "J", cardSuit));
    cards.push(new Card(0, 0, "A", cardSuit));
}

shuffleCards(10);

// Create the lots
// ToDo: Shuffle then assign the cards
let cardCount = 0;
let cardSlots = [];
for (var cardVal = 0; cardVal < 9; cardVal++) {
    cardSlots[cardVal] = new CardSlot(cardVal);
    cardSlots[cardVal].slot = cardVal;
    for (var i = 0; i < 4; i++) {
        if (i == 0) {
            cardSlots[cardVal].cards.push(cards[cardCount + i]);
        } else {
            cardSlots[cardVal].addCardToSlot(cardSlots[cardVal].cards[0], cards[cardCount + i]);
        }

        // if (i > 0) {
        //     cardSlots[cardVal].cards[i - 1].childCard = cardSlots[cardVal].cards[i];
        // }
    }

    cardCount += 4;
}

console.log("Running");

var lastRender = 0
window.requestAnimationFrame(loop)