goog.provide('acgraph.math.Size');
goog.require('goog.math.Size');



/**
 Two-dimensional size class.
 @param {number} w Width.
 @param {number} h Height.
 @constructor
 */
acgraph.math.Size = goog.math.Size;


/**
 Getter for the width.
 @this {acgraph.math.Size}
 @return {number} Width.
 */
acgraph.math.Size.prototype.getWidth = function() {
  return this.width;
};


/**
 Getter for the height.
 @this {acgraph.math.Size}
 @return {number} Height.
 */
acgraph.math.Size.prototype.getHeight = function() {
  return this.height;
};


//exports
goog.exportSymbol('acgraph.math.Size', acgraph.math.Size);
acgraph.math.Size.prototype['getWidth'] = acgraph.math.Size.prototype.getWidth;
acgraph.math.Size.prototype['getHeight'] = acgraph.math.Size.prototype.getHeight;
