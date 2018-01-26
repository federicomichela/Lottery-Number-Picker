function delay(t, v) {
    return new Promise(function(resolve) {
        setTimeout(resolve.bind(null, v), t)
    });
}
Promise.prototype.delay = function(t) {
    return this.then(function(v) {
        return delay(t, v);
    });
};

// Global variables
const RANGE_MIN = 1;
const RANGE_MAX = 50;
const PICKS_PER_GAME = 6;
const COLOR_SCHEME = {
    'green': (1, 9),
    'pink': (10, 19),
    'blue': (20, 39),
    'orange': (40, 49)
};
const MATCH = { match: 1, draw: [], bonus: null };

var Game = function() {
    // match: match number,
    // draw: the series of numbers randomly generated base on settings,
    // bonus: the bonus number randomly generated
    this.currentMatch = Object.create(MATCH);

    this.settings = {
        rangeMinValue: RANGE_MIN,
        rangeMaxValue: RANGE_MAX,
        picks: PICKS_PER_GAME,
        colorScheme: COLOR_SCHEME
    };

    // list of matches
    this.history = [];


    this.startMatch = function() {
        // disable button to avoid new games to start before the end of the current one
        document.getElementById('btnStartGame').setAttribute('disabled', 'disabled');

        // eventually reset old game...
        this._resetMatch();

        this._drawLottery();
        this._drawBonus();
        this._updateHistory();

        while (this.currentMatch.draw.length < this.settings.picks) {
            setTimeout(2000);
            console.log(this.currentMatch.draw)
        }

        // re-enable start button to allow user to start a new game
        document.getElementById('btnStartGame').removeAttribute('disabled');
    };

    this.saveSettings = function() {
        var minRange = parseInt(document.getElementById('minRange').value);
        var maxRange = parseInt(document.getElementById('maxRange').value);
        var picks = parseInt(document.getElementById('picks').value);

        if (picks > (maxRange - minRange + 1)) {
            var msg = 'You cannot select a number of picks higher than the available numbers in the range.';
            alert(msg);
            return;
        }

        if (minRange !== null && minRange !== undefined) {
            this.settings.rangeMinValue = minRange;
        }
        if (maxRange !== null && maxRange !== undefined) {
            this.settings.rangeMaxValue = maxRange;
        }
        if (picks !== null && picks !== undefined) {
            this.settings.picks = picks;
        }

        alert('Game Settings Successfully Updated');
    };

    this._drawLottery = function() {
        var me = this;
        var numbers = [];
        for (var i = 0; i < this.settings.picks; i++) {
            var number = getRandomNumber(this.settings.rangeMinValue, this.settings.rangeMaxValue);

            // if number already picked, generate a new one in order to obtain a list of unique numbers
            while (numbers.indexOf(number) >= 0) {
                number = getRandomNumber(this.settings.rangeMinValue, this.settings.rangeMaxValue);
            }

            numbers.push(number);
        }

        this.currentMatch.draw = numbers.sort(function(a, b) { return a - b; });

        // render result to UI
        document.querySelector('#drawContainer .alert').classList.remove('hide');
        renderNumbers(document.querySelector('#drawContainer'), me.currentMatch.draw);
    };

    this._drawBonus = function() {
        var me = this;
        var number = getRandomNumber(this.settings.rangeMinValue, this.settings.rangeMaxValue);

        // if number already picked in the draw, generate a new random unique number
        while (this.currentMatch.draw.indexOf(number) >= 0) {
            number = getRandomNumber(this.settings.rangeMinValue, this.settings.rangeMaxValue);
        }

        this.currentMatch.bonus = number;

        // render result to UI
        document.querySelector('#bonusContainer .alert').classList.remove('hide');
        renderNumbers(document.querySelector('#bonusContainer'), [me.currentMatch.bonus]);
    };

    /* Save the match in the game history and */
    this._updateHistory = function() {
        // save current match in the history
        this.history.push(this.currentMatch);

        // updates history page table
        document.getElementById('noResults').classList.add('hide');

        var row = document.createElement('TR');
        var last = this.history.length - 1;
        var attributes = ['match', 'draw', 'bonus'];
        for (var i in attributes) {
            var attribute = attributes[i];
            var value = this.history[last][attribute];
            var cellContent = document.createTextNode(value);
            var cell = document.createElement('TD')
            cell.appendChild(cellContent);
            row.appendChild(cell);
        }
        document.querySelector('#historyContainer table tbody').appendChild(row);
    };

    /* Start a new match */
    this._resetMatch = function() {
        if (isEmptyObject(this.currentMatch)) {
            // it's the first game there's nothing to reset
            return;
        }

        // start a new match
        this.currentMatch = Object.create(MATCH);
        this.currentMatch.match = this.history.length + 1;

        // remove all the lottery numbers
        while (document.querySelector('#drawContainer .row').hasChildNodes()) {
            document.querySelector('#drawContainer .row').removeChild(document.querySelector('#drawContainer .row').lastChild);
        }
        // including the bonus number
        while (document.querySelector('#bonusContainer .row').hasChildNodes()) {
            document.querySelector('#bonusContainer .row').removeChild(document.querySelector('#bonusContainer .row').lastChild);
        }

        // and hide the messages
        for (var i = 0; i < document.querySelector('.alert').length; i++) {
            document.querySelector('.alert')[i].classList.add('hide');
        }
    };
};

/* Method to render numbers */
function renderNumbers($container, numbers) {
    // create a ball-container
    var $bonusRow = document.createElement('DIV');
    $bonusRow.classList.add('row');
    $bonusRow.classList.add('row__space--around');
    $container.appendChild($bonusRow);

    for (var i in numbers) {
        // create the DOM element
        var $ball = document.createElement('DIV');

        // assign a class for styling purposes
        var $text = document.createTextNode(numbers[i]);

        // update the DOM
        $ball.classList.add('ball');
        $ball.appendChild($text);

        // set the ball color
        _setColor($ball);

        $container.querySelector('div.row').appendChild($ball);
    }
};

function showPage() {
    /* This method retrieves the page to render from the 'data-attr' attribute of the event's target that triggered
     * the method. Hides all the other containers.
     * */
    var $target = this.event.target;
    var page = null;

    if ($target.hasAttribute('data-attr')) {
        page = $target.getAttribute('data-attr');
    } else {
        page = $target.parentElement.getAttribute('data-attr');
    }

    var containerID = '#' + page + 'Container';

    for (var i = 0; i < document.getElementsByClassName('container').length; i++) {
        var $container = document.getElementsByClassName('container')[i];
        $container.classList.add('hide');
    }
    document.querySelector(containerID).classList.remove('hide');
};

function action(message, callback, removeMessage) {
    /* This method renders a message on UI, then executes a method.
     * Once the method is completed, it removes the message from the UI.
     */

    // render message to UI
    var msgText = document.createTextNode(message);
    var $message = document.createElement('h2');
    $message.classList.add('alert');
    $message.appendChild(msgText);
    document.getElementById('matchResultsContainer').appendChild($message);

    setTimeout(function() {
        // executes method
        callback();

        // remove message
        if (removeMessage) {
            $message.parentNode.removeChild($message);
        }
    }, 1000);
}

function getRandomNumber(rangeMin, rangeMax) {
    /* This method generates a random Integer
     * NOTE: max exclusive - min inclusive
     */

    var min = Math.ceil(rangeMin);
    var max = Math.ceil(rangeMax);

    return Math.floor(Math.random() * (max - min)) + min;
}

function isEmptyObject(obj) {
    /* This is a util method to check if an object is empty */
    return Object.keys(obj).length === 0;
}

function _setColor($ball) {
    var number = $ball.innerText;

    if (number >= 1 && number < 10) {
        $ball.classList.add('green');
    } else if (number >= 10 && number < 20) {
        $ball.classList.add('pink');
    } else if (number >= 20 && number < 30) {
        $ball.classList.add('blue');
    } else if (number >= 30 && number < 40) {
        $ball.classList.add('orange');
    } else if (number >= 40 && number < 50) {
        $ball.classList.add('black');
    }
}

var newGame = new Game();
