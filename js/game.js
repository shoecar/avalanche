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

  var Player = Ava.Player = function (board) {
    this.alive = true;
    this.board = board;
    this.position = new Coord(board.gridHeight - 1, Math.floor(board.gridWidth / 2));
  };

  Player.DIFFS = {
    "L": new Coord(0, -1),
    "R": new Coord(0, 1)
  };

  Player.prototype.isOccupying = function (array) {
    var result = false;
      if (segment.i === array[0] && segment.j === array[1]) {
        result = true;
        return result;
      }
    return result;
  };

  Player.prototype.move = function (dir) {
    var tempPos = this.position.plus(Player.DIFFS[dir]);
    var i = this.board.loopPos(tempPos.i, this.board.gridHeight);
    var j = this.board.loopPos(tempPos.j, this.board.gridWidth);
    this.position = new Coord(i, j);
  };

  var Ice = Ava.Ice = function (position, speed) {
    this.position = position;
    this.speed = speed;
    this.dropPoint = 0;
  };

  var Board = Ava.Board = function (gridHeight, gridWidth, speed) {
    this.gridHeight = gridHeight;
    this.gridWidth = gridWidth;
    this.speed = speed;
    this.iteration = 1;
    this.player = new Player(this);
    this.icicles = [];
  };

  Board.prototype.cycle = function () {
    this.icicles.forEach(function (ice) {
      ice.dropPoint += ice.speed;
      if (ice.dropPoint > 700) {
        ice.dropPoint = 0;
        ice.position.i++;
        if (ice.position.equals(this.player.position)) {
          this.player.alive = false;
        };
      }
    }.bind(this));

    this.iteration++;
    if (this.iteration % this.speed === 0) {
      this.startWave();
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
