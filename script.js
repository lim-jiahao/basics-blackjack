var makeCard = function (suit, emoji, rank) {
  var specialRanks = {
    11: "jack",
    12: "queen",
    13: "king",
    1: "ace",
  };
  var name = rank.toString();
  var points = rank;

  if (Object.keys(specialRanks).includes(name)) {
    name = specialRanks[rank];
    if (name != "ace") points = 10;
  }

  return { name, suit, rank, points, emoji };
};

var makeDeck = function () {
  var deck = [];
  var suits = ["hearts", "diamonds", "clubs", "spades"];
  var suitEmojis = ["♥️", "♦", "♣️", "♠️"];

  for (var suitIndex = 0; suitIndex < suits.length; suitIndex += 1) {
    for (var rank = 1; rank <= 13; rank += 1) {
      var card = makeCard(suits[suitIndex], suitEmojis[suitIndex], rank);
      deck.push(card);
    }
  }
  return deck;
};

// Get a random index ranging from 0 (inclusive) to max (exclusive).
var getRandomIndex = function (max) {
  return Math.floor(Math.random() * max);
};

// Shuffle the elements in the cardDeck array
var shuffleDeck = function (cardDeck) {
  for (var i = 0; i < cardDeck.length; i += 1) {
    var randomIndex = getRandomIndex(cardDeck.length);
    var randomCard = cardDeck[randomIndex];
    var currentCard = cardDeck[i];

    cardDeck[i] = randomCard;
    cardDeck[randomIndex] = currentCard;
  }
  return cardDeck;
};

var deck;
var playerCards = [];
var computerCards = [];
var playerDone = false;

const STARTING_CARDS = 2;

var resetGame = function () {
  deck = makeDeck();
  deck = shuffleDeck(deck);
  playerCards = [];
  computerCards = [];
};

var checkForBlackjack = function (cards) {
  cards.sort((a, b) => a.points - b.points);
  return cards[0].points == 1 && cards[1].points == 10;
};

var calculatePoints = function (cards) {
  var total = 0;
  for (var i = 0; i < cards.length; i += 1) {
    total += cards[i].points;
  }
  return total;
};

var outputCards = function () {
  var output = "Player's cards:<br>";
  for (var i = 0; i < playerCards.length; i += 1) {
    output += `${playerCards[i].name} of ${playerCards[i].emoji}<br>`;
  }

  if (playerDone) {
    output += "<br>Computer's cards:<br>";
    for (var i = 0; i < computerCards.length; i += 1) {
      output += `${computerCards[i].name} of ${computerCards[i].emoji}<br>`;
    }
  } else {
    output += "<br>Computer's face up card:<br>";
    output += `${computerCards[0].name} of ${computerCards[0].emoji}<br>`;
  }
  return output;
};

var dealNewHand = function () {
  var output = "";
  resetGame();
  for (var i = 0; i < STARTING_CARDS; i += 1) {
    playerCards.push(deck.pop());
    computerCards.push(deck.pop());
  }

  output += outputCards();

  if (checkForBlackjack(playerCards)) {
    output += `<br>Player has blackjack. Player wins!`;
  } else {
    document.querySelector("#new-hand-button").disabled = true;
    document.querySelector("#hit-button").style.visibility = "visible";
    document.querySelector("#stand-button").style.visibility = "visible";
  }
  return output;
};

var playerHit = function () {
  var output = "";
  playerCards.push(deck.pop());
  output += outputCards();
  var playerPoints = calculatePoints(playerCards);
  if (playerPoints > 21) {
    output += `Player busts. Computer wins!`;
    document.querySelector("#new-hand-button").disabled = false;
    document.querySelector("#hit-button").style.visibility = "hidden";
    document.querySelector("#stand-button").style.visibility = "hidden";
  }
  return output;
};

var playerStand = function () {
  var output = "";
  playerDone = true;
  while (calculatePoints(computerCards) < 17) {
    computerCards.push(deck.pop());
  }
  output += outputCards();
  var playerPoints = calculatePoints(playerCards);
  var computerPoints = calculatePoints(computerCards);

  output += `<br>Player has ${playerPoints} points.<br>Computer has ${computerPoints} points.<br>`;

  if (playerPoints > computerPoints || computerPoints > 21)
    output += `Player wins!`;
  else if (playerPoints < computerPoints) output += `Computer wins!`;
  else output += `It's a tie!`;

  document.querySelector("#new-hand-button").disabled = false;
  document.querySelector("#hit-button").style.visibility = "hidden";
  document.querySelector("#stand-button").style.visibility = "hidden";
  return output;
};
