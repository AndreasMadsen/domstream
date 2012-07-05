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
var document = domstream(content);

var html = document.tree.childrens[0];
var head = html.childrens[0];
var body = html.childrens[1];

var testsuite = vows.describe('testing document search');

testsuite.addBatch({

  'when searching for a missing element using': {

    'tagname':
      expectNoResult(document.find().elem('missing')),

    'attribute name':
      expectNoResult(document.find().attr('missing')),

    'attribute value':
      expectNoResult(document.find().attr('rel', 'missing')),

    'tagname followed by attribute value':
      expectNoResult(document.find().elem('link').attr('data-match', '1')),

    'attribute followed by tagname value':
      expectNoResult(document.find().attr('data-match', '1').elem('missing')),

    'multiply steps': expectNoResult(function () {
      var search = document.find();

      // this will perform a real search for all <link> element
      search.elem('link');
      search.toArray();

      // this will setup search for all <link data-match="1" *>
      // note that such elements do not exist, but a <link *> element and <* data-match="1" *> do.
      search.attr('data-match', '1');

      return search;
    })
  }
});

function expectNoResult(query) {
  return {
    topic: query,

    'toValue returns false': function (search) {
      assert.isFalse(search.toValue());
    },

    'toArray returns empty array': function (search) {
      assert.lengthOf(search.toArray(), 0);
      assert.isEmpty(search.toArray());
    }
  };
}

testsuite.addBatch({

  'when searching with .only() using': {
    'tagname':
      expectOneResult(document.find().only().elem('link'), head.childrens[1]),

    'attribute name':
      expectOneResult(document.find().only().attr('rel'), head.childrens[1]),

    'attribute value':
      expectOneResult(document.find().only().attr('rel', 'stylesheet'), head.childrens[1]),

    'tagname followed by attribute value':
      expectOneResult(document.find().only().elem('link').attr('rel', 'stylesheet'), head.childrens[1]),

    'attribute followed by tagname value':
      expectOneResult(document.find().only().attr('rel', 'stylesheet').elem('link'), head.childrens[1]),

    'multiply steps with only at start': {
      topic: function () {
        var search = document.find();

        // this will perform a real search for the first <link> element
        search.only().elem('link').toValue();

        // since nodeList only contains one element, and futher search
        // will be performed on nodeList, the use is not allowed t
        // add more search criterias, since the will result in a wrong
        // search result
        search.attr('href', 'file_2.css').toValue(); // throw

        return search;
      },

      'it should throw': function (error) {
        assert.instanceOf(error, Error);
      }
    },

    'multiply steps with only at middle': expectOneResult(function () {
      var search = document.find();

      // this will perform a real search for all <link> element
      search.elem('link').toValue();

      // find second link element
      search.only().attr('href', 'file_2.css'); // no throw

      return search;
    }, head.childrens[2]),

    'multiply steps with only at end': expectOneResult(function () {
      var search = document.find();

      // this will perform a real search for all <link> element
      search.elem('link').toValue();

      // find second link element
      search.attr('href', 'file_2.css').only(); // no throw

      return search;
    }, head.childrens[2])
  }
});

function expectOneResult(query, result) {
  return {
    topic: query,

    'toValue returns an element': function (search) {
      assert.strictEqual(search.toValue().elem, result);
    },

    'toArray returns array with one item': function (search) {
      assert.lengthOf(search.toArray(), 1);
      assert.strictEqual(search.toArray()[0].elem, result);
    }
  };
}

var items = body.childrens[1].childrens.concat([body.childrens[2], body.childrens[3]]);

testsuite.addBatch({

  'when searching using': {
    'tagname':
      expectResult(document.find().elem('li'), items),

    'attribute name':
      expectResult(document.find().attr('data-match'), items),

    'attribute value':
      expectResult(document.find().attr('data-match', '1'), [ items[0], items[2], items[3] ]),

    'tagname followed by attribute value':
      expectResult(document.find().elem('li').attr('data-match', '1'), [ items[0], items[2], items[3] ]),

    'attribute followed by tagname value':
      expectResult(document.find().attr('data-match', '1').elem('li'), [ items[0], items[2], items[3] ]),

    'multiply steps': expectResult(function () {
      var search = document.find();

      // this will perform a real search for all <li> element
      search.elem('li');
      search.toArray();

      // this will setup search for all <li data-match="1" *>
      search.attr('data-match', '1');

      return search;
    }, [ items[0], items[2], items[3] ])
  }
});

function expectResult(query, results) {
  var length = results.length;

  return {
    topic: query,

    'toValue returns an element': function (search) {
      assert.lengthOf(search.toValue(), length);

      search.toValue().forEach(function (node, index) {
        assert.strictEqual(node.elem, results[index]);
      });
    },

    'toArray returns array with one item': function (search) {
      assert.lengthOf(search.toArray(), length);

      search.toArray().forEach(function (node, index) {
        assert.strictEqual(node.elem, results[index]);
      });
    }
  };
}

testsuite.exportTo(module);
