goog.provide('acgraph.utils');

goog.require('goog.userAgent');

/**
 * @namespace
 * @name acgraph.utils
 */


/**
 * Does a recursive clone of the object.
 *
 * @param {*} obj Object to clone.
 * @return {*} Clone of the input object.
 */
acgraph.utils.recursiveClone = function(obj) {
  var res;
  if (goog.isArray(obj)) {
    res = new Array(obj.length);
  } else if (goog.isObject(obj)) {
    res = {};
  } else
    return obj;
  for (var key in obj)
    res[key] = acgraph.utils.recursiveClone(obj[key]);
  return res;
};


/**
 * Allows push to array a large number of elements. Optimized for browsers.
 *
 * @param {Array} array Array to push.
 * @param {Array} args Array of elements.
 */
acgraph.utils.arrayPush = function(array, args) {
  if (goog.userAgent.GECKO) {
    Array.prototype.push.apply(array, args);
  } else if (goog.userAgent.IE) {
    if (goog.userAgent.VERSION >= 11) {
      for (var j = 0, len = args.length; j < len; j++) {
        array.push(args[j]);
      }
    } else {
      Array.prototype.push.apply(array, args);
    }
  } else {
    var start = 0;
    var count = 50000;
    var end = count;
    var step = Math.ceil(args.length / count);

    for (var i = 0; i < step; i++) {
      Array.prototype.push.apply(array, args.slice(start, end));
      start += count;
      end += count;
    }
  }
};

