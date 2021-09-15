var deck;
var playerCards = [];
var computerCards = [];
var playerDone = false;
var playerChips = 100;
var playerWager = 0;

const STARTING_CARDS = 2;
const MAX_VALUE = 21;
const DEALER_MIN = 17;

const newHandButton = document.getElementById("new-hand-button");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const wagerInput = document.getElementById("wager");
const wagerVal = document.getElementById("wager-value");

// helper function to create card
var makeCard = function (suit, emoji, rank) {
  // rank will be a number from 1 to 13, define a specialranks object for use later
  var specialRanks = {
    11: "J",
    12: "Q",
    13: "K",
    1: "A",
  };

  // set name and points value to first be equivalent to the rank value
  var name = rank.toString();
  var points = rank;

  // if the name is one of the keys in special ranks,
  // change name to be the corresponding value
  if (Object.keys(specialRanks).includes(name)) {
    name = specialRanks[rank];
    if (name != "A") points = 10; // for blackjack purpose, jack/queen/king = 10
  }

  // return card object
  return { name, suit, points, emoji };
};

// helper function to create deck
var makeDeck = function () {
  var deck = [];
  var suits = ["hearts", "diamonds", "clubs", "spades"];
  var suitEmojis = ["♥️", "♦", "♣️", "♠️"];
  const NUM_RANKS = 13;

  // loop thru suits and ranks to generate 52 cards
  for (var suitIndex = 0; suitIndex < suits.length; suitIndex += 1) {
    for (var rank = 1; rank <= NUM_RANKS; rank += 1) {
      var card = makeCard(suits[suitIndex], suitEmojis[suitIndex], rank);
      deck.push(card);
    }
  }
  return deck;
};

// Shuffle the elements in the cardDeck array
var shuffleDeck = function (cardDeck) {
  for (var i = 0; i < cardDeck.length; i += 1) {
    var randomIndex = Math.floor(Math.random() * cardDeck.length);
    var randomCard = cardDeck[randomIndex];
    var currentCard = cardDeck[i];

    cardDeck[i] = randomCard;
    cardDeck[randomIndex] = currentCard;
  }
  return cardDeck;
};

// reset game by making and shuffling a new deck, and clearing the player/computer cards
var resetGame = function () {
  deck = shuffleDeck(makeDeck());
  playerCards = [];
  computerCards = [];
  playerDone = false;

  newHandButton.disabled = false;
  wagerInput.disabled = false;
  wagerInput.setAttribute("max", playerChips);
  wagerInput.value = 1;
  wagerVal.innerHTML = 1;
  hitButton.style.visibility = "hidden";
  standButton.style.visibility = "hidden";
};

// returns true/false based on whether the starting two cards satisfy blackjack
var checkForBlackjack = function (cards) {
  var cardsCopy = [...cards];
  cardsCopy.sort((a, b) => a.points - b.points);
  return cardsCopy[0].points == 1 && cardsCopy[1].points == 10;
};

// returns blackjack point total for a given array of cards
var calculatePoints = function (cards) {
  var total = 0;
  var numAces = cards.reduce(
    (acc, cur) => (cur.name == "A" ? acc + 1 : acc),
    0
  );

  for (var i = 0; i < cards.length; i += 1) {
    total += cards[i].points;
  }

  for (var i = 0; i < numAces; i += 1) {
    if (total + 10 <= MAX_VALUE) total += 10;
  }
  return total;
};

var outputCurrentChips = function () {
  return `<br><br>Current chips: ${playerChips}`;
};

// returns an output to inform the player of the cards in play
var outputCards = function () {
  var output = "";
  if (playerDone) {
    // if player is done drawing, then we can output all the dealer's cards
    output += "Computer's cards:<br>";
    for (var i = 0; i < computerCards.length; i += 1) {
      output += `${computerCards[i].name}${computerCards[i].emoji} `;
    }
  } else {
    // otherwise only output the first card
    output += "Computer's face up card:<br>";
    output += `${computerCards[0].name}${computerCards[0].emoji}`;
  }

  output += "<br><br>Player's cards:<br>";
  for (var i = 0; i < playerCards.length; i += 1) {
    output += `${playerCards[i].name}${playerCards[i].emoji} `;
  }
  return output;
};

// this function is called when the new hand button is clicked
var dealNewHand = function (bet) {
  if (!deck) deck = shuffleDeck(makeDeck());
  var output = "";
  playerWager = Number(bet);

  // deal cards just like irl - player, dealer, player, dealer
  for (var i = 0; i < STARTING_CARDS; i += 1) {
    playerCards.push(deck.pop());
    computerCards.push(deck.pop());
  }

  output += outputCards();

  if (checkForBlackjack(playerCards)) {
    // if player has blackjack then hand is over
    output += `<br><br>Player has blackjack. Player wins!`;
    playerChips += Math.round(1.5 * playerWager);
    resetGame();
  } else {
    // otherwise show the hit/stand buttons to continue gameplay
    wagerInput.disabled = true;
    newHandButton.disabled = true;
    hitButton.style.visibility = "visible";
    standButton.style.visibility = "visible";
  }

  output += outputCurrentChips();
  return output;
};

// this function is called when the hit button is clicked
var playerHit = function () {
  var output = "";
  playerCards.push(deck.pop());
  output += outputCards();
  var playerPoints = calculatePoints(playerCards);
  if (playerPoints > MAX_VALUE) {
    // if player busts then output msg and reset ui
    output += `<br><br>Player busts. Computer wins!`;
    playerChips -= playerWager;
    resetGame();
  }
  output += outputCurrentChips();
  return output;
};

// this function is called when the stand button is clicked
var playerStand = function () {
  var output = "";
  playerDone = true; // set this to true so that we show all the dealer cards later
  while (calculatePoints(computerCards) < DEALER_MIN) {
    // dealer has to hit to at least 17
    computerCards.push(deck.pop());
  }
  output += outputCards();
  var playerPoints = calculatePoints(playerCards);
  var computerPoints = calculatePoints(computerCards);

  // generate game outcome and reset ui
  output += `<br><br>Player has ${playerPoints} points.<br>Computer has ${computerPoints} points.<br>`;

  if (playerPoints > computerPoints || computerPoints > MAX_VALUE) {
    output += `Player wins!`;
    playerChips += playerWager;
  } else if (playerPoints < computerPoints) {
    output += `Computer wins!`;
    playerChips -= playerWager;
  } else output += `It's a tie!`;

  output += outputCurrentChips();
  resetGame();
  return output;
};
