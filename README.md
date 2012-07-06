#domstream

> domstream is document orintered model there supports sending chunks
> as the html file gets manipulated. It should be noted that domstream is
> not a real DOM, but string based. This allow a much faster build process
> but the unfortunat is that domstream requires a very pretty html document
> and is not as sufisticated as the real DOM.

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
//   <html lang="unset">
//      <head>
//        <title>Unset title</title>
//      </head>
//      <body></body>
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

// a copied document will not effect is source
// in this case the <html lang attribute is set
document.find().only().elem('html').toValue().setAttr('lang', 'en');

// overwrite the content in the <title> tag
document.find().only().elem('title').toValue().setContent('new title');
```

## API documentation

**Note the following API is implemented, but the stream interface is missing.**

The API exist as three diffrent classes `Document`, `Search` and `Node`.

### Document

A new Document instance is created from the function exported by `require('domstream')`.

#### document.copy()

All documents can be copied intro a new document, this allow you to have a standart
response object and create new documents for each diffrent request.

It is also worth noticing that `document.copy()` is much faster than createing a new
object using the function exposed from `require('domstream')`.

#### document.find()

Manipulation of a document must be done from a `node` object. To get a node object
one must first search for it. This is done by using a `search` object. Such object
is returned by `document.find()`.

#### document.content

The manipulation document text can always be accessed by using `document.content`.

### Search

A new `Search` instance is returned by `document.find()` and `node.find()`.

Any search method except `toArray` and `toValue` returns the `search` object itself.
Search parameters can therefor be `chained`.

Note that a search will first be performed when `toArray` or `toValue` is called.

#### search.elem(tagname)

Will match all elements with the given `tagname`.

#### search.attr(name, [value])

Will match all elements with the attribute `name`. If a `value` is given too the
attributes value must match that too. The `value` argument can be a `string` or an
regulare expression.

#### search.only()

If the search should only return the first element this method should be used.
Note that because of the way results are buffered, calling any other search
method after this followed by `toArray` or `toValue` will result in an error.

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

Note that `node` objects are reused, so search querys there result in the same `node`
will be equal.

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

#### node.isSingleton()

#### node.isRoot()

#### node.getParent()

#### node.getChildren()

#### node.isParentTo(child)

#### node.insert(where, content)

#### node.append(content)

#### node.trim()

#### node.getContent()

#### node.setContent(content)

#### node.getAttr(name)

#### node.hasAttr(name)

#### node.setAttr(name, value)

#### node.removeAttr(name)

#### node.done()

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
