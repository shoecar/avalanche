(function () {
  if (typeof Ava === "undefined") {
    window.Ava = {};
  }

  var View = Ava.View = function ($el, milliS) {
    this.$el = $el;
    this.gridHeight = 20;
    this.gridWidth = 20;
    this.waveTime = 200;
    this.speed = 700;
    this.board = new Ava.Board(this.gridHeight, this.gridWidth, this.waveTime, this.speed);
    this.buildGrid();

    $(window).on("keydown", this.handleKeyEvent.bind(this));

    this.intervalId = window.setInterval(
      this.step.bind(this),
      milliS
    );
  }

  View.KEYS = {
    37: 'L',
    65: 'L',
    39: 'R',
    68: 'R'
  };

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
    this.$el.append('<div id="score">0.00s</div>')
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
    var score = parseFloat($('#score').text()) + 0.01;
    $('#score').text(score.toFixed(2) + 's');
    if (this.board.player.alive) {
      this.board.cycle();
      this.render();
    } else {
      var $highScore = $('#high-score');
      $('#score').text('');
      $('#final-score').text('You survived for ' + score.toFixed(2) + ' seconds')
      if (score > parseFloat($highScore.data('score'))) {
        $highScore.data('score', score).text(score.toFixed(2) + ' seconds');
      }
      $('#game-over').fadeIn();
      window.clearInterval(this.intervalId);
    }
  };
})();
