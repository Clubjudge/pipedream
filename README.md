# Pipedream

A function composition pipeline. Use it to progressively transform a resource into its final form.

# How to use it

## Simple example
Pipedream only exposes a single function, used to compose other functions:

```javascript
var assembe = require('pipedream-js');

var fn1 = function() {
  //...
};

var fn2 = function() {
  //...
};

var fn3 = function() {
  //...
};

var handler = assemble(fn1, fn2, fn3);
```

## Async operations

In order to support async operations, it uses the [Q](https://github.com/kriskowal/q) library to return a promise:

```javascript
var handler = assemble(fn1, fn2, fn3);

handler()
  .then(function() {
    // All composed functions have returned successfully!
  })
  .fail(function(error) {
    // One of the functions failed while processing.
    // Look into the error return to find out more.
  });
```

## Flow control

In the signature of any composed function, you can include the special ```$next``` and ```$fail``` arguments. These are injected automatically using [Syringe](https://github.com/Clubjudge/syringe). You can use these functions to yield to the next function to the pipeline or introduce a failure state in the chain.

```javascript
// A composed function
var fn1 = function($next, $fail) {
  someOperation(function(err) {
    if (!err) {
      $next();
    } else {
      $fail('someOperation failed miserably :(');
    }
  });
};
```

## The result object

At the beginning of the pipeline an empty object is injected and assigned to the special ```$res``` parameter. Your functions may then require this parameter in their signatures and mutate it how they see fit. When a function yields by calling ```$next``` the ```$res``` object is passed as it is to the next function in the pipeline.

```javascript
// Some composed functions
var fn1 = function($res, $next, $fail) {
  someOperation(function(result, err) {
    if (!err) {
      $res = result;
      $next();
    } else {
      $fail('someOperation failed miserably :(');
    }
  });
};

var fn2 = function($res) {
  // The value of $res is equal to the last assignment to it in fn1, result.
};
```

## Parameter injection

The result of calling Pipedream with a set of functions is a function itself. Any parameters you pass when you call this function are automatically injected into every function of the pipeline. Refer to [Syringe](https://github.com/Clubjudge/syringe)'s documentation to find out more about how to inject parameters.

In this example, a parameter named ```foo``` will be made to every function that requests it and hold a value of ```bar```.

```javascript
var assembe = require('pipedream-js');
var handler = assemble(fn1, fn2, fn3);

handler({
  foo: 'bar'
});
```

# Contributing
Bug fixes and new features are of course very welcome!

To get started developing: 
 - Install [Grunt](http://gruntjs.com/)
 - Install dependencies with ```npm install```
 - Run the test suite with ```npm test```

Please accompany any Pull Requests with the relevant test cases and make sure everything else still passes :).

# Credits
Shout out to @inf0rmer and @agravem.
