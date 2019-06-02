(function () {
    window.Ava = window.Ava || {};

    var Neat = neataptic.Neat
    var Config = neataptic.Config
    // Config.warnings = false

    var View = Ava.View = function ($el, milliS) {
        this.$el = $el;
        this.milliS = milliS;
        this.neat = new Neat(12, 2, null, NEAT_SETTINGS);
        this.gridHeight = VIEW_HEIGHT;
        this.gridWidth = VIEW_WIDTH;
        this.waveTime = ICE_WAVE_TIME;
        this.speed = ICE_SPEED;
        this.round = 0;
        this.sessionScore = 0;
        this.players = [];
        this.timeoutId = null;
        this.running = false;

        // $(window).bind('keydown', this.handleKeyEvent.bind(this));
        // $('#start-round').click(this.startRound.bind(this));

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
            this.escape();
        } else if (!this.intervalId) {
            this.$el.find('.paused').remove();
            this.paint();
            this.intervalId = window.setInterval(this.step.bind(this), this.milliS);
        } else {
            if (View.KEYS[event.keyCode]) {
                this.moveBG(View.KEYS[event.keyCode]);
            } else if (event.keyCode === 32) {
                window.clearTimeout(this.timeoutId);
                this.intervalId = null;
                this.updateClasses([], 'ice');
                this.$el.prepend('<div class="paused">Game Paused</div>');
            }
        }

    };

    View.prototype.escape = function () {
        window.clearTimeout(this.timeoutId);
        $(window).unbind('keydown');
    };

    View.prototype.resetPlayers = function () {
        this.players = [];
        for (var i = 0; i < PLAYERS_COUNT; i++) {
            this.players.push(new Ava.Player(this, this.neat.population[i], i));
        }
    };

    View.prototype.startRound = function () {
        $('#round-info').text('Round ' + ++this.round);
        $('#round-over').hide();

        this.running = true;
        this.resetPlayers();
        this.board = new Ava.Board(this.gridHeight, this.gridWidth, this.waveTime, this.speed, this.milliS);
        this.board.setPlayers(this.players.slice());

        this.step();
    };

    View.prototype.endRound = function () {
        window.clearTimeout(this.timeoutId);
        this.running = false;
        this.setHighScore(this.board.cycles);
        var generation = this.endGeneration();
        $('#round-score').html(generation);
        $('#round-over').fadeIn();
        window.setTimeout(function () {
            this.startRound();
        }.bind(this), ROUND_INTERMISSION_MS);
    };

    View.prototype.endGeneration = function () {
        this.neat.sort();

        var stats = this.neat.population.slice(0, 10).map(function (player) {
            return player.score;
        }).join('<br>');
        // {
        //     generation: this.neat.generation,
        //     max: this.neat.getFittest().score,
        //     avg: Math.round(this.neat.getAverage()),
        //     min: this.neat.population[this.neat.popsize - 1].score
        // };

        var newGeneration = [];

        for (let i = 0; i < this.neat.elitism; i++) {
            newGeneration.push(this.neat.population[i]);
        }

        for (let i = 0; i < this.neat.popsize - this.neat.elitism; i++) {
            newGeneration.push(this.neat.getOffspring());
        }

        this.neat.population = newGeneration;
        this.neat.mutate();
        this.neat.generation++;

        return stats;
    };

    View.prototype.step = function () {
        if (!this.running) {
            return;
        }
        $('#score-info').text(this.board.cycles);
        if (this.board.players.length) {
            this.board.cycle();
            this.paint();
            this.timeoutId = window.setTimeout(this.step.bind(this), this.milliS);
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
        if (score > this.scoreCookie.read(speed) && this.sessionScore) {
            this.scoreCookie.create(speed, score);
            this.sessionScore = score;
            $('#high-score').text(score);
        }
    };
})();
