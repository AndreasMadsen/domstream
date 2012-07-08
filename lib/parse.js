/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var NO_ENDING_TAG = ['br', 'col', 'link', 'hr', 'command',
'embed', 'img', 'input', 'meta', 'param', 'source'];

// Will parse the entier document intro simple objects
// Note:
//  that .pos use property names there match DOM::insertAdjacentHTML
//  that pos.afterbegin is relative to pos.beforebegin, reduce calculations
//  that pos.afterend is relative to pos.beforeend, reduce calculations
//  that attr.start is relative to last attr.start or pos.beforebegin;
//  that attr.end is relative to attr.start, reduce calculations
function parse(tree) {

  // skip doctype
  var doctype = tree.content.indexOf('<!'),
      begin = tree.content.indexOf('<', doctype + 1),
      end = tree.content.lastIndexOf('>');

  var root = {
    isRoot: true,
    pos: {
      beforebegin: 0,
      afterbegin: begin - 0,
      beforeend: end,
      afterend: (tree.content.length - 1) - end
    },

    childrens: []
  };

  var pos = begin;
  var deep = [root], tag, elem, parent;

  while (true) {
    // get next tag in the document
    tag = nextTag(tree, pos);
    if (tag === null) break;

    // move position to the end of the lastest found tag
    pos = tag.end;

    // if endtag set position to latest element in deep array
    if (tag.isEnd) {
      elem = deep.pop();
      endTag(elem, tag);
      continue;
    }

    // create new tag
    elem = createTag(tree, tag);

    // attach new element to parent
    parent = deep[deep.length - 1];
    elem.parent = parent;
    parent.childrens.push(elem);

    // If element should have an end tag, push it to the deep list
    if (!elem.singleton) {
      deep.push(elem);
    }
  }

  return root;
}
module.exports = parse;
module.exports.NO_ENDING_TAG = NO_ENDING_TAG;

//  check if sign is a space char
function isEmpty(sign) {
  switch (sign) {
    case ' ':
    case '\t':
    case '\r':
    case '\n':
      return true;
    default:
      return false;
  }
}

// Find next tag and return an tag object
function nextTag(tree, position) {
  var start = tree.content.indexOf('<', position);
  var end = tree.content.indexOf('>', start);

  if (start === -1) {
    return null;
  }

  return {
    isEnd: tree.content[start + 1] === '/',
    start: start,
    end: end
  };
}

function endTag(elem, tag) {
  elem.pos.beforeend = tag.start;
  elem.pos.afterend = tag.end - tag.start;
}

function createTag(tree, tag) {
  var elem = {
    pos: {
      beforebegin: tag.start,
      afterbegin: tag.end - tag.start,
      beforeend: null,
      afterend: null
    },
    singleton: false,
    keys: [],
    attr: {}
  };

  // resolve element properties (tagname and attributes)
  var content = tree.content.slice(tag.start + 1, tag.end + 1);
  var buffer, last = 0;
  var attr = {};
  var keys = elem.keys;

  // 0:none 1:tagname, 2:attrname 3:attrvalue
  var state = 1;
  loop:for (var l = content.length, i = 0; i < l; i++) {
    var sign = content[i];

    switch (state) {
      // none: the tagname or the attribute has ended
      case 0:
        switch (sign) {
          case '/': // check for singleton sign
            elem.singleton = true;
            continue loop;
          case '>': // check for tag end
            break loop;
          default:
            // empty sign: skip
            if (isEmpty(sign)) continue loop;
            // assume new attribute
            state = 2;
            attr.start = i + 1;
            last = i;
            continue loop;
        }
      break;

      // tagname: the tagname is in progress
      case 1:
        switch (sign) {
          case '/': // check for singleton sign
            elem.singleton = true;
            state = 0;
            elem.tagname = content.slice(last, i);
            continue loop;
          case '>': // check for tag end
            state = 0;
            elem.tagname = content.substr(last, i);
            break loop;
          default:
            // empty sign: out of state
            if (isEmpty(sign)) {
              elem.tagname = content.slice(last, i);
              state = 0;
              continue loop;
            }
            // tagname continues
            continue loop;
        }
      break;

      // attrname: a new attribute has started
      case 2:
        switch (sign) {
          // attribute value should follow
          case '=':
            // set name and skip ' or "
            buffer = content.slice(last, i);
            attr.name = buffer;
            keys.push(buffer);
            state = 3;
            i += 1;
            last = i + 1;
            continue loop;
          case '/': // check for singleton sign
            elem.singleton = true;
            state = 0;
            attr.end = i - attr.start;
            buffer = content.slice(last, i);
            attr.name = buffer;
            attr.value = null;
            keys.push(buffer);
            elem.attr[attr.name] = attr;
            continue loop;
          case '>': // check for tag end
            state = 0;
            attr.end = i - attr.start;
            buffer = content.slice(last, i);
            attr.name = buffer;
            attr.value = null;
            keys.push(buffer);
            elem.attr[attr.name] = attr;
            break loop;
          default:
            // empty sign: out of state
            if (isEmpty(sign)) {
              attr.end = i - attr.start;
              buffer = content.slice(last, i);
              attr.name = buffer;
              attr.value = null;
              keys.push(buffer);
              state = 0;

              // save attr and reset buffer
              elem.attr[attr.name] = attr;
              attr = {};

              continue loop;
            }

            continue loop;
        }
      break;

      // attrvalue: the attribute value
      case 3:
        switch (sign) {
          case '"':
          case '\'':
            attr.end = i - attr.start + 1;
            attr.value = content.slice(last, i);

            // save attr and reset buffer
            elem.attr[attr.name] = attr;
            state = 0;
            attr = {};
            continue loop;
          default:
            continue loop;
        }
      break;

      // something must be wrong
      default:
        throw new Error('could not pass document');
    }
  }

  // check singleton, it is only added if true to reduce copy time
  var singleton = elem.singleton || NO_ENDING_TAG.indexOf(elem.tagname) !== -1;
  if (singleton) {
    elem.singleton = singleton;
  }

  if (!elem.singleton) {
    elem.childrens = [];
  }

  return elem;
}
