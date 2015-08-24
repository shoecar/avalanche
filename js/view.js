(function () {
  if (typeof Ava === "undefined") {
    window.Ava = {};
  }

  var View = Ava.View = function ($el, gridHeight, gridWidth, speed) {
    this.$el = $el;
    this.gridHeight = gridHeight;
    this.gridWidth = gridWidth;
    this.speed = speed;
    this.board = new Ava.Board(gridHeight, gridWidth, speed);
    this.buildGrid();

    this.intervalId = window.setInterval(
      this.step.bind(this),
      View.STEP_MILLIS
    );

    $(window).on("keydown", this.handleKeyEvent.bind(this));
  }

  View.KEYS = {
    37: 'L',
    65: 'L',
    39: 'R',
    68: 'R'
  };

  View.STEP_MILLIS = 10;

  View.prototype.handleKeyEvent = function (event) {
    if (View.KEYS[event.keyCode]) {
      this.board.player.move(View.KEYS[event.keyCode]);
    }
  };

  View.prototype.render = function () {
    this.updateClasses([this.board.player], "player");
    this.updateClasses(this.board.icicles, "ice");
  };

  View.prototype.updateClasses = function(collection, className) {
    this.$cells.filter("." + className).removeClass();

    collection.forEach(function(model){
      var flatCoord = (model.position.i * this.gridHeight) + model.position.j;
      this.$cells.eq(flatCoord).addClass(className);
    }.bind(this));
  };

  View.prototype.buildGrid = function () {
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

  View.prototype.step = function () {
    if (this.board.player.alive) {
      this.board.cycle();
      this.render();
    } else {
      $('#game-over').fadeIn();
    }
  };
})();
