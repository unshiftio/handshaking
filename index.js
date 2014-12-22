'use strict';

var has = Object.prototype.hasOwnProperty
  , qs = require('querystringify');

/**
 *
 * @constructor
 * @param {Mixed} context Context for the handshakes
 * @param {Object} options Configuration.
 * @api public
 */
function Handshaking(context, options) {
  var unshift = this
    , prefix
    , store
    , sync;

  if (!(unshift instanceof Handshaking)) return new Handshaking(context, options);
  options = options || {};

  sync   = unshift.sync   = (options.sync || 'id').split(/[\,|\s]+/);
  store  = unshift.store  = options.store || Handshaking.store;
  prefix = unshift.prefix = options.prefix || 'unshift';

  unshift.parser = options.parse || qs.parse;
  unshift.context = context || unshift;

  unshift.configuration = {};
  unshift.data = {};

  for (var i = 0; i < sync.length; i++) {
    unshift.data[sync[i]] = store.getItem(prefix +':'+ sync[i]);
  }
}

/**
 * Add a new value parser for the handshake response.
 *
 * @param {String} key Property that we need to parse.
 * @param {Function} parser
 * @returns {Handshaking}
 * @api public
 */
Handshaking.prototype.set = function set(key, parser) {
  this.configuration[key] = parser;

  return this;
};

/**
 * Return the data from a previous handshake.
 *
 * @param {String} key The property that should be returned.
 * @returns {Mixed}
 * @api public
 */
Handshaking.prototype.get = function get(key) {
  return this.data[key];
};

/**
 * Parse the data from the handshake.
 *
 * @param {String} data Data that needs to be parsed.
 * @param {Function} fn Parser completion function.
 * @returns {Handshaking}
 * @api public
 */
Handshaking.prototype.parse = function parse(data, fn) {
  var key
    , unshift = this
    , sync = unshift.sync
    , store = unshift.store
    , prefix = unshift.prefix;

  try { data = unshift.parser(data); }
  catch (e) { return fn.call(unshift.context, e), unshift; }

  for (key in data) {
    if (!has.call(unshift.configuration, key)) continue;
    data[key] = unshift.configuration[key].call(unshift.context, data[key], data);
  }

  //
  // Always remove the id we will re-set it with a new id if needed.
  //
  unshift.store.removeItem(prefix +':id');

  if ('error' in data) {
    return fn.call(unshift.context, new Error(data.error)), unshift;
  }

  for (var i = 0; i < sync.length; i++) {
    if (has.call(data, sync[i])) {
      store.setItem(prefix +':'+ sync[i], data[sync[i]]);
    }
  }

  unshift.data = data;
  fn.call(unshift.context, undefined, data);

  return unshift;
};

/**
 * Destroy the complete handshaking instance so we can be reclaimed by garbage
 * collection.
 *
 * @returns {Boolean}
 * @api public
 */
Handshaking.prototype.destroy = function destroy() {
  if (!this.parser) return false;

  var nulled = 'store prefix parser configuration context data'.split(' ')
    , l = nulled.length
    , i = 0;

  for (; i < l; i++) {
    this[nulled[i]] = null;
  }

  return true;
};

/**
 * The storage layer where we need to store the session id in. Ideally this is
 * stored on the client side until the user closes the window. So we don't
 * introduce pointless bandwidth that needs to be transfered on every request.
 * The sessionStorage API is ideal for this but is not support in every browser
 * and can be disabled in private browsing mode or when cookies are disabled.
 * When this is the case we want to use the `window.name` hack and store data in
 * there. If this is unavailable for some reason we can store it in a cookie or
 * when we run on Node.js where all these methods are unavailable we fallback to
 * an empty object.
 *
 * @type {Object}
 * @private
 */
Handshaking.store = require('sessionstorage');

//
// Expose the handshaking interface
//
module.exports = Handshaking;
