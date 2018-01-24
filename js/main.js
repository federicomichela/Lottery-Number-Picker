// Global variables
const RAND_MIN = 1;
const RAND_MAX = 50;

function generateNumbers() {
    /* Method to generate 6 random numbers, sort them and show them on UI */

    var numbers = [];
    for (var i = 0; i < 6; i++) {
        var number = _getRandomNumber();
        numbers.push(number);
    }

    numbers = numbers.sort();

    _renderNumbers(numbers);
}

function _renderNumbers(numbers) {
    /* Method to render numbers */

    for (var i in numbers) {
        // create the DOM element
        var $ball = document.createElement('DIV');

        // assign a class for styling purposes
        var $text = document.createTextNode(numbers[i]);

        // update the DOM
        $ball.class = 'ball';
        $ball.appendChild($text);

        document.body.appendChild($ball);
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
