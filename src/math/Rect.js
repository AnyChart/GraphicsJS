goog.provide('acgraph.math.Rect');
goog.require('goog.math.Rect');



/**
 Rectangle class.
 @param {number} x X-coordinate.
 @param {number} y Y-coordinate.
 @param {number} w Width.
 @param {number} h Height.
 @constructor
 */
acgraph.math.Rect = goog.math.Rect;


/**
 Getter for the X-coordinate of a rectangle.
 @this {acgraph.math.Rect}
 @return {number} The X-coordinate of the left side of a rectangle.
 */
acgraph.math.Rect.prototype.getLeft = function() {
  return this.left;
};


/**
 Getter for the top of a rectangle.
 @this {acgraph.math.Rect}
 @return {number} The Y-coordinate of the top of a rectangle.
 */
acgraph.math.Rect.prototype.getTop = function() {
  return this.top;
};


/**
 Getter for the width of a rectangle.
 @this {acgraph.math.Rect}
 @return {number} The width of a rectangle.
 */
acgraph.math.Rect.prototype.getWidth = function() {
  return this.width;
};


/**
 Getter for the height of a rectangle.
 @this {acgraph.math.Rect}
 @return {number} The height of a rectangle.
 */
acgraph.math.Rect.prototype.getHeight = function() {
  return this.height;
};


/**
 Getter for the right side of a rectangle.
 @this {acgraph.math.Rect}
 @return {number} The X-coordinate of the right side of a rectangle.
 */
acgraph.math.Rect.prototype.getRight = function() {
  return this.left + this.width;
};


/**
 Getter for the bottom of a rectangle.
 @this {acgraph.math.Rect}
 @return {number} The Y-coordinate of the bottom of a rectangle.
 */
acgraph.math.Rect.prototype.getBottom = function() {
  return this.top + this.height;
};


//region --- Declarations for IDEA ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Declarations for IDEA
//
//----------------------------------------------------------------------------------------------------------------------
// Prevents IDEA from throwing warnings about undefined fields.
/**
 * @type {number}
 */
acgraph.math.Rect.prototype.left;


/**
 * @type {number}
 */
acgraph.math.Rect.prototype.top;


/**
 * @type {number}
 */
acgraph.math.Rect.prototype.width;


/**
 * @type {number}
 */
acgraph.math.Rect.prototype.height;


/**
 * @param {goog.math.Rect} a The first rectangle.
 * @param {goog.math.Rect} b The second rectangle.
 * @return {boolean} Returns “true” if the rectangles coincide, and “false” if they do not.
 */
acgraph.math.Rect.equals = goog.math.Rect.equals;


/**
 * Extends the borders of the current rectangle so that they include a given one.
 * @param {goog.math.Rect} rect The rectangle which will be included in the current.
 */
acgraph.math.Rect.prototype.boundingRect;


/**
 * @return {!acgraph.math.Rect} A copy of a rectangle.
 */
acgraph.math.Rect.prototype.clone;


/**
 * @return {!acgraph.math.Size} The sizes of a rectangle.
 */
acgraph.math.Rect.prototype.getSize;


/**
 * Returns a nice string representing size and dimensions of rectangle.
 * Override parent method because there used only in debug version.
 * @return {string} In the form (50, 73 - 75w x 25h).
 * @override
 */
acgraph.math.Rect.prototype.toString = function() {
  return '(' + this.left + ', ' + this.top + ' - ' + this.width + 'w x ' + this.height + 'h)';
};
//endregion


//exports
goog.exportSymbol('acgraph.math.Rect', acgraph.math.Rect);
acgraph.math.Rect.prototype['getLeft'] = acgraph.math.Rect.prototype.getLeft;
acgraph.math.Rect.prototype['getTop'] = acgraph.math.Rect.prototype.getTop;
acgraph.math.Rect.prototype['getWidth'] = acgraph.math.Rect.prototype.getWidth;
acgraph.math.Rect.prototype['getHeight'] = acgraph.math.Rect.prototype.getHeight;
acgraph.math.Rect.prototype['getRight'] = acgraph.math.Rect.prototype.getRight;
acgraph.math.Rect.prototype['getBottom'] = acgraph.math.Rect.prototype.getBottom;
