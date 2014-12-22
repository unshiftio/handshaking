# handshaking

[![Made by unshift][made-by]](http://unshift.io)[![Version npm][version]](http://browsenpm.org/package/handshaking)[![Build Status][build]](https://travis-ci.org/unshiftio/handshaking)[![Dependencies][david]](https://david-dm.org/unshiftio/handshaking)[![Coverage Status][cover]](https://coveralls.io/r/unshiftio/handshaking?branch=master)[![IRC channel][irc]](http://webchat.freenode.net/?channels=unshift)

[made-by]: https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square
[version]: https://img.shields.io/npm/v/handshaking.svg?style=flat-square
[build]: https://img.shields.io/travis/unshiftio/handshaking/master.svg?style=flat-square
[david]: https://img.shields.io/david/unshiftio/handshaking.svg?style=flat-square
[cover]: https://img.shields.io/coveralls/unshiftio/handshaking/master.svg?style=flat-square
[irc]: https://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square

Handshaking is the client library for [handshake]. It parsers the handshake
responses from the server using a similar API.

## Installation

The module was designed to be used with browserify or node.js and is therefor
released in the public npm registry. You can install it using:

```
npm install --save handshaking
```

## Usage

In all the examples we assume that you've already required and setup the
Handshaking instance using:

```js
'use strict';

var Handshaking = require('handshaking');
```

To construct a new `Handshaking` instance we need two things:

1. A context/scope/this value for all the callbacks that we execute. Which is
   required but can be set to null, undefined or whatever.
2. Options for further configuring the Handshaking.

So for the optional options, you can supply the following properties:

- **`prefix`** The prefix we should use for storing data in
  cookie/session/store. Defaults to `unshift`.
- **`store`** Store which we will use to save the received session id in. Should
  follow the `sessionStore` DOM API. Defaults to the `sessionstore` module.
- **`parse`** Initial response parser. Defaults to `querystringify.parse`

For our examples we just assume it has been setup as following:

```js
var handshaking = new Handshaking();
```

### set

The set method allows you to assign new parsers for properties of the handshake
object. The method requires 2 arguments:

1. `key` The name of the property who's value we should parse.
2. `parser` The actual parser function which will receive the value.

```js
handshaking
.set('version', Number)
.set('enabled', Boolean)
.set('custom', function parser(value) {
  return value.split(';');
});
```

### parse

Parse the received handshake data. This method requires 2 arguments:

1. `data` The data that is received during handshaking.
2. `fn` Completion function for when all data is parsed. This function should
   follow an error first callback pattern. When an error is received, the
   assumption should be made that the handshake has failed.

```js
handshaking.parse('foo=bar&bar=1', function (err, data) {
  console.log(data.foo);
});
```

### destroy

Destroy the created handshaking instance. This releases all internal references so
it can be reclaimed by the garbage collector.

```js
handshaking.destroy();
```

## License

MIT

[handshake]: https://github.com/unshiftio/handshake
