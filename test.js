/* istanbul ignore next */
describe('handshaking', function () {
  'use strict';

  var shake
    , context = { hi: 'mom' }
    , assume = require('assume')
    , Handshake = require('./');

  beforeEach(function () {
    shake = new Handshake(context);
  });

  afterEach(function () {
    shake.destroy();
  });

  it('can be constructed without new', function () {
    assume(Handshake()).is.instanceOf(Handshake);
  });

  describe('#set', function () {
    it('returns it self', function () {
      assume(shake.set('foo', Number)).equals(shake);
      assume(shake.configuration.foo).equals(Number);
    });
  });

  describe('#parse', function () {
    it('can use type constructors to parse each value', function (next) {
      shake
      .set('version', Number)
      .set('bool', Boolean);

      var calls = 2;

      function parser(err, data) {
        if (err) return next(err);

        assume(data).is.a('object');

        assume(data.version).is.a('number');
        assume(data.bool).is.a('boolean');

        if (!(calls--)) next();
      }

      shake.parse('version=1&bool=false', parser);
      shake.parse('version=0&bool=true', parser);
      shake.parse('version=0&bool=0', parser);
    });

    it('calls the completion callback on parse error', function (next) {
      shake.destroy();
      shake = new Handshake(context, { parse: JSON.parse });

      shake.parse({}, function (err, data) {
        assume(err).is.instanceOf(Error);

        next();
      });
    });

    it('calls with error when theres an error property', function (next) {
      shake.parse('error=shit', function (err) {
        assume(err).is.instanceOf(Error);
        assume(err.message).equals('shit');

        next();
      });
    });

    it('saves the id when we receive an id', function (next) {
      shake.parse('id=foo', function (err, data) {
        assume(data.id).equals('foo');
        assume(shake.id).equals('foo');

        next();
      });
    });
  });

  describe('#destroy', function () {
    it('returns true', function () {
      assume(shake.destroy()).is.true();
    });

    it('returns false on second attempt', function () {
      assume(shake.destroy()).is.true();
      assume(shake.destroy()).is.false();
      assume(shake.destroy()).is.false();
    });
  });
});
