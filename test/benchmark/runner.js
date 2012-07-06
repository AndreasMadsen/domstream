/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

module.exports = function benchmark(title, runs, fn) {
  console.log('=== ' + title + ' ===');

  var i = runs, times = [], now = 0;
  while(i--) {
    now = Date.now();
    fn();
    times.push(Date.now() - now);
  }

  // calculate results
  var ms = 0;
  times.forEach(function (time) {
    ms += time;
  });

  console.log('benchmark took %d milliseconds', ms / runs);
  console.log();
  console.log();
};
