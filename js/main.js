// Global variables
const RAND_MIN = 1;
const RAND_MAX = 50;
const PICKS_PER_GAME = 6;

function generateNumbers() {
    /* Method to generate 6 random numbers, sort them and show them on UI */

    var numbers = [];
    for (var i = 0; i < PICKS_PER_GAME; i++) {
        var number = _getRandomNumber();
        numbers.push(number);
    }

    numbers = numbers.sort();

    _renderNumbers(numbers);

    var msgText = document.createTextNode('Generatining Bonus Number ....');
    var $message = document.createElement('h2');
    $message.classList.add('timed-alert');
    $message.appendChild(msgText);
    document.getElementsByClassName('container')[0].appendChild($message);

    setTimeout(function() {
        var bonusNumber = _getRandomNumber();
        var isBonus = true;

        // display message
        $message.parentNode.removeChild($message);

        // generate a bonus number that do not match with an already extracted number
        while (numbers.indexOf(bonusNumber) > -1) {
            bonusNumber = _getRandomNumber();
        }

        // render bonus number
        _renderNumbers([bonusNumber], true);
    }, 3000);

}

function _renderNumbers(numbers, bonus) {
    /* Method to render numbers */

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
            document.getElementById('ballsRow').appendChild($ball);
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
