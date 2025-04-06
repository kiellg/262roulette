let currentBetAmount = 1;

// Set bet amount on the server
function setBetAmount(amount) {
  currentBetAmount = amount;
  document.getElementById("current-bet-amount").innerText = `Current bet amount: $${amount}`;
  fetch('/api/set_bet_amount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bet_amount: amount })
  });
}

// Place a bet on the server
function placeBet(betKey) {
  fetch('/api/place_bet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bet_key: betKey })
  })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById("result-display").innerText = data.error;
      } else {
        updateMoneyDisplay(data.money);
        updateBetsDisplay(data.bets);
      }
    });
}

// Spin the wheel and animate it
function spinWheel() {
  fetch('/api/spin', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      // The winning number from the backend
      let winning_number = data.winning_number;
      // Standard European roulette order
      let rouletteOrder = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8,
        23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
        35, 3, 26
      ];
      let index = rouletteOrder.indexOf(winning_number);
      let segmentAngle = 360 / rouletteOrder.length;
      // Calculate desired rotation so the winning segment lines up with the pointer
      let extraRotations = 5;
      let desiredAngle = index * segmentAngle + segmentAngle / 2;
      let finalAngle = extraRotations * 360 + (360 - desiredAngle);

      let wheel = document.getElementById("wheel");
      wheel.style.transform = `rotate(${finalAngle}deg)`;

      // After the animation completes, update results
      setTimeout(() => {
        let resultDisplay = document.getElementById("result-display");
        let resultText = `Winning number: ${data.winning_number} (${data.winning_color})\n`;
        data.results.forEach(r => {
          resultText += r + "\n";
        });
        resultText += `Total winnings: $${data.total_win}`;
        resultDisplay.innerText = resultText;
        updateMoneyDisplay(data.money);
        updateBetsDisplay({});
      }, 4000);
    });
}

// Create the grid of numbers (1–36) for the table using a CSS Grid
function generateTable() {
  let numbersGrid = document.getElementById("numbers-grid");
  let redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  for (let num = 1; num <= 36; num++) {
    let cell = document.createElement("div");
    cell.classList.add("number-cell");
    if (redNumbers.includes(num)) {
      cell.classList.add("red");
    } else {
      cell.classList.add("black");
    }
    cell.innerText = num;
    cell.onclick = function () { placeBet(num.toString()); };
    numbersGrid.appendChild(cell);
  }
}

// Create labels for each number around the wheel
function generateWheelNumbers() {
  let wheel = document.getElementById("wheel");
  // Standard European roulette order for the wheel
  let numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8,
    23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
    35, 3, 26
  ];
  let segAngle = 360 / numbers.length;

  // Position each number label around the wheel
  for (let i = 0; i < numbers.length; i++) {
    let angle = i * segAngle + segAngle / 2;
    let label = document.createElement("div");
    label.className = "wheel-number";
    label.innerText = numbers[i];
    // Rotate to the angle, translate outward, then rotate back so text is upright
    label.style.transform = `rotate(${angle}deg) translate(0, -130px) rotate(-${angle}deg)`;
    wheel.appendChild(label);
  }
}

function updateMoneyDisplay(money) {
  document.getElementById("money-display").innerText = `Money: $${money}`;
}

function updateBetsDisplay(bets) {
  let betsDisplay = document.getElementById("bets-display");
  if (!bets || Object.keys(bets).length === 0) {
    betsDisplay.innerText = "Current bets: None";
  } else {
    let betsStr = "Current bets:\n";
    for (let key in bets) {
      betsStr += `${key}: $${bets[key]}\n`;
    }
    betsDisplay.innerText = betsStr;
  }
}
