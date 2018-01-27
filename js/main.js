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
const COLOR_SCHEME = [
    {group: 1, txtColor: '#ffffff', bgColor: '#cde9af', groupMin: 1, groupMax: 9},
    {group: 2, txtColor: '#ffffff', bgColor: '#ffc0c6', groupMin: 10, groupMax: 19},
    {group: 3, txtColor: '#ffffff', bgColor: '#4d4dff', groupMin: 20, groupMax: 29},
    {group: 4, txtColor: '#ffffff', bgColor: '#ffa500', groupMin: 30, groupMax: 39},
    {group: 5, txtColor: '#ffffff', bgColor: '#000000', groupMin: 40, groupMax: 49},
];
const MATCH = { match: 1, draw: [], bonus: null };

var Game = function() {
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
        var $groupsColorScheme = document.getElementsByClassName('group-color-scheme');

        if (!minRange || ! maxRange || !picks) {
        	var msg = 'Sorry! One or more invalid values';
        	alert(msg);
        	return
        }

        if (picks < 1) {
        	var msg = 'Sorry! Invalid value for "Picks per drawn". Please make sure to enter a positive number.';
        	alert(msg);
        	return
        }

        if (minRange > maxRange) {
	        var msg = 'Sorry! Min range number cannot be higher that max range number.';
	        alert(msg);
	        return
        }

	    if (maxRange < minRange) {
		    var msg = 'Sorry! Max range number cannot be lower that min range number.';
		    alert(msg);
		    return
	    }

	    // TODO: This is a terrible way to prevent the computation overload. Need to replace this with an appropriate solution
	    if ((maxRange - minRange + 1) < pick * 3) {
		    var msg = 'Sorry! You are only allowed to set date ranges that are three times bigger than the number of picks for drawn!';
		    alert(msg);
		    return
	    }

        if (picks > (maxRange - minRange + 1)) {
            var msg = 'Sorry! You cannot select a number of picks higher than the available numbers in the range.';
            alert(msg);
            return;
        }

	    var groups = Math.ceil((rangeMaxValue - rangeMinValue) / 10);
        if (!$groupsColorScheme || $groupsColorScheme.length < groups) {
        	var msg = 'Sorry! Missing color schemes for some groups';
        	alert(msg);
        	return
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

        for (var i = 0; i < $groupsColorScheme.length; i++) {
			var textColor = $groupsColorScheme[i].querySelector('.text-color').value;
	        var bgColor = $groupsColorScheme[i].querySelector('.bg-color').value;

	        this.settings.colorScheme[i].txtColor = textColor;
	        this.settings.colorScheme[i].bgColor = bgColor;
        }

        this.updateColorSchemeGroups();

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
        this.renderNumbers(document.querySelector('#drawContainer'), me.currentMatch.draw);
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
        this.renderNumbers(document.querySelector('#bonusContainer'), [me.currentMatch.bonus]);
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

    /* Method to render numbers */
    this.renderNumbers = function($container, numbers) {
        // create a ball-container
        var $bonusRow = document.createElement('DIV');
        $bonusRow.classList.add('row');
        $bonusRow.classList.add('row__space--around');
        $container.appendChild($bonusRow);

        for (var i in numbers) {
            var html = '<div class="ball"><span>' + numbers[i] + '</span>';
            var $document = new DOMParser().parseFromString(html, 'text/html');
            var $ball = $document.documentElement.querySelector('.ball');

            // set the ball color
            this._setColor($ball);

            $container.querySelector('div.row').appendChild($ball);
        }
    };

    this._setColor = function($ball) {
        var number = $ball.innerText;

        for (var i = 0; i < this.settings.colorScheme.length; i++) {
            var groupColorScheme = this.settings.colorScheme[i];
            if (number >= groupColorScheme.groupMin && number <= groupColorScheme.groupMax) {
                $ball.style.backgroundColor = groupColorScheme.bgColor;
                $ball.style.color = groupColorScheme.txtColor;
                return;
            }
        }
    };

    this.updateColorSchemeGroups = function() {
        // get numbers from UI to have updated values
	    var rangeMinValue = parseInt(document.getElementById('minRange').value);
	    var rangeMaxValue = parseInt(document.getElementById('maxRange').value);

	    // identify how many configurable groups we need to render
	    // we use Math.ceil because the remainder of the division forms a new group...
	    // e.g 42 / 10 == 4 groups of 10 elements + 1 group of 2 elements
	    var groups = Math.ceil((rangeMaxValue - rangeMinValue) / 10);

        // if there are less groups than the ones in settings.colorScheme, remove the difference
        if (this.settings.colorScheme.length > groups) {
            this.settings.colorScheme = this.settings.colorScheme.slice(0, groups);
        }

        // update and eventually add groups colorSchemes
        for (var i = 0; i < groups; i++) {
            var groupMin = rangeMinValue + (i * 10);              // inclusive
            var groupMax = rangeMinValue + (i * 10) + 10 - 1;         // exclusive

            if (i < this.settings.colorScheme.length) {
                this.settings.colorScheme[i].groupMin = groupMin;
                this.settings.colorScheme[i].groupMax = groupMax;
            } else {
                this.settings.colorScheme.push({
                    group: i + 1,
                    groupMin: groupMin,
                    groupMax: groupMax,
                    txtColor: '#000000',
                    bgColor: '#dddddd'
                });
            }
        }
    };
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

    for (var i = 0; i < document.getElementsByClassName('page').length; i++) {
        var $container = document.getElementsByClassName('page')[i];
        $container.classList.add('hide');
    }
    document.querySelector(containerID).classList.remove('hide');
};

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

function initSettingsColorConfig(game) {
    /* This method updates the UI with a set of options that allows to change the drawn balls color. */
    // eventually clear existing color scheme groups from the UI
	if (document.querySelector('#configureColors')) {
		while (document.querySelector('#configureColors').hasChildNodes()) {
			document.querySelector('#configureColors').removeChild(document.querySelector('#configureColors').lastChild);
		}
	}

	// create color scheme group from current settings configuration
    for (var i = 0; i < game.settings.colorScheme.length; i++) {
        var group = game.settings.colorScheme[i];

        var html = '<div class="form-group row row__space--between group-color-scheme">';
        html += '[' + [group.groupMin, group.groupMax].join(", ") + ']';
        html += '<input type="color"  class="color-picker text-color" title="ball background color" value="' + group.txtColor+ '"/>';
        html += '<input type="color" class="color-picker bg-color" title="ball text color" value="' + group.bgColor+ '"/>';
        html += '</div>';
        var $document = new DOMParser().parseFromString(html, 'text/html');
        var $group = $document.documentElement.querySelector('.row');

        document.getElementById('configureColors').appendChild($group);
    }
};

function updateColorScheme(game) {
	game.updateColorSchemeGroups();
	initSettingsColorConfig(game);
}

var newGame = new Game();
initSettingsColorConfig(newGame);
