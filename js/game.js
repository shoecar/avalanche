(function () {
    if (typeof Ava === 'undefined') {
        window.Ava = {};
    }

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

    Coord.prototype.plus = function (coord2) {
        var i = this.i + coord2.i;
        var j = this.j + coord2.j;

        return new Coord(i, j);
    };

    var Player = Ava.Player = function (board, playerNumber) {
        this.playerNumber = playerNumber;
        this.faceLeft = true;
        this.alive = true;
        this.board = board;
        this.cycles = 0;
        this.position = new Coord(board.gridHeight - 1, playerNumber ? playerNumber : Math.floor(board.gridWidth / 2));
    };

    Player.DIFFS = {
        L: new Coord(0, -1),
        R: new Coord(0, 1)
    };

    Player.prototype.move = function () {
        if (Math.random() < 0.95) {
            return;
        }
        var direction = Math.random() < .5 ? 'L' : 'R';
        this.faceLeft = direction === 'L';
        var tempPos = this.position.plus(Player.DIFFS[direction]);
        var i = this.board.loopPos(tempPos.i, this.board.gridHeight);
        var j = this.board.loopPos(tempPos.j, this.board.gridWidth);
        this.position = new Coord(i, j);
    };

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

        this.addPlayers(PLAYERS_COUNT);
        window.setTimeout(function () {
            this.startWave();
        }.bind(this), 500)
    };

    Board.prototype.cycle = function () {
        this.cycles++;

        var deadlyIce = [];
        this.icicles = this.icicles.filter(function (ice) {
            ice.dropPoint += ice.waveTime;
            if (ice.dropPoint > this.speed) {
                ice.dropPoint = 0;
                ice.position.i++;
            }
            if (ice.position.i === this.gridHeight - 1) {
                deadlyIce.push(ice.position.j);
            }
            return ice.position.i < this.gridHeight;
        }.bind(this));

        this.players = this.players.filter(function (player) {
            if (deadlyIce.indexOf(player.position.j) > -1) {
                player.cycles = this.cycles;
                this.playerResults.push(player);
                return false;
            }
            player.move();
            return true;
        }.bind(this));

        if (this.cycles % this.waveTime === 0) {
            this.startWave();
        }
    };

    Board.prototype.addPlayers = function (playersCount) {
        for (var i = 0; i < playersCount; i++) {
            this.players.push(new Ava.Player(this, i));
        }
    };

    Board.prototype.startWave = function () {
        for (var i = 0; i < this.gridWidth; i++) {
            this.icicles.push(new Ava.Ice(new Coord(0, i), Math.ceil(Math.random() * 100) + 50));
        }
    };

    Board.prototype.loopPos = function (position, max) {
        if (position < 0) { return max - 1; }
        if (position >= max) { return 0; }
        return position;
    };
})();
