(function () {
  if (typeof Ava === "undefined") {
    window.Ava = {};
  }

  var cookie = Ava.Cookie = function () { };

  cookie.prototype.create= function (speed, value) {
      var date = new Date();
      date.setTime(date.getTime()+(30*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
      document.cookie = 'high-score-' + speed + '=' + value + expires + '; path=/';
  };

  cookie.prototype.read = function (speed) {
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
          var c = ca[i];
          while (c.charAt(0) === ' ') {
            c = c.substring(1,c.length);
          }
          if (c.indexOf('high-score-' + speed + '=') == 0) {
            return c.substring('high-score-' + speed + '='.length,c.length);
          }
      }
      return null;
  };
})();
