(function () {
    window.Ava = window.Ava || {};

    var View = Ava.View = function ($el, milliS) {
        this.$el = $el;
        this.milliS = milliS;
        this.gridHeight = VIEW_HEIGHT;
        this.gridWidth = VIEW_WIDTH;
        this.waveTime = ICE_WAVE_TIME;
        this.speed = ICE_SPEED;
        this.round = 0;
        this.players = [];
        for (var i = 0; i < PLAYERS_COUNT; i++) {
            this.players.push(new Ava.Player(this, i));
        }

        $(window).bind('keydown', this.handleKeyEvent.bind(this));
        $('#start-round').click(this.startRound.bind(this));

        this.scoreCookie = new Ava.Cookie();

        this.buildGrid();
        this.startRound();
    };

    View.KEYS = {
        37: 'L',
        65: 'L',
        39: 'R',
        68: 'R'
    };

    View.prototype.handleKeyEvent = function (event) {
        if (event.keyCode === 27) {
            window.clearInterval(this.intervalId);
            this.escape();
        } else if (!this.intervalId) {
            this.$el.find('.paused').remove();
            this.paint();
            this.intervalId = window.setInterval(this.step.bind(this), this.milliS);
        } else {
            if (View.KEYS[event.keyCode]) {
                this.moveBG(View.KEYS[event.keyCode]);
            } else if (event.keyCode === 32) {
                window.clearInterval(this.intervalId);
                this.intervalId = null;
                this.updateClasses([], 'ice');
                this.$el.prepend('<div class="paused">Game Paused</div>');
            }
        }

    };

    View.prototype.escape = function () {
        window.clearInterval(this.intervalId);
        $(window).unbind('keydown');
    };

    View.prototype.startRound = function () {
        $('#round-info').text('Round ' + ++this.round);
        $('#round-over').hide();

        this.board = new Ava.Board(this.gridHeight, this.gridWidth, this.waveTime, this.speed, this.milliS);
        this.board.setPlayers(this.players.slice());

        try {
            this.intervalId = window.setInterval(this.step.bind(this), this.milliS);
        } catch (exception) {
            window.clearInterval(this.intervalId);
            console.log(exception);
        }
    };

    View.prototype.endRound = function () {
        window.clearInterval(this.intervalId);
        this.setHighScore(this.board.cycles);
        $('#round-score').html(this.board.playerResults.map(function (player) {
            return 'player: ' + player.playerNumber + ' cycles: ' + player.cycles;
        }).join('<br>'));
        $('#round-over').fadeIn();
        // window.setTimeout(function () {
        //     this.startRound();
        // }.bind(this), ROUND_INTERMISSION_MS);
    };

    View.prototype.step = function () {
        $('#score-info').text(this.board.cycles);
        if (this.board.players.length) {
            this.board.cycle();
            this.paint();
        } else {
            this.endRound();
        }
    };

    View.prototype.paint = function () {
        this.updateClasses(this.board.players, 'player');
        this.updateClasses(this.board.icicles, 'ice');
    };

    View.prototype.updateClasses = function(collection, className) {
        this.$cells.filter('.' + className).removeClass();

        collection.forEach(function (model) {
            var flatCoord = (model.position.i * this.gridWidth) + model.position.j;
            this.$cells.eq(flatCoord).addClass(className);
            model.faceLeft && this.$cells.eq(flatCoord).addClass('left');
        }.bind(this));
    };

    View.prototype.buildGrid = function () {
        this.$el.append('<div id="round-info" class="grid-info" data-round="1">Round 1</div>')
        this.$el.append('<div id="score-info" class="grid-info" data-score="0.000">0.00s</div>')
        for (var i = 0; i < this.gridHeight; i++) {
            var row = $('<div class="row">');
            for (var j = 0; j < this.gridWidth; j++) {
                var cell = $('<pre class="cell">');
                row.append(cell);
            }
            this.$el.append(row);
        }
        this.$cells = this.$el.find('pre');
    };

    View.prototype.moveBG = function (dir) {
        if (dir === 'L') {
            var pos1 = $('#avalanche').data('pos1') - 9;
            var pos2 = $('#avalanche').data('pos2') - 20;
            var pos3 = $('#avalanche').data('pos3') - 40;
            $('#avalanche').css('background-position', '-' + pos3 + 'px 450px, -' + pos2 + 'px 270px, -' + pos1 + 'px 0px');
            $('#avalanche').data('pos1', pos1);
            $('#avalanche').data('pos2', pos2);
            $('#avalanche').data('pos3', pos3);
        } else {
            var pos1 = $('#avalanche').data('pos1') + 9;
            var pos2 = $('#avalanche').data('pos2') + 20;
            var pos3 = $('#avalanche').data('pos3') + 40;
            $('#avalanche').css('background-position', '-' + pos3 + 'px 450px, -' + pos2 + 'px 270px, -' + pos1 + 'px 0px')
            $('#avalanche').data('pos1', pos1);
            $('#avalanche').data('pos2', pos2);
            $('#avalanche').data('pos3', pos3);
        }
    };

    View.prototype.setHighScore = function (score) {
        var speed = 'fast';
        if (this.milliS === 20) { speed = 'slow'; }
        if (this.milliS === 10) { speed = 'medium'; }
        if (score > this.scoreCookie.read(speed)) {
            this.scoreCookie.create(speed, score);
            $('#high-score').text(score);
        }
    };
})();
