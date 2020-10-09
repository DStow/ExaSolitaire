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

    holdingCardSlot.draw(ctx);

    // Draw card slots and cards
    cardSlots.forEach(x => x.draw(ctx));

    // Get selected card and draw that
    var selected = cards.filter(x => x.selected)[0];
    if (selected) {
        tumbleDrawSelectedCard(ctx, selected, 0);
    }

    if (gameOver) {
        // Banner
        ctx.fillStyle = "#f9ffcf";
        let bannerHeight = 350;
        let bannerY = gameCanvas.height / 2 - (bannerHeight / 2);
        ctx.fillRect(0, bannerY, gameCanvas.width, bannerHeight);

        // Border
        ctx.fillStyle = "#3eba32";
        let borderHeight = 20;
        ctx.fillRect(0, bannerY, gameCanvas.width, borderHeight);

        ctx.fillRect(0, bannerY + bannerHeight - borderHeight, gameCanvas.width, borderHeight);

        // Text
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.font = "220px Calibri";
        ctx.fillText("You Won!", gameCanvas.width / 2, bannerY + (bannerHeight / 2));
    }


}

function tumbleDrawSelectedCard(ctx, card, depth) {
    card.drawSelected(ctx, mouseX - dragOffsetX, mouseY - dragOffsetY + (depth * 80));

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
let mouseX, mouseY;
let selectedSlot;

function downEvent(x, y) {


    if (gameOver) { return; }
    let canvasX = getScreenXToCanvasX(x);
    let canvasY = getScreenYToCanvasY(y);

    // Deselect already selected regardless
    let alreadySelected = cards.filter(x => x.selected)[0];
    if (alreadySelected) { alreadySelected.selected = false; }

    let grabbedCard = false;

    // Go through each card slot and ask if we can pick up the card
    for (var i = 0; i < cardSlots.length; i++) {
        if (cardSlots[i].disabled) { continue; }

        let selectedCard = cardSlots[i].getSelectedCardStack(canvasX, canvasY);
        if (selectedCard) {
            selectedSlot = cardSlots[i];
            selectedCard.selected = true;
            dragOffsetX = canvasX - selectedCard.xPos;
            dragOffsetY = canvasY - selectedCard.yPos;
            grabbedCard = true;
            break;
        }
    }

    if (grabbedCard == false) {
        if (holdingCardSlot.isSlotAtPoint(canvasX, canvasY) && holdingCardSlot.cards.length >= 1) {
            selectedSlot = holdingCardSlot;
            let selectedCard = holdingCardSlot.cards[0]
            selectedCard.selected = true;
            dragOffsetX = canvasX - selectedCard.xPos;
            dragOffsetY = canvasY - selectedCard.yPos;
        }
    }
}

let touching = false;

function mouseDown(event) {
    console.log("Down?");
    console.log(event);
    downEvent(event.offsetX, event.offsetY);
}

function touchDown(event) {
    touching = true;
    console.log(event);
    downEvent(event.touches[0].clientX, event.touches[0].clientY);
    event.preventDefault();
}

function mouseMove(event) {
    if (gameOver) { return; }
    mouseX = getScreenXToCanvasX(event.offsetX);
    mouseY = getScreenYToCanvasY(event.offsetY);
}

function touchMove(event) {
    mouseX = getScreenXToCanvasX(event.touches[0].clientX);
    mouseY = getScreenYToCanvasY(event.touches[0].clientY);
    event.preventDefault();
}

function mouseUp(event) {
    if (!touching) {
        moveUp(getScreenXToCanvasX(event.offsetX), getScreenYToCanvasY(event.offsetY));
    }
}

function touchUp(event) {
    console.info("touch up up!");
    moveUp(mouseX, mouseY);
    touching = false;
    event.preventDefault();
}

function moveUp(x, y) {
    if (gameOver) { return; }
    let alreadySelected = cards.filter(x => x.selected)[0];
    if (alreadySelected) {
        // Find the slot being hovered over
        // Check if it can have the selected card dropped onto it
        // Make the move (remove from current slot and transfer????)
        let canvasX = x;
        let canvasY = y;

        console.log(x + " - " + y);

        console.log(canvasX + " - " + canvasY);

        let droppedCard = false;

        // Go through each card slot and ask if we can pick up the card
        for (var i = 0; i < cardSlots.length; i++) {
            let selectedCard = cardSlots[i].getSelectedCardStack(canvasX, canvasY);

            // No card under mouse
            if (!selectedCard) { continue; }

            selectedCard = getBottomCard(selectedCard);

            // Card under mouse has a child
            if (selectedCard.childCard) { return false; }

            // Check if selected card can be attached to bottom of the selected card
            var bottomCard = alreadySelected;

            let canMerge = false;

            if (selectedSlot.slot == cardSlots[i].slot) {
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
                if (slotWithCard) {
                    slotWithCard.removeCardLink(alreadySelected);
                } else {
                    holdingCardSlot.cards.pop();
                }

                //cardSlots[i].cards.push(alreadySelected);
                selectedCard.childCard = alreadySelected;
                droppedCard = true;

                // This will double check if we have any full face stacks laying around that can be 'completed'
                checkForFullStacksAndEndGame();

                break;
            } else {

            }
        }

        if (droppedCard == false) {
            // Check if it is on the temp holding slot

            // Loop through all the standard holding slots
            let hoveredCarSlot = cardSlots.filter(x => x.cards.length == 0 && x.isSlotAtPoint(canvasX, canvasY));
            if (hoveredCarSlot.length > 0) {
                let slotWithCard = cardSlots.filter(x => x.hasCard(alreadySelected))[0];
                slotWithCard.removeCardLink(alreadySelected);


                hoveredCarSlot[0].cards.push(alreadySelected);
            }

            if (holdingCardSlot.isSlotAtPoint(canvasX, canvasY) && holdingCardSlot.cards.length == 0 && !alreadySelected.childCard) {
                let slotWithCard = cardSlots.filter(x => x.hasCard(alreadySelected))[0];
                slotWithCard.removeCardLink(alreadySelected);

                holdingCardSlot.cards.push(alreadySelected);
            }
        }

        alreadySelected.selected = false;
        selectedSlot = undefined;
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

function checkForFullStacksAndEndGame() {
    // Loop through each stack and check if it has 4 face stacks
    let fullFaceStackCount = 0;
    let fullCardStackCount = 0;

    for (var i = 0; i < cardSlots.length; i++) {
        if (cardSlots[i].isFullFaceStack()) {
            // It has 4 cards, maybe they are all the same suit?
            cardSlots[i].disabled = true;
            fullFaceStackCount++;
        } else if (cardSlots[i].isFullCardStack()) {
            fullCardStackCount++;
        }
    }

    if (fullFaceStackCount == 4 && fullCardStackCount == 4) {
        // Gmae over!
        gameOver = true;
    }
}

let gameCanvas = document.getElementById("gameCanvas");

gameCanvas.addEventListener("touchstart", touchDown, false);
gameCanvas.addEventListener("mousedown", mouseDown, false);

gameCanvas.addEventListener("touchend", touchUp, false);
gameCanvas.addEventListener("mouseup", mouseUp, false);
gameCanvas.addEventListener("touchmove", touchMove, false);
gameCanvas.addEventListener("mousemove", mouseMove, false);

let gameOver = false;

// These are the 'scale' of the canvas
gameCanvas.width = 2550;
gameCanvas.height = 1500;

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
    }

    cardCount += 4;
}

let holdingCardSlot = new CardSlot(-1);

var lastRender = 0
window.requestAnimationFrame(loop)