let currentBetAmount = 1;

function setBetAmount(amount) {
  currentBetAmount = amount;
  document.getElementById("current-bet-amount").innerText = `Current bet amount: $${amount}`;
  fetch('/api/set_bet_amount', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bet_amount: amount })
  });
}

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

function spinWheel() {
  // Call the backend spin API
  fetch('/api/spin', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      let winning_number = data.winning_number;
      // European roulette order (including 0)
      let rouletteOrder = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
      let index = rouletteOrder.indexOf(winning_number);
      let segmentAngle = 360 / rouletteOrder.length;
      // Calculate desired angle such that the winning segment's center is at top (pointer)
      let desired = index * segmentAngle + segmentAngle/2;
      let extraRotations = 5; // extra full spins for effect
      let finalAngle = extraRotations * 360 + (360 - desired);

      let wheel = document.getElementById("wheel");
      // Apply the rotation (CSS transition handles the animation)
      wheel.style.transform = `rotate(${finalAngle}deg)`;

      // After the animation completes (4 seconds), update the result display
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

function updateMoneyDisplay(money) {
  document.getElementById("money-display").innerText = `Money: $${money}`;
}

function updateBetsDisplay(bets) {
  let betsDisplay = document.getElementById("bets-display");
  if (Object.keys(bets).length === 0) {
    betsDisplay.innerText = "Current bets: None";
  } else {
    let betsStr = "Current bets:\n";
    for (let key in bets) {
      betsStr += `${key}: $${bets[key]}\n`;
    }
    betsDisplay.innerText = betsStr;
  }
}

function generateTable() {
  let tableGrid = document.getElementById("table-grid");
  for (let num = 1; num <= 36; num++) {
    let cell = document.createElement("div");
    cell.classList.add("cell");
    if ([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(num)) {
      cell.classList.add("red");
    } else {
      cell.classList.add("black");
    }
    cell.innerText = num;
    cell.onclick = function () { placeBet(num.toString()); };
    tableGrid.appendChild(cell);
  }
}
