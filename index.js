(function() {
  var _,
    Q = require('q'),
    assemble,
    pipeline,
    construct,
    finalize,
    inject,
    response;

  _ = require('lodash');
  inject = require('syringe-js');
  response = require('./lib/response');

  construct = function($yield) {
    $yield(response());
  };

  pipeline = function(callbacks, result, args, dfd) {
    if (!callbacks.length) {
      dfd.resolve(result);
      return;
    }

    var fn = inject(callbacks[0], args , {
      $res: result,
      $yield: function(result) {
        process.nextTick(function() {
          pipeline.call(this, callbacks.slice(1), result, args, dfd);
        });
      }.bind(this),
      $fail: function(error) {
        dfd.reject(error);
      }
    });

    fn();
  };

  assemble = function() {
    var callbacks = Array.prototype.slice.apply(arguments);
    callbacks = [construct].concat(callbacks);

    return function() {
      var dfd = Q.defer();
      pipeline(callbacks, null, Array.prototype.slice.call(arguments), dfd);

      return dfd.promise;
    }.bind(this);
  };

  module.exports = assemble;
}());
