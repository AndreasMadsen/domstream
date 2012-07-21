/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

module.exports = function benchmark(title, runs, fn) {
  console.log('=== ' + title + ' ===');

  var i = runs;
  var now = Date.now();
  while(i--) {
    fn();
  }

  // calculate results
  var ms = Date.now() - now;

  console.log('speed: %d milliseconds / run', ms / runs);
  console.log();
  console.log();
};
