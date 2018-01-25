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

    // Method to generate 6 random numbers, sort them and show them on UI
    this.startMatch = function() {
        // disable button to avoid new games to start before the end of the current one
        document.getElementById('btnStartGame').setAttribute('disabled', 'disabled');

        // eventually reset old game...
        this._resetMatch();

        var me = this;
        action('Your Lottery Numbers Are ...', function () {
            // generate random numbers
            var numbers = [];
            for (var i = 0; i < PICKS_PER_GAME; i++) {
                var number = getRandomNumber();
                numbers.push(number);
            }

            // sort numbers asc
            me.currentMatch.draw = numbers.sort();

            // render numbers to UI
            me._renderNumbers(me.currentMatch.draw);

            action('AND YOUR BONUS NUMBER IS ...', function () {
                var bonusNumber = getRandomNumber();
                var isBonus = true;

                // generate a bonus number that does not match with an already extracted number
                while (numbers.indexOf(bonusNumber) > -1) {
                    bonusNumber = getRandomNumber();
                }

                me.currentMatch.bonus = bonusNumber;

                // render bonus number
                me._renderNumbers([bonusNumber], isBonus);

                // re-enable start button to allow user to start a new game
                document.getElementById('btnStartGame').removeAttribute('disabled');
            });
        });
    };

    /* Save the match in the game history and start a new round */
    this._resetMatch = function() {
        if (isEmptyObject(this.currentMatch)) {
            // it's the first game there's nothing to reset
            return;
        }
        // save current match in the history
        this.history.push(this.currentMatch);

        // start a new match
        this.currentMatch = Object.create(MATCH);
        this.currentMatch.match = this.history.length + 1;

        // reset UI
        var remove = ['balls-container', 'alert'];
        var $rows = null;

        for (var i = 0; i < remove.length; i++) {
            $rows = document.getElementsByClassName(remove[i]);

            for (var j = 0; j < $rows.length; j++) {
                $rows[j].parentNode.removeChild($rows[j]);
            }
        }
    };

    /* Method to render numbers */
    this._renderNumbers = function(numbers, bonus) {
        // create a ball-container
        var $bonusRow = document.createElement('DIV');
        $bonusRow.classList.add('balls-container');
        document.getElementsByClassName('container')[0].appendChild($bonusRow);

        for (var i in numbers) {
            // create the DOM element
            var $ball = document.createElement('DIV');

            // assign a class for styling purposes
            var $text = document.createTextNode(numbers[i]);

            // update the DOM
            $ball.classList.add('ball');
            $ball.appendChild($text);

            if (bonus) {
                $ball.classList.add('bonus-ball');
                $bonusRow.appendChild($ball);
                document.getElementsByClassName('container')[0].appendChild($bonusRow);
            } else {
                // set the ball color
                _setColor($ball);

                document.getElementsByClassName('balls-container')[0].appendChild($ball);
            }
        }
    };
}

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

    console.log(page);
    var containerID = '#' + page + 'Container';
    var hideContainersSelector = '.container:not("'+ containerID +'")';

    $(containerID).removeClass('hide');
    $(hideContainersSelector).addClass('hide');
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
    document.getElementsByClassName('container')[0].appendChild($message);

    setTimeout(function() {
        // executes method
        callback();

        // remove message
        if (removeMessage) {
            $message.parentNode.removeChild($message);
        }
    }, 1000);
}

function getRandomNumber() {
    /* This method generates a random Integer
     * NOTE: max exclusive - min inclusive
     */

    var min = Math.ceil(RANGE_MIN);
    var max = Math.ceil(RANGE_MAX);

    return Math.floor(Math.random() * (max - min)) + min;
}

function isEmptyObject(obj) {
    /* This is a util method to check if an object is empty */
    return Object.keys(obj).length === 0;
}

function _setColor($ball) {
    var number = $ball.innerText;

    if (number >= 1 && number < 10) {
        $($ball).addClass('green');
    } else if (number >= 10 && number < 20) {
        $($ball).addClass('pink');
    } else if (number >= 20 && number < 30) {
        $($ball).addClass('blue');
    } else if (number >= 30 && number < 40) {
        $($ball).addClass('orange');
    } else if (number >= 40 && number < 50) {
        $($ball).addClass('black');
    }
}

var newGame = new Game();
