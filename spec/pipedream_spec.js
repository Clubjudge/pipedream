describe('Pipedream', function() {
  var assemble = require('../index');
  var response = require('../lib/response');

  it('executes all functions in its chain', function(done) {
    var control = 0,
      fn1 = function($next) {
        control++;
        $next();
      },
      fn2 = function($next) {
        control++;
        $next();
      },
      fn3 = function($next) {
        control++;
        expect(control).toEqual(3);
        done();
        $next();
      };

      assemble(fn1, fn2, fn3)();
  });

  it('returns a promise', function() {
    var first = function($res, $next) {
      expect($res).toEqual(response());
    };

    var dfd = assemble(first)();
    expect(dfd.then).toBeDefined();
  });

  it('fulfills the returned promise when the last function in the pipeline is executed', function(done) {
    var first = function($res, $next) {
      $next('foo');
    };

    var second = function($res, $next) {
      $next('bar');
    };

    var dfd = assemble(first, second)();

    dfd.then(function(response) {
      expect(response).toEqual('bar');
      done();
    });
  });

  it('rejects the returned promise when a function in the pipeline fails', function(done) {
    var first = function($res, $next) {
      $next('foo');
    };

    var second = function($res, $fail) {
      $fail('bar');
    };

    var dfd = assemble(first, second)();

    dfd.fail(function(error) {
      expect(error).toEqual('bar');
      done();
    });
  });

  it('injects a $res variable into the first function in the pipeline with a resource object', function(done) {
    var first = function($res, $next) {
      expect($res).toEqual(response());
      done();
    };

    assemble(first)();
  });

  it('injects arguments into all functions based on an object passed to the result of assemble()', function(done) {
    var fn1 = function($req, query, $next) {
        expect($req).toEqual('foo');
        expect(query).toEqual('blargh');
        $next();
      },
      fn2 = function($req, $next) {
        expect($req).toEqual('foo');
        $next();
      },
      fn3 = function($req, query, $next) {
        expect($req).toEqual('foo');
        expect(query).toEqual('blargh');
        done();
      };

      assemble(fn1, fn2, fn3)({
        $req: 'foo',
        query: 'blargh'
      });
  });

});
