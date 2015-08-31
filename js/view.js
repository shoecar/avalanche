(function () {
  if (typeof Ava === "undefined") {
    window.Ava = {};
  }

  var View = Ava.View = function ($el, milliS) {
    this.$el = $el;
    this.milliS = milliS;
    this.gridHeight = 20;
    this.gridWidth = 20;
    this.waveTime = 200;
    this.speed = 700;
    this.board = new Ava.Board(this.gridHeight, this.gridWidth, this.waveTime, this.speed);
    this.buildGrid();

    $(window).bind('keydown', this.handleKeyEvent.bind(this));

    this.intervalId = window.setInterval(this.step.bind(this), this.milliS);

    this.scoreCookie = new Ava.Cookie();
  }

  View.KEYS = {
    37: 'L',
    65: 'L',
    39: 'R',
    68: 'R'
  };

  View.prototype.handleKeyEvent = function (event) {
    if (!this.intervalId) {
      this.board.player.alive = true;
      this.$el.find('.paused').remove();
      this.render();
      this.intervalId = window.setInterval(this.step.bind(this), this.milliS);
    } else {
      if (View.KEYS[event.keyCode]) {
        this.board.player.move(View.KEYS[event.keyCode]);
        this.moveBG(View.KEYS[event.keyCode]);
      } else if (event.keyCode === 32 && this.board.player.alive) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
        this.updateClasses([], 'ice');
        this.$el.prepend('<div class="paused">Game Paused</div>');
      }
    }

  };

  View.prototype.render = function () {
    var faceLeft = this.board.player.faceLeft ? 'left' : null;
    this.updateClasses([this.board.player], 'player', faceLeft);
    this.updateClasses(this.board.icicles, 'ice');
  };

  View.prototype.updateClasses = function(collection, className, faceLeft) {
    this.$cells.filter('.' + className).removeClass();
    faceLeft && this.$cells.filter('.left').removeClass();

    collection.forEach(function(model){
      var flatCoord = (model.position.i * this.gridWidth) + model.position.j;
      this.$cells.eq(flatCoord).addClass(className);
      faceLeft && this.$cells.eq(flatCoord).addClass('left');
    }.bind(this));
  };

  View.prototype.buildGrid = function () {
    this.$el.append('<div id="score" data-score="0.000">0.00s</div>')
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
    var score = parseFloat($('#score').data('score')) + this.milliS / 1000;
    $('#score').data('score', score.toFixed(3));
    $('#score').text(score.toFixed(2) + 's');
    if (this.board.player.alive) {
      this.board.cycle();
      this.render();
    } else {
      $('#score').text('');
      $('#final-score').text('You survived for ' + score.toFixed(2) + ' seconds')
      this.setHighScore(score);
      $('#game-over').fadeIn();
      $(window).unbind('keydown');
      window.clearInterval(this.intervalId);
    }
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
    var speed = 'medium';
    if (this.milliS === 20) { speed = 'slow'; }
    if (this.milliS === 5) { speed = 'fast'; }
    if (score > this.scoreCookie.read(speed)) {
      this.scoreCookie.create(speed, score.toFixed(2));
      $('#high-score').text(score.toFixed(2) + ' seconds');
    }
  };
})();
