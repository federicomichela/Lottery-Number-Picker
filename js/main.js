// Global variables
const RAND_MIN = 1;
const RAND_MAX = 50;
const PICKS_PER_GAME = 6;

var gamesHistory = [];

function play() {
    /* Method to generate 6 random numbers, sort them and show them on UI */

    // disable button to avoid new games to start before the end of the current one
    document.getElementById('btnStartGame').setAttribute('disabled', 'disabled');

    // eventually reset old game...
    _resetGame();

    _action('Your Lottery Numbers Are ...', function() {
        // generate random numbers
        var numbers = [];
        for (var i = 0; i < PICKS_PER_GAME; i++) {
            var number = _getRandomNumber();
            numbers.push(number);
        }

        // sort numbers asc
        numbers = numbers.sort();

        // render numbers to UI
        _renderNumbers(numbers);

        // generate a bonus number that do not match with an already extracted number
        _action('AND YOUR BONUS NUMBER IS ...', function() {
            var bonusNumber = _getRandomNumber();
            var isBonus = true;

            while (numbers.indexOf(bonusNumber) > -1) {
                bonusNumber = _getRandomNumber();
            }
            // render bonus number
            _renderNumbers([bonusNumber], isBonus);

            // re-enable start button to allow user to start a new game
            document.getElementById('btnStartGame').removeAttribute('disabled');
        });
    });
}

function showPage(e) {
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

function _action(message, callback, removeMessage) {
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

function _renderNumbers(numbers, bonus) {
    /* Method to render numbers */

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

            var $bonusRow = document.createElement('DIV');
            $bonusRow.classList.add('balls-container');
            $bonusRow.appendChild($ball);
            document.getElementsByClassName('container')[0].appendChild($bonusRow);
        } else {
            // set the ball color
            _setColor($ball);

            document.getElementsByClassName('balls-container')[0].appendChild($ball);
        }
    }
}

function _getRandomNumber() {
    /* This method generates a random Integer
     * NOTE: max exclusive - min inclusive
     */

    var min = Math.ceil(RAND_MIN);
    var max = Math.ceil(RAND_MAX);

    return Math.floor(Math.random() * (max - min)) + min;
}

function _resetGame() {
    var remove = ['balls-container', 'alert'];
    var $rows = null;

    for (var i = 0; i < remove.length; i++) {
        $rows = document.getElementsByClassName(remove[i]);

        for (var j = 0; j < $rows.length; j++) {
            $rows[j].parentNode.removeChild($rows[j]);
        }
    }
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
