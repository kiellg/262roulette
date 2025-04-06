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
  fetch('/api/spin', {
    method: 'POST'
  })
    .then(response => response.json())
    .then(data => {
      let resultDisplay = document.getElementById("result-display");
      let resultText = `Winning number: ${data.winning_number} (${data.winning_color})\n`;
      data.results.forEach(r => {
        resultText += r + "\n";
      });
      resultText += `Total winnings: $${data.total_win}`;
      resultDisplay.innerText = resultText;
      updateMoneyDisplay(data.money);
      updateBetsDisplay({});
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
