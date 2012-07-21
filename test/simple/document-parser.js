/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var fs = require('fs');
var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

var expected = JSON.parse(fs.readFileSync(common.parsed, 'utf8'));

describe('testing HTML parser', function () {
  var assert = chai.assert;
  common.createTemplate(function (content) {

    describe('when creating a new document', function () {
      var doc = domstream(content);

      it('its content property should match input', function () {
        assert.strictEqual(doc.content, content.toString());
      });

      it('the content should be parsed as expected', function () {
        common.matchTree(doc.tree, expected);
      });

    });
  });
});
