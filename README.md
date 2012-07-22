#domstream

> domstream is document orintered model there supports sending chunks
> as the html file gets manipulated. It should be noted that domstream is
> not a real DOM, but string based. This allow a much faster build process
> but the unfortunat is that domstream requires a very pretty html document
> and is not as sufisticated as the real DOM.

##Goal

1. Be Very Very fast!
  * To set or add something is prioritised over getting something.
2. Provide the same possibilities as the real DOM
3. Expose a `ReadStream` interface, there output the modified document.

##Performance

See [test/benchmark/compare.js](https://github.com/AndreasMadsen/domstream/blob/master/test/benchmark/compare.js)
for benchmark code, or run it yourself with `npm run-script compare`.

Executed on cpu: `2.66 Ghz Intel Core i7` and node: `v0.8.4-pre`.

| Case                        | ms / run - less is better |
|----------------------------:|:--------------------------|
| **a small document** (693 B)                            |
| plates                      | 0.0534                    |
| domstream - no cache        | 0.0461                    |
| domstream - cache           | 0.025                     |
| mustache                    | 0.0177                    |
| **a big document** (5520 B)                             |
| plates                      | 0.305                     |
| domstream - no cache        | 0.2224                    |
| domstream - cache           | 0.1176                    |
| mustache                    | 0.0814                    |

##Installation

```sheel
npm install domstream
```

##Example

```JavaScript
var domstream = require('domstream');
var fs = require('fs');

// File content:
// <!DOCTYPE html>
//   <html lang="en">
//      <head>
//        <title>Unset title</title>
//      </head>
//      <body>
//      </body>
//  </html>
var content = fs.readFileSync('./template.html', 'utf8');

// create a new document
var original = domstream(content);

// after the document has been created, it can be manipulated
// in this case a <script> tag is added to the head
original.find().only().elem('head').toValue().insert('beforeend', '<script></script>');

// any document can be copied at any time
// note that this is much faster than creating a new document from raw text
var document = original.copy();

// this document should be send to the client as a response
document.pipe(process.stdout);
document.resume();

// first describe the nodes there will modified
var title = document.find().only().elem('title').toValue();
document.container([title]);

// a copied document will not effect is source
// overwrite the content in the <title> tag.
// Also call `.done()` to indicate that modification is complete
title.setContent('new title').done();
```

## API documentation

The API exist as three diffrent classes `Document`, `Search` and `Node`.

### Document

A new Document instance is created from the function exported by `require('domstream')`.

All documents are paused `ReadStream`s, they therefore have all the event and methods
associated with a node `ReadStream`.

#### document.copy()

All documents can be copied intro a new document, this allow you to have a standart
response object and create new documents for each diffrent request.

It is also worth noticing that `document.copy()` is much faster than createing a new
object using the function exposed from `require('domstream')`.

#### document.find()

Manipulation of a document must be done from a `node` object. To get a node object
one must first search for it. This is done by using a `search` object. Such object
is returned by `document.find()`.

#### document.live(flag)

When manipulating the document by adding content there contain tags, the document tree
is by default not updated. By executing `document.live(true)` the document tree will be
updated, when any feature changes are made.

This can at anytime be turned off again, by executing `document.live(true)`.

_Note that the performance impact is approximately times three. However it is stil far
more efficient than reparseing the the hole document with
`document = domstream(document.content)`._

#### document.content

The manipulation document text can always be accessed by using `document.content`.

#### document.container(list)

In order to send the `document` in chunks though a `stream`, the `.container` must
be called with an `array` of `node` or list of `node`s.

_Note, this method can only be called once per `document`._

### Search

A new `Search` instance is returned by `document.find()` and `node.find()`.

Any search method except `toArray` and `toValue` returns the `search` object itself.
Search parameters can therefor be `chained`.

_Note that a search will first be performed when `toArray` or `toValue` is called._

#### search.elem(tagname)

Will match all elements with the given `tagname`.

#### search.attr(name, [value])

Will match all elements with the attribute `name`. If a `value` is given too the
attributes value must match that too. The `value` argument can be a `string` or an
regulare expression.

#### search.only()

If the search should only return the first element this method should be used.

_Note that because of the way results are buffered, calling any other search
method after this followed by `toArray` or `toValue` will result in an error._

Example of wrong usage:

```JavaScript
var search = document.find().elem('li').only();

// this will work fine
var listItem = search.toValue();

// This will throw because the cache only contains one element
// and it may not have have id="foo". Perform a new search instead.
var anotherListItem = search.attr('id', 'foo').toValue();
```

#### search.toArray()

This will always return an `array` of nodes, if no elements where found the array
will be empty.

#### search.toValue()

The response depend on how the search was perform and its result.

* If no elements was found this method will return `false`.
* If `search.only()` was called it will return the found `node`.
* If elements was found it will return an `array` of `node`s.

### Node

A node is returned by `search.toArray()`, `search.toValue()`, `node.getParent()`
and `node.getChildren()`.

If the `document` is should be used as a stream `document.container(list)` must be
called.

This allow `domstream` to predict the size and order of the chunks the `ReadStream`
should emit. However it is also required to called `node.done()` once all modiciations
are made. First then will a data chunk be emitted.

If you wich to progressively send data chunks there are created from a database request,
you can use `node.append(data)`. This will insert the data just before the `end-tag` and
send the data until that tag. However after this you can `node.append()` is the only
modification method there is allowed to be called. Be also aware that it is stil a requirement
to call `node.done()`.

Be aware that once `document.container(list)` is called modification is only allowed on nodes
there was defined in `list` or there children. An atempt to modify any other node will result
in `error throw`. However if `document.container(list)` wasn't called any node can be modified.

_Note that `node` objects are reused, so search querys there result in the same `node`
will be equal._

Example of equal nodes:

```JavaScript
var document = domstream('<html lang="en"></html>');

// get the html element
var html = document.find().only().elem('html').toValue();

// get the first element with lang="en"
var lang = document.find().only().attr('lang', 'en').toValue();

// a equal check can the be performed
if (html === lang) {
  // Note: there is a better way to check the attribute value of a node
  console.log('html element contains the attribute lang with value "en"');
}
```

#### node.find()

This returns a new `Search` instance, but it will only find elements within the `node`.
This alllow finding elements within elements.

Example of finding elements within elements:

```JavaScript
// this will always return false, since an element can have to tagnames
var menuItems = document.find().elem('menu').elem('li').toValue();

// insted find the <menu> node and then search for <li> nodes within <menu>
var menuNode = document.find().only().elem('menu').toValue(),
var menuItems = menuNode.find().elem('li').toArray();
```

**The following API is not yet documented:**

#### node.tagName()

will return the tagname of the element.

#### node.isSingleton()

A singleton element can contain attributes but no content, the `<input>` element is
the most known singleton element.

If an element containes `/>` at the end, it is parsed as a singleton element. However
the following elements are parsed as an singleton element with or without `/>`:

```JavaScript
['br', 'col', 'link', 'hr', 'command', 'embed', 'img', 'input', 'meta', 'param', 'source'];
```

This list can be acessed and extended by `require('domstream').NO_ENDING_TAG`.

#### node.isRoot()

The root element do not exist as a string tag, but is pseudo-element there contains
all other top-level elements.

It can not contain attributes nor can it have a parent, using `node.setAttr`,
`node.removeAttr`, `node.getParent`, `node.insert('beforebegin', content)` and
`node.insert('afterend', content)` will therefor throw.

If the node node is the root element `node.isRoot()` will return `true`.

_Note, the only way to get the root-element is to find a top-level element
(ussually `<html>`) and execute `node.getParent()`._

#### node.getParent()

This will return the parent node to the current node.

_Note that using this method on the root element will throw._

#### node.getChildren()

This will return all children to the current node.

_Note, executeing this method on a singleton element will throw._

#### node.isParentTo(child)

Check if this node is parent to `child`. It is the same as `child.getParent() === node`,
but slightly faster.

#### node.insert(where, content)

This is very similar to `insertAdjacentHTML` from the real DOM. It will intert a string
base `content` intro or around the element.

The position is given my the first argument, it can be the following:

* 'beforebegin' inserts the content just before the start-tag.
* 'afterbegin' inserts the content just after the start-tag.
* 'beforeend' inserts the content just before the end-tag.
* 'afterend' inserts the content just after the end-tag.

_Note that using `afterbegin` or `beforeend` on a singleton element will throw.
And that using `beforebegin` or `afterend` on the root element will throw._

#### node.append(content)

Shorthand for `node.insert('beforeend', content)`.

But will also send the content until the `endtag` if this is an container.
This is highly useful in database requests, example:

```JavaScript
var ul = document.find().only().attr('id', 'results').toValue();

request
  .each(function (row) {
    ul.append('<li>' + row + '</li>');
  })
  .done(function () {
    ul.done();
  });
```

_Note that using this method on a singleton element will throw._

#### node.trim()

Will remove all content and child elements between the start- and end-tag.

_Note that using this method on a singleton element will throw._

### node.remove()

Will remove the element and all its content.

_Note that using this method on the root element will throw._

#### node.getContent()

Will return the content between start- and end-tag.

_Note that using this method on a singleton element will throw._

#### node.setContent(content)

Will overwrite the content between start- and end-tag.

_Note that using this method on a singleton element will throw._

#### node.getAttr(name)

Will return the attribute value given by `name` and `null` if it don't exist.

#### node.hasAttr(name)

Will return `true` if the attribute exist and `false` otherwise.

#### node.setAttr(name, value)

Will change the value if the attribute exist or add a new attribute if it didn't exist.

_Note that using this method on the root element will throw._

#### node.removeAttr(name)

Will remove the attribute given by `name`.

_Note that using this method on the root element will throw._

#### node.done()

Will send the content until the endtag, but only if there are no other containers
before this one.

_Note once called no other modify method can be called._

##License

**The software is license under "MIT"**

> Copyright (c) 2012 Andreas Madsen
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
