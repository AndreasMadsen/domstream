/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var chai = require('chai');
var common = require('../common.js');
var domstream = common.domstream;

describe('testing node simple', function () {
  var assert = chai.assert;

  common.createTemplate(function (content) {
    var doc = domstream(content);

    describe('when getting tagName from', function () {

      describe('normal element', function () {
        var result = doc.find().only().elem('html').toValue().tagName();

        it('expect value', function () {
          assert.equal(result, 'html');
        });
      });

      describe('root', expectError(function () {
        doc.find().only().elem('html').toValue().getParent().tagName();
      }));
    });

    describe('when getting content from', function () {

      describe('singleton element', expectError(function () {
        doc.find().only().elem('input').toValue().getContent();
      }));

      describe('normal element', function () {
        var result = doc.find().only().elem('footer').toValue().getContent();

        it('expect value', function () {
          assert.equal(result, 'Bottom');
        });
      });
    });

    describe('when checking for attribute there', function () {
      describe('is missing', function () {
        var result = doc.find().only().elem('html').toValue().hasAttr('missing');

        it('expect false', function () {
          assert.isFalse(result);
        });
      });

      describe('do exist', function () {
        var result = doc.find().only().elem('html').toValue().hasAttr('lang');

        it('expect true', function () {
          assert.isTrue(result);
        });
      });
    });

    describe('when reading attribute there', function () {

      describe('is missing', function () {
          var result = doc.find().only().elem('html').toValue().getAttr('missing');

        it('expect null', function () {
          assert.isNull(result);
        });
      });

      describe('do exist', function () {
        var result = doc.find().only().elem('html').toValue().getAttr('lang');

        it('expect value', function () {
          assert.equal(result, 'en');
        });
      });
    });

    describe('when getting parent from', function () {

      describe('element', function () {
        var result = doc.find().only().elem('head').toValue().getParent();

        it('expect parent node', function () {
          assert.ok(result === doc.find().only().elem('html').toValue());
        });
      });

      describe('root', expectError(function () {
        doc.find().only().elem('html').toValue().getParent().getParent();
      }));
    });

    describe('when getting children from', function () {

      describe('singleton element', expectError(function () {
        doc.find().only().elem('input').toValue().getChildren();
      }));

      describe('normal element', function () {
        var list = doc.find().only().elem('html').toValue().getChildren();

        it('expect child list', function () {
          assert.lengthOf(list, 2);
          assert.ok(list[0].elem === doc.tree.childrens[0].childrens[0]);
          assert.ok(list[1].elem === doc.tree.childrens[0].childrens[1]);
        });
      });
    });

    describe('when executeing isRoot on', function () {

      describe('normal element', function () {
        var result = doc.find().only().elem('html').toValue().isRoot();

        it('expect false', function () {
          assert.isFalse(result);
        });
      });

      describe('root', function () {
        var result = doc.find().only().elem('html').toValue().getParent().isRoot();

        it('expect true', function () {
          assert.isTrue(result);
        });
      });
    });

    describe('when executeing isSingleton on', function () {

      describe('normal element', function () {
        var result = doc.find().only().elem('div').toValue().isSingleton();

        it('expect false', function () {
          assert.isFalse(result);
        });
      });

     describe('singleton element', function () {
        var result = doc.find().only().elem('input').toValue().isSingleton();

        it('expect true', function () {
          assert.isTrue(result);
        });
      });
    });

    describe('when executeing isParentTo on', function () {

      describe('normal child element', function () {
        var html = doc.find().only().elem('html').toValue();
        var body = doc.find().only().elem('body').toValue();

        var result = html.isParentTo(body);

        it('expect true', function () {
          assert.isTrue(result);
        });
      });

      describe('normal none-child element', function () {
        var body = doc.find().only().elem('body').toValue();
        var head = doc.find().only().elem('head').toValue();

        var result = body.isParentTo(head);

        it('expect false', function () {
          assert.isFalse(result);
        });
      });

      describe('singleton element', function () {
        var html = doc.find().only().elem('html').toValue();
        var input = doc.find().only().elem('input').toValue();

        var result = input.isParentTo(html);

        it('expect false', function () {
          assert.isFalse(result);
        });
      });

    });

    function expectError(fn) {
      return function () {
        it('should throw an error', function () {
          var error = null;
          try {
            fn();
          } catch (e) {
            error = e;
          } finally {
              assert.instanceOf(error, Error);
          }
        });
      };
    }
  });
});
