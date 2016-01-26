var sprintf = require('util').format

// Make a console spinner.
// Code based on code from Mocha by Visionmedia/Tj
// https://github.com/visionmedia/mocha/blob/master/bin/_mocha
function Spinner (message) {
  var spinnerMessage = message;

  this.start = function (opts) {
    var opts = opts || {};
    var self = this;
    var spinner = 'win32' == process.platform ? ['|','/','-','\\'] : ['◜','◠','◝','◞','◡','◟'];

    function play(arr, interval) {
      var len = arr.length, i = 0;
      interval = interval || 100;

      var drawTick = function () {
        var str = arr[i++ % len];
        process.stdout.write('\u001b[0G' + str + '\u001b[90m' + spinnerMessage + '\u001b[0m');
      };

      self.timer = setInterval(drawTick, interval);
    }

    var frames = spinner.map(function(c) {
      return sprintf('  \u001b[96m%s ', c);
    });

    play(frames, opts.fps || 30);
  };

  this.message = function (message) {
    spinnerMessage = message;
  };

  this.stop = function () {
    process.stdout.write('\u001b[0G\u001b[2K');
    clearInterval(this.timer);
  };
}

module.exports = Spinner
