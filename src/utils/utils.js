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
  var type = goog.typeOf(obj);
  if (type == 'array') {
    res = [];
    for (var i = 0; i < obj.length; i++) {
      if (i in obj)
        res[i] = acgraph.utils.recursiveClone(obj[i]);
    }
  } else if (type == 'object') {
    res = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        res[key] = acgraph.utils.recursiveClone(obj[key]);
    }
  } else {
    return obj;
  }

  return res;
};


/**
 * Allows call passed function with large number of parameters.
 * Optimized for browsers.
 * @param {Function} func Function to call.
 * @param {Array} args Array of parameters that is going to be passed to function.
 * @param {Object=} opt_obj This object for function.
 */
acgraph.utils.partialApplyingArgsToFunction = function(func, args, opt_obj) {
  /*if (goog.userAgent.IE && goog.userAgent.VERSION >= 11) {
    for (var j = 0, len = args.length; j < len; j++) {
      func.call(opt_obj, args[j]);
    }
  } else */
  if (goog.userAgent.GECKO || goog.userAgent.IE) {
    func.apply(opt_obj, args);
  } else {
    var start = 0;
    var count = 50000;
    var end = count;
    var step = Math.ceil(args.length / count);

    for (var i = 0; i < step; i++) {
      func.apply(opt_obj, args.slice(start, end));
      start += count;
      end += count;
    }
  }
};


/**
 * Define whether value is set in percent.
 * @param {*} value Value to define.
 * @return {boolean} Is value set in percent.
 */
acgraph.utils.isPercent = function(value) {
  return goog.isString(value) && goog.string.endsWith(value, '%') && !isNaN(parseFloat(value));
};
