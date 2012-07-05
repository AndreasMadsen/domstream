/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var vows = require('vows');
var assert = require('assert');

var common = require('../common.js');
var domstream = common.domstream;

var content = fs.readFileSync(common.template, 'utf8');
var expected = JSON.parse(fs.readFileSync(common.parsed, 'utf8'));

vows.describe('testing HTML parser').addBatch({

  'a new document': {
    topic: domstream(content),

    'content property should match input': function (document) {
      assert.strictEqual(document.content, content);
    },
    
    'the content should be parsed as expected': function (document) {
       common.matchTree(document.tree, expected);
    }
  }
}).exportTo(module);
