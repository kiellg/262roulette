from flask import Flask, render_template, request, jsonify, session
import random

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Use a secure secret key in production

# Define roulette colors (European style)
red_numbers = {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36}

@app.before_request
def setup_game():
    if 'money' not in session:
        session['money'] = 100
    if 'bets' not in session:
        session['bets'] = {}
    if 'current_bet_amount' not in session:
        session['current_bet_amount'] = 1

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/set_bet_amount', methods=['POST'])
def set_bet_amount():
    data = request.get_json()
    bet_amount = data.get('bet_amount')
    session['current_bet_amount'] = bet_amount
    return jsonify({'current_bet_amount': bet_amount})

@app.route('/api/place_bet', methods=['POST'])
def place_bet():
    data = request.get_json()
    bet_key = data.get('bet_key')
    current_bet_amount = session.get('current_bet_amount', 1)
    money = session.get('money', 100)
    if money < current_bet_amount:
        return jsonify({'error': 'Not enough money for this bet!'}), 400
    money -= current_bet_amount
    session['money'] = money
    bets = session.get('bets', {})
    bets[bet_key] = bets.get(bet_key, 0) + current_bet_amount
    session['bets'] = bets
    return jsonify({'money': money, 'bets': bets})

@app.route('/api/spin', methods=['POST'])
def spin():
    bets = session.get('bets', {})
    money = session.get('money', 100)
    winning_number = random.randint(0, 36)
    if winning_number == 0:
        winning_color = "Green"
    elif winning_number in red_numbers:
        winning_color = "Red"
    else:
        winning_color = "Black"
    results = []
    total_win = 0
    for bet_key, bet_amount in bets.items():
        win = False
        multiplier = 0
        # Straight number bet
        if bet_key.isdigit():
            if int(bet_key) == winning_number:
                win = True
                multiplier = 35
        # Only outside bets remaining: Low and High
        elif bet_key == "Low":
            if 1 <= winning_number <= 18:
                win = True
                multiplier = 1
        elif bet_key == "High":
            if 19 <= winning_number <= 36:
                win = True
                multiplier = 1
        if win:
            winnings = bet_amount * multiplier
            money += winnings
            total_win += winnings
            results.append(f"Bet on {bet_key} won! Payout: ${winnings}")
        else:
            results.append(f"Bet on {bet_key} lost.")
    session['money'] = money
    session['bets'] = {}
    response = {
        'winning_number': winning_number,
        'winning_color': winning_color,
        'results': results,
        'total_win': total_win,
        'money': money
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
