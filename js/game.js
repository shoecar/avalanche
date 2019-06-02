(function () {

    window.Ava = window.Ava || {};

    var Coord = Ava.Coord = function (i, j) {
        this.i = i;
        this.j = j;
    };

    Coord.prototype.equals = function (coord2) {
        return (this.i == coord2.i) && (this.j == coord2.j);
    };

    Coord.prototype.isOpposite = function (coord2) {
        return (this.i == (-1 * coord2.i)) && (this.j == (-1 * coord2.j));
    };

    Coord.prototype.plus = function (coord2, board) {
        var i = loopPos(this.i + coord2.i, board.gridHeight);
        var j = loopPos(this.j + coord2.j, board.gridWidth);
        return new Coord(i, j);
    };

    var Player = Ava.Player = function (view, brain, index) {
        this.view = view;
        this.brain = brain;
        this.brain.score = 0;
        this.alive = true;
        this.faceLeft = true;
        this.position = new Coord(view.gridHeight - 1, index % this.view.gridWidth);
    };

    // Player.DIFFS = {
    //     L: new Coord(0, -1),
    //     R: new Coord(0, 1)
    // };

    // Player.prototype.move = function (board) {
    //     if (Math.random() < 0.95) {
    //         return;
    //     }
    //     var direction = Math.random() < .5 ? 'L' : 'R';
    //     this.faceLeft = direction === 'L';
    //     var tempPos = this.position.plus(Player.DIFFS[direction], board);
    //     var i = board.loopPos(tempPos.i, board.gridHeight);
    //     var j = board.loopPos(tempPos.j, board.gridWidth);
    //     this.position = new Coord(i, j);
    // };

    Player.prototype.move = function (board, deadlyIce, warningIce, closeIce, nearIce) {
        var neatInputs = this.checkIce(deadlyIce, warningIce, closeIce, nearIce);
        var neatOutputs = this.brain.activate(neatInputs).map(Math.round);
        // four possible outcomes:
        //    move left: (0 right) - (1 left) = -1
        //   move right: (1 right) - (0 left) =  1
        //      no move: (0 right) - (0 left) =  0
        //      no move: (1 right) - (1 left) =  0
        var jPos = neatOutputs[0] - neatOutputs[1];
        this.position = this.position.plus(new Coord(0, jPos), board);

        // give score if new position has less close ice
        var score = 1 - this.checkIce(deadlyIce, warningIce, closeIce, nearIce)[5] - neatInputs[5];
        if (deadlyIce[this.position.j]) {
            score -= 10;
        } else if (warningIce[this.position.j]) {
            score -= 2;
        }
        this.brain.score = score;
    };

    Player.prototype.checkIce = function (deadlyIce, warningIce, closeIce, nearIce) {
        var j = this.position.j;
        var leftOne = loopPos(j - 1, this.view.gridWidth);
        var rightOne = loopPos(j + 1, this.view.gridWidth);
        var icePositions = [
            deadlyIce[leftOne] ? 1 : 0,   // ice to left
            warningIce[leftOne] ? 1 : 0,  // ice up 1 left
            closeIce[leftOne] ? 1 : 0,  // ice up 2 left
            nearIce[leftOne] ? 1 : 0,  // ice up 3 left
            warningIce[j] ? 1 : 0,      // ice above me 1
            closeIce[j] ? 1 : 0,      // ice above me 2
            nearIce[j] ? 1 : 0,      // ice above me 3
            warningIce[rightOne] ? 1 : 0,  // ice up 1 right
            closeIce[rightOne] ? 1 : 0,  // ice up 2 right
            nearIce[rightOne] ? 1 : 0,  // ice up 3 right
            deadlyIce[rightOne] ? 1 : 0    // ice to right
        ];
        icePositions.push(icePositions.reduce(function (sum, n) { // close ice count
            return sum += n;
        }, 0));
        return icePositions;
    }

    var Ice = Ava.Ice = function (position, waveTime) {
        this.position = position;
        this.waveTime = waveTime;
        this.dropPoint = 0;
    };

    var Board = Ava.Board = function (gridHeight, gridWidth, waveTime, speed) {
        this.gridHeight = gridHeight;
        this.gridWidth = gridWidth;
        this.waveTime = waveTime;
        this.speed = speed;
        this.cycles = 0;
        this.players = [];
        this.playerResults = [];
        this.icicles = [];

        window.setTimeout(function () {
            this.startWave();
        }.bind(this), 500)
    };

    Board.prototype.cycle = function () {
        this.cycles++;

        var deadlyIce = {};
        var warningIce = {};
        var closeIce = {};
        var nearIce = {};
        this.icicles = this.icicles.filter(function (ice) {
            ice.dropPoint += ice.waveTime;
            if (ice.dropPoint > this.speed) {
                ice.dropPoint = 0;
                ice.position.i++;
            }
            if (ice.position.i === this.gridHeight - 1) {
                deadlyIce[ice.position.j] = true;
            } else if (ice.position.i === this.gridHeight - 2) {
                warningIce[ice.position.j] = true;
            } else if (ice.position.i === this.gridHeight - 3) {
                closeIce[ice.position.j] = true;
            } else if (ice.position.i === this.gridHeight - 4) {
                nearIce[ice.position.j] = true;
            }
            return ice.position.i < this.gridHeight;
        }.bind(this));

        this.players = this.players.filter(function (player) {
            if (deadlyIce[player.position.j]) {
                player.brain.score += this.cycles;
                this.playerResults.push(player);
                return false;
            }
            return true;
        }.bind(this));

        if (this.cycles % PLAYER_MOVE_TIME === 0) {
            this.players.forEach(function (player) {
                player.move(this, deadlyIce, warningIce, closeIce, nearIce);
            }.bind(this));
        }

        if (this.cycles % this.waveTime === 0) {
            this.startWave();
        }
    };

    Board.prototype.setPlayers = function (players) {
        this.players = players;
    };

    Board.prototype.startWave = function () {
        for (var i = 0; i < this.gridWidth; i++) {
            this.icicles.push(new Ava.Ice(new Coord(0, i), Math.ceil(Math.random() * 100) + 50));
        }
    };

    function loopPos(position, max) {
        if (position < 0) { return max - 1; }
        if (position >= max) { return 0; }
        return position;
    };

})();
