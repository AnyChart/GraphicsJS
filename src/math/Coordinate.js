goog.provide('acgraph.math.Coordinate');
goog.require('goog.math.Coordinate');



/**
 * Two-dimensional coordinate class.
 * @param {number} x X-coordinate.
 * @param {number} y Y-coordinate.
 * @constructor
 *
 */
acgraph.math.Coordinate = goog.math.Coordinate;


/**
 * Returns the distance between two coordinates.
 * @param {!goog.math.Coordinate} a The first coordinate.
 * @param {!goog.math.Coordinate} b The second coordinate.
 * @return {number} The distance between {@code a} and {@code b}.
 */
acgraph.math.Coordinate.distance = goog.math.Coordinate.distance;


/**
 * Compares coordinates for equality.
 * @param {acgraph.math.Coordinate} a A Coordinate.
 * @param {acgraph.math.Coordinate} b A Coordinate.
 * @return {boolean} True iff the coordinates are equal, or if both are null.
 */
acgraph.math.Coordinate.equals = goog.math.Coordinate.equals;


/**
 Getter for the X-coordinate.
 @this {acgraph.math.Coordinate}
 @return {number} X-coordinate.
 */
acgraph.math.Coordinate.prototype.getX = function() {
  return this.x;
};


/**
 Getter for the Y-coordinate.
 @this {acgraph.math.Coordinate}
 @return {number} The Y-coordinate.
 */
acgraph.math.Coordinate.prototype.getY = function() {
  return this.y;
};


//exports
goog.exportSymbol('acgraph.math.Coordinate', acgraph.math.Coordinate);
acgraph.math.Coordinate.prototype['getX'] = acgraph.math.Coordinate.prototype.getX;
acgraph.math.Coordinate.prototype['getY'] = acgraph.math.Coordinate.prototype.getY;
