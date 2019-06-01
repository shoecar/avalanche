(function () {
  if (typeof Ava === "undefined") {
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

  var Player = Ava.Player = function (board, startX) {
    this.faceLeft = true;
    this.alive = true;
    this.board = board;
    this.position = new Coord(board.gridHeight - 1, startX ? startX : Math.floor(board.gridWidth / 2));
  };

  Player.DIFFS = {
    "L": new Coord(0, -1),
    "R": new Coord(0, 1)
  };

  Player.prototype.move = function (dir) {
    this.faceLeft = dir === "L";
    var tempPos = this.position.plus(Player.DIFFS[dir]);
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
    this.iteration = 1;
    this.player = new Player(this);
    this.players = [];
    this.icicles = [];

    this.addPlayers(PLAYERS_COUNT);
    window.setTimeout(function () {
      this.startWave();
    }.bind(this), 500)
  };

  Board.prototype.cycle = function () {
    this.icicles.forEach(function (ice) {
      ice.dropPoint += ice.waveTime;
      if (ice.dropPoint > this.speed) {
        ice.dropPoint = 0;
        ice.position.i++;
        if (ice.position.equals(this.player.position)) {
          this.player.alive = false;
        };
        this.players = this.players.filter(function (player) {
          return !(ice.position.equals(player.position));
        });
      }
    }.bind(this));

    this.iteration++;
    if (this.iteration % this.waveTime === 0) {
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
