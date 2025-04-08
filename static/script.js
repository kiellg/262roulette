// Set bet amount on the server
function setBetAmount(amount) {
  fetch('/api/set_bet_amount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bet_amount: amount })
  });
  document.getElementById("current-bet-amount").innerText = `Current bet amount: $${amount}`;
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

// Spin the wheel and animate the ball
function spinWheel() {
  fetch('/api/spin', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      // Standard European roulette order
      let rouletteOrder = [
        0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8,
        23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
        35, 3, 26
      ];
      let index = rouletteOrder.indexOf(data.winning_number);
      let segmentAngle = 360 / rouletteOrder.length;

      // Wheel rotation (clockwise)
      let extraWheelRotations = 5;
      let desiredWheelAngle = index * segmentAngle + segmentAngle / 2;
      let finalWheelAngle = extraWheelRotations * 360 + (360 - desiredWheelAngle);
      document.getElementById("wheel").style.transform = `rotate(${finalWheelAngle}deg)`;

      // Ball rotation: force it to always land at the top
      let extraBallRotations = 8;
      let finalBallAngle = extraBallRotations * 360; // Fixed so the ball lands at top
      let ballContainer = document.getElementById("ball-container");
      ballContainer.style.transition = "transform 4s ease-out";
      ballContainer.style.transform = `translate(-50%, -50%) rotate(${finalBallAngle}deg)`;

      // Trigger drop animation after spin finishes
      setTimeout(() => {
        let ball = document.querySelector('.ball');
        ball.classList.add('drop');
      }, 4000);

      // After drop animation, update results and reset the ball
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

        // Reset the ball container and remove the drop animation
        ballContainer.style.transition = "none";
        ballContainer.style.transform = "translate(-50%, -50%) rotate(0deg)";
        let ball = document.querySelector('.ball');
        ball.classList.remove('drop');
      }, 5000);
    });
}

// Generate the table grid for numbers 1-36
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

// Generate the wheel background with discrete segments
function generateWheelBackground() {
  let rouletteOrder = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8,
    23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
    35, 3, 26
  ];
  let redSet = new Set([32, 19, 21, 25, 34, 27, 36, 30, 23, 5, 16, 1, 14, 9, 18, 7, 12, 3]);
  let segments = [];
  let segPercentage = 100 / rouletteOrder.length;

  for (let i = 0; i < rouletteOrder.length; i++) {
    let num = rouletteOrder[i];
    let color = (num === 0) ? 'green' : (redSet.has(num) ? 'red' : 'black');
    let start = i * segPercentage;
    let end = (i + 1) * segPercentage;
    segments.push(`${color} ${start}% ${end}%`);
  }
  let gradient = `conic-gradient(${segments.join(', ')})`;
  document.getElementById("wheel").style.background = gradient;
}

// Generate number labels around the wheel
function generateWheelNumbers() {
  let wheel = document.getElementById("wheel");
  let numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8,
    23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12,
    35, 3, 26
  ];
  let segAngle = 360 / numbers.length;

  for (let i = 0; i < numbers.length; i++) {
    let angle = i * segAngle + segAngle / 2;
    let label = document.createElement("div");
    label.className = "wheel-number";
    label.innerText = numbers[i];
    // First center the label at the wheel's center,
    // then rotate it by 'angle', translate it upward by 130px (adjust radius as needed),
    // and finally rotate it back so that the text stays horizontal.
    label.style.transform = `translate(-50%, -50%) rotate(${angle}deg) translate(0, -130px) rotate(-${angle}deg)`;
    wheel.appendChild(label);
  }
}

// Update money display
function updateMoneyDisplay(money) {
  document.getElementById("money-display").innerText = `Money: $${money}`;
}

// Update bets display
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
