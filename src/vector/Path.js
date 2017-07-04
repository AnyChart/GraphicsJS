goog.provide('acgraph.vector.Path');

goog.require('acgraph.vector.PathBase');



/**
 Path class.<br/>
 Path is sequence of segments of different type, it can be opened or closed.<br/>
 To define the internal fill this rule is used <a target='_blank'
 href="http://www.w3.org/TR/SVG/painting.html#FillProperties">EVEN-ODD</a>.<br/>
 Path always starts with {@link acgraph.vector.Path#moveTo} command.<br/>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#path} or
 {@link acgraph.vector.Layer#path} to create stage or layer bound path.
 <br/> To create unbound path use {@link acgraph.path}
 @see acgraph.vector.Stage#path
 @see acgraph.vector.Layer#path
 @see acgraph.path
 @name acgraph.vector.Path
 @constructor
 @extends {acgraph.vector.PathBase}
 */
acgraph.vector.Path = function() {
  goog.base(this);
};
goog.inherits(acgraph.vector.Path, acgraph.vector.PathBase);


/**
 Resets all path operations.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.clear = function() {
  return /** @type {!acgraph.vector.Path} */ (this.clearInternal());
};


/**
 Moves path cursor position to a specified coordinate.</br>
 Remember that if you call the <b>moveTo</b> method a few times in a row, only the last call will be applied.
 @param {number} x The target point’s X-coordinate.
 @param {number} y The  target point’s Y-coordinate.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.moveTo = function(x, y) {
  return /** @type {!acgraph.vector.Path} */ (this.moveToInternal(x, y));
};


/**
 Adds specified points to the current path, drawing sequentially a straight line through the specified coordinates.
 @param {number} x A target point’s X-coordinate.
 @param {number} y A target point’s Y-coordinate.
 @param {...number} var_args The target points’ coordinates: each odd parameter is interpreted as X and each even as Y.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.lineTo = function(x, y, var_args) {
  return /** @type {!acgraph.vector.Path} */ (acgraph.vector.PathBase.prototype.lineToInternal.apply(this, arguments));
};


/**
 Adds specified points to the path, drawing sequentially a cubic Bézier curve from the current point to the next.
 Each curve is defined by 3 points (6 coordinates) – two control points and an endpoint.
 @param {number} control1X The first control point’s X-coordinate.
 @param {number} control1Y The first control point’s Y-coordinate.
 @param {number} control2X The second control point’s X-coordinate.
 @param {number} control2Y The second control point’s Y-coordinate.
 @param {number} endX The endpoint’s X-coordinate.
 @param {number} endY The endpoint’s Y-coordinate.
 @param {...number} var_args The coordinates, defining curves, in sets of 6: first control points, then an endpoint (in the same order as the primary parameters).
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.curveTo = function(control1X, control1Y, control2X, control2Y, endX, endY, var_args) {
  return /** @type {!acgraph.vector.Path} */ (acgraph.vector.PathBase.prototype.curveToInternal.apply(this, arguments));
};


/**
 Adds specified points to the path, drawing sequentially a quadratic Bézier curve from the current point to the next.
 Each curve is defined by 2 points (4 coordinates) – a control point and an endpoint.
 @param {number} controlX The control point’s X-coordinate.
 @param {number} controlY The control point’s Y-coordinate.
 @param {number} endX The endpoint’s X-coordinate.
 @param {number} endY The endpoint’s Y-coordinate.
 @param {...number} var_args coordinates, defining curves, in sets of four: first the control point, then an endpoint (in the same order as the primary parameters).
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.quadraticCurveTo = function(controlX, controlY, endX, endY, var_args) {
  return /** @type {!acgraph.vector.Path} */ (acgraph.vector.PathBase.prototype.quadraticCurveToInternal.apply(this, arguments));
};


/**
 * Arc with a center in (cx, cy) start angle (from) and end angle (from + sweep),
 * with clockwise and counterclock drawing option.
 * @param {number} cx Center x.
 * @param {number} cy Center y.
 * @param {number} rx X radius.
 * @param {number} ry Y radius.
 * @param {number} from From angle in degrees.
 * @param {number} sweep Sweep angle in degrees.
 * @param {boolean=} opt_lineTo Line to start point. If true - lineTo will be used instead of moveto. False by default.
 * @return {acgraph.vector.Path} Path with predefined data (emulate circle arc).
 */
acgraph.vector.Path.prototype.circularArc = function(cx, cy, rx, ry, from, sweep, opt_lineTo) {
  return /** @type {!acgraph.vector.Path} */ (this.circularArcInternal(cx, cy, rx, ry, from, sweep, opt_lineTo));
};


/**
 Adds a command to the path that draws an arc of an ellipse with radii <b>rx, ry</b> <b>rx, ry</b> from the current point to a point <b>x, y</b>. <br/>
 The <b>largeArc</b> and <b>clockwiseArc</b> flags define which of the 4 possible arcs is drawn.<br/>
 {@link http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes}
 @param {number} x The X-coordinate of the arc end.
 @param {number} y The Y-coordinate of the arc end.
 @param {number} rx The X-axis radius of the ellipse.
 @param {number} ry The Y-axis radius of the ellipse.
 @param {boolean} largeArc A flag allowing to draw either the smaller or the larger arc.
 @param {boolean} clockwiseArc A flag allowing to draw an arc either in a clockwise or in a counterclockwise direction.
 @return {acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.arcToByEndPoint = function(x, y, rx, ry, largeArc, clockwiseArc) {
  return /** @type {!acgraph.vector.Path} */ (this.arcToByEndPointInternal(x, y, rx, ry, largeArc, clockwiseArc));
};


/**
 Adds a command to the path that draws an arc of an ellipse with radii <b>rx, ry</b>, starting from an angle
 <b>fromAngle</b>, with an angular length <b>extent</b>. The positive direction is considered the direction from
 a positive direction of the X-axis to a positive direction of the Y-axis, that is clockwise.<br/>
 @param {number} rx The X-axis radius of the ellipse.
 @param {number} ry The Y-axis radius of the ellipse.
 @param {number} fromAngle The starting angle, measured in degrees in a clockwise direction.
 @param {number} extent The angular length of the arc.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
*/
acgraph.vector.Path.prototype.arcTo = function(rx, ry, fromAngle, extent) {
  return /** @type {!acgraph.vector.Path} */ (this.arcToInternal(rx, ry, fromAngle, extent));
};


/**
 This method is similar to {@link acgraph.vector.Path#arcTo}, but in this case the arc is approximated by Bézier curves.
 <b>Attention!</b> The method is recommended when transformations are used: using the ordinary
 {@link acgraph.vector.Path#arcTo} and {@link acgraph.vector.Path#arcToByEndPoint} methods with transformations
 leads to productivity loss.<br/>
 java.awt.geom.ArcIterator algorithm adoptation
 @param {number} rx The X-axis radius of the ellipse.
 @param {number} ry The Y-axis radius of the ellipse.
 @param {number} fromAngle The starting angle, measured in degrees in a clockwise direction.
 @param {number} extent The angular length of the arc.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.arcToAsCurves = function(rx, ry, fromAngle, extent) {
  return /** @type {!acgraph.vector.Path} */ (this.arcToAsCurvesInternal(rx, ry, fromAngle, extent));
};


/**
 Adds a command that closes the path by connecting the last point with the first straight line.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.Path.prototype.close = function() {
  return /** @type {!acgraph.vector.Path} */ (this.closeInternal());
};


/**
 Returns the last coordinates added to the path.
 @return {goog.math.Coordinate} The current coordinates of the cursor.
 */
acgraph.vector.Path.prototype.getCurrentPoint = function() {
  return this.getCurrentPointInternal();
};


//exports
(function() {
  var proto = acgraph.vector.Path.prototype;
  goog.exportSymbol('acgraph.vector.Path', acgraph.vector.Path);
  proto['moveTo'] = proto.moveTo;
  proto['lineTo'] = proto.lineTo;
  proto['curveTo'] = proto.curveTo;
  proto['quadraticCurveTo'] = proto.quadraticCurveTo;
  proto['arcTo'] = proto.arcTo;
  proto['arcToByEndPoint'] = proto.arcToByEndPoint;
  proto['arcToAsCurves'] = proto.arcToAsCurves;
  proto['circularArc'] = proto.circularArc;
  proto['close'] = proto.close;
  proto['clear'] = proto.clear;
  proto['getCurrentPoint'] = proto.getCurrentPoint;
  proto['getLength'] = proto.getLength;
})();
