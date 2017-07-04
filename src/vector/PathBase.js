goog.provide('acgraph.vector.PathBase');

goog.require('acgraph.error');
goog.require('acgraph.math');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Shape');
goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.math.AffineTransform');
goog.require('goog.math.Coordinate');



/**
 * PathBase
 * @constructor
 * @extends {acgraph.vector.Shape}
 */
acgraph.vector.PathBase = function() {
  /**
   * Types of path segments.
   * @type {!Array.<number>}
   * @private
   */
  this.segments_ = [];

  /**
   * Number of segments of each type (similar sequential segments wrap into segments_)
   * @type {!Array.<number>}
   * @private
   */
  this.count_ = [];

  /**
   * Arguments for each segment. For "simple" paths - only coordinates pairs, for "complex" - other elements may be present.
   * @type {!Array.<number>}
   * @private
   */
  this.arguments_ = [];

  goog.base(this);
};
goog.inherits(acgraph.vector.PathBase, acgraph.vector.Shape);


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Segment types.
 * @enum {number}
 */
acgraph.vector.PathBase.Segment = {
  MOVETO: 1,
  LINETO: 2,
  CURVETO: 3,
  ARCTO: 4,
  CLOSE: 5
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Static members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Maximal angle that can be drawn with a single arc. If arc is bigger than this
 * it is broken into several arcs.
 * @type {number}
 * @const
 * @private
 */
acgraph.vector.PathBase.MAX_ARC_EXTENT_ = 359.999;


/**
 * Types to arguments correspondence.
 * @type {!Array.<number>}
 * @private
 */
acgraph.vector.PathBase.segmentArgCounts_ = (function() {
  var counts = [];
  counts[acgraph.vector.PathBase.Segment.MOVETO] = 2;
  counts[acgraph.vector.PathBase.Segment.LINETO] = 2;
  counts[acgraph.vector.PathBase.Segment.CURVETO] = 6;
  counts[acgraph.vector.PathBase.Segment.ARCTO] = 6;
  counts[acgraph.vector.PathBase.Segment.CLOSE] = 2;
  return counts;
})();


/**
 * Returns the number of arguments by segment type.
 *
 * @param {acgraph.vector.PathBase.Segment} segment Segment type.
 * @return {number} Number of arguments.
 */
acgraph.vector.PathBase.getSegmentCount = function(segment) {
  return acgraph.vector.PathBase.segmentArgCounts_[segment];
};


/**
 * Iterates all segments and invokes function on them. Function argument
 * are segment type and array of arguments.
 *
 * {LINETO} and {CURVETO} segments in sequence are processed at once. In this case array length
 * is calculated as (number of arguments) * (number of segments). For lines thats 2, for
 * curves - 6.
 *
 * To simplfy {ARCTO} segments also have and point as argument:
 * {rx, ry, fromAngle, extent, x, y}.
 *
 * @param {function(this: Object, number, Array)} callback Function.
 * @param {Array.<acgraph.vector.PathBase.Segment>} segments Segments.
 * @param {Array.<number>} count Array of quantities of sequential similar segments.
 * @param {Array.<number>} points Array or arguments.
 * @param {Object=} opt_obj 'this' object for callback function.
 * @param {boolean=} opt_includePrevPoint If turned on - first two parameters for all segments, except
 *    MOVETO, will be coordinates of previous point.
 * @private
 */
acgraph.vector.PathBase.forEachSegment_ = function(callback, segments, count, points, opt_obj, opt_includePrevPoint) {
  var index = 0;
  opt_obj = opt_obj || null;
  for (var i = 0, length = segments.length; i < length; i++) {
    var seg = segments[i];
    var n = acgraph.vector.PathBase.getSegmentCount(seg) * count[i];
    if (opt_includePrevPoint && seg != acgraph.vector.PathBase.Segment.MOVETO)
      callback.call(opt_obj, seg, points.slice(index - 2, index + n));
    else
      callback.call(opt_obj, seg, points.slice(index, index + n));
    index += n;
  }
};


/**
 * Calculates path bounds. Each part of path is defined by the last point
 * (two coordinates). First to params are always start point coordinates.
 * @param {...number} var_args Segments coordinates.
 * @this {{rect: goog.math.Rect, transform: goog.math.AffineTransform}} Assumed context
 *      is a special object that contains a rectangle which is to be extended and which
 *      will contains the result, as well as trasformation object, if needed.
 * @private
 */
acgraph.vector.PathBase.calcLineBounds_ = function(var_args) {
  /** @type {goog.math.Rect} */
  var rect = new goog.math.Rect(0, 0, 0, 0);
  if (this.transform) {
    /** @type {!Array.<number>} */
    var arr = /** @type {!Array.<number>} */(/** @type {Object} */(arguments));
    this.transform.transform(arr, 0, arr, 0, Math.floor(arguments.length / 2));
  }
  for (var i = 0, len = arguments.length; i < len; i += 2) {
    rect.left = arguments[i];
    rect.top = arguments[i + 1];
    this.rect.boundingRect(rect);
  }
};


/**
 * Calculates bound for arc. DOES NOT SUPPORT TRANSFORMATION. If you need
 * to calculate with transformation - simplify path.
 *
 * @param {number} startX X coordinate of start.
 * @param {number} startY Y coordinate of start.
 * @param {number} rx Horizontal radius.
 * @param {number} ry Vertical radius.
 * @param {number} angle Start angle.
 * @param {number} extent Arc extent.
 * @param {number} endX X coordinate of end.
 * @param {number} endY Y coordinate of coordinate.
 * @this {{rect: goog.math.Rect, transform: goog.math.AffineTransform}} Assumed context
 *      is a special object that contains a rectangle which is to be extended and which
 *      will contains the result, as well as trasformation object, if needed.
 * @private
 */
acgraph.vector.PathBase.calcArcBounds_ = function(startX, startY, rx, ry, angle, extent, endX, endY) {
  /** @type {goog.math.Rect} */
  var rect = new goog.math.Rect(0, 0, 0, 0);
  /**
   * X coordinates suspected to be bounds.
   * @type {Array.<number>}
   */
  var xToCheck = [startX, endX];
  /**
   * Y coordinates suspected to be bounds.
   * @type {Array.<number>}
   */
  var yToCheck = [startY, endY];
  /**
   * X coordinate of ellipse center.
   * @type {number}
   */
  var cx = startX - goog.math.angleDx(angle, rx);
  /**
   * Y coordinate of ellipse center.
   * @type {number}
   */
  var cy = startY - goog.math.angleDy(angle, ry);
  /** @type {number} */
  var step = extent > 0 ? 90 : -90;

  // Calculate first angle divisible by 90 from start angle to end angle
  var i = (extent > 0 ? Math.ceil(angle / 90) : Math.floor(angle / 90)) * 90;
  // Making steps by 90 degrees in the required direction, while we are inside an arc
  for (var end = angle + extent; (i < end) ^ (extent < 0); i += step) {
    // check quarter and add coordinate to arrays
    switch ((Math.floor(i / 90) + 4) % 4) {
      // 0 degrees
      case 0:
        xToCheck.push(cx + rx);
        break;
      // 90 degrees
      case 1:
        yToCheck.push(cy + ry);
        break;
      // 180 degrees
      case 2:
        xToCheck.push(cx - rx);
        break;
      // 270 degrees
      case 3:
        yToCheck.push(cy - ry);
        break;
    }
  }

  // Find bounding rectangle using suspected coordinates list
  rect.left = Math.min.apply(null, xToCheck);
  rect.width = Math.max.apply(null, xToCheck) - rect.left;
  rect.top = Math.min.apply(null, yToCheck);
  rect.height = Math.max.apply(null, yToCheck) - rect.top;

  // And extend the one we already have with it
  this.rect.boundingRect(rect);
};


/**
 * Calculates a bounding rectangle for a sequence of Bézier curves.
 * Each curve is defined by 3 points (6 coordinates) – 2 control points and an endpoint.
 * The strategy of finding the bounding rectangle consists in finding all points which are of extreme values for curve
 * and plotting a rectungular area, bounding the curve, through these points. The latter include the endpoints of the curve
 * and the extremum points – if they lie inside the curve. Here is the equation for a cubic Bézier curve:
 * B(t) = (1-t)^3 * p0 + 3*t*(1-t)^2 * p1 + 3*t^2*(1-t) * p2 + t^3 * p3
 * For a non-degenerate case it is hyperbola, so there are two extremum points.
 * To find them, you should know where the derivative is equal to zero. Here is the derivative for the function defining the curve:
 * B`(t) = (-3*p0+9*p1-9*p2+3*p3) * t^2 + (6*p0-12*p1+6*p2) * t + (-3*p0+3*p1)
 *
 * @param {...number} var_args The coordinates defining the curves. First pair is the initial point, then there are sets of 3 pairs,
 *      each including 2 control points and an endpoint. Each point is defined by a pair of coordinates – X and Y.
 * @this {{rect: goog.math.Rect, transform: goog.math.AffineTransform}} Assumed context
 *      is a special object that contains a rectangle which is to be extended and which
 *      will contains the result, as well as trasformation object, if needed.
 * @private
 */
acgraph.vector.PathBase.calcCurveBounds_ = function(var_args) {
  if (this.transform) {
    /** @type {!Array.<number>} */
    var arr = /** @type {!Array.<number>} */(/** @type {Object} */(arguments));
    this.transform.transform(arr, 0, arr, 0, Math.floor(arguments.length / 2));
  }

  this.rect.boundingRect(acgraph.math.calcCurveBounds.apply(null, arguments));
};


/**
 * Very rough calculation of bounding rectangle (as IE does in VML) for Bezier curves.
 * Each curve is defined by 3 points (6 coordinates) – 2 control points and an endpoint.
 *
 * Calculation is bazed on fact that any Bezier curve always contained withing trapeziod
 * built on start and end points and two control points. So, we can just add all 4 points
 * into the boundin rectangle.
 *
 * @param {...number} var_args The coordinates defining the curves. First pair is the initial point, then there are sets of 3 pairs,
 *      each including 2 control points and an endpoint. Each point is defined by a pair of coordinates – X and Y.
 * @this {{rect: goog.math.Rect, transform: goog.math.AffineTransform}} Assumed context
 *      is a special object that contains a rectangle which is to be extended and which
 *      will contains the result, as well as trasformation object, if needed.
 * @private
 */
acgraph.vector.PathBase.calcRoughCurveBounds_ = function(var_args) {
  /** @type {goog.math.Rect} */
  var rect = new goog.math.Rect(0, 0, 0, 0);
  if (this.transform) {
    /** @type {!Array.<number>} */
    var arr = /** @type {!Array.<number>} */(/** @type {Object} */(arguments));
    this.transform.transform(arr, 0, arr, 0, Math.floor(arguments.length / 2));
  }
  for (var i = 0, len = arguments.length; i < len; i += 2) {
    rect.left = arguments[i];
    rect.top = arguments[i + 1];
    this.rect.boundingRect(rect);
  }
};


//region --- Section Internal methods ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Internal methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Iterates all segments and invokes function on them. Function argument
 * are segment type and array of arguments.
 *
 * {LINETO} and {CURVETO} segments in sequence are processed at once. In this case array length
 * is calculated as (number of arguments) * (number of segments). For lines thats 2, for
 * curves - 6.
 *
 * To simplfy {ARCTO} segments also have and point as argument:
 * {rx, ry, fromAngle, extent, x, y}.
 *
 * @param {function(this: Object, number, Array)} callback Function.
 * @param {Object=} opt_obj 'this' object for callback function.
 * @param {boolean=} opt_includePrevPoint If turned on - first two parameters for all segments, except
 *    MOVETO, will be coordinates of previous point.
*/
acgraph.vector.PathBase.prototype.forEachSegment = function(callback, opt_obj, opt_includePrevPoint) {
  acgraph.vector.PathBase.forEachSegment_(callback, this.segments_, this.count_, this.arguments_, opt_obj,
      opt_includePrevPoint);
};


/**
* Iterates all segments and invokes function on them. Function argument
 * are segment type and array of arguments.
 *
 * {LINETO} and {CURVETO} segments in sequence are processed at once. In this case array length
 * is calculated as (number of arguments) * (number of segments). For lines thats 2, for
 * curves - 6.
 *
 * To simplfy {ARCTO} segments also have and point as argument:
 * {rx, ry, fromAngle, extent, x, y}.
 *
 * @param {function(this: Object, number, Array)} callback Function.
 * @param {Object=} opt_obj 'this' object for callback function.
 * @param {boolean=} opt_includePrevPoint If turned on - first two parameters for all segments, except
 *    MOVETO, will be coordinates of previous point.
 */
acgraph.vector.PathBase.prototype.forEachTransformedSegment = function(callback, opt_obj, opt_includePrevPoint) {
  var args;
  if (this.transformedPathCache_) {
    args = this.transformedPathCache_;
  } else {
    var tx = this.getFullTransformation();
    if (tx && !tx.isIdentity()) {
      args = [];
      this.simplify();
      tx.transform(this.arguments_, 0, args, 0, this.arguments_.length / 2);
    } else
      args = this.arguments_;
  }
  acgraph.vector.PathBase.forEachSegment_(callback, this.segments_, this.count_, args, opt_obj,
      opt_includePrevPoint);
};


//endregion
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states. Inherited from Shape and Path data added
 * @type {number}
 */
acgraph.vector.PathBase.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.DATA;


/**
 * Close coordinates (@code close}.
 * Last {@code moveTo} arguments is the same thing.
 *
 * @type {?Array.<number>}
 * @private
 */
acgraph.vector.PathBase.prototype.closePoint_ = null;


/**
 * Point where cursor is after all movements along the path.
 *
 * @type {?Array.<number>}
 * @private
 */
acgraph.vector.PathBase.prototype.currentPoint_ = null;


/**
 * Flag showing if path is simple (doesn't contain ARCTO).
 *
 * @type {boolean}
 * @private
 */
acgraph.vector.PathBase.prototype.simple_ = true;


/**
 * Transformed path arguments cache. Resets upon changes and transformations.
 * @type {Array.<number>}
 * @private
 */
acgraph.vector.PathBase.prototype.transformedPathCache_ = null;


/** @inheritDoc */
acgraph.vector.PathBase.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.PATH;
};


//region --- Path methods ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Path methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns true if path contains no arc.
 *
 * @return {boolean} True if the path contains no arcs.
 */
acgraph.vector.PathBase.prototype.isSimple = function() {
  return this.simple_;
};


/**
 * Returns true if path is empty.
 *
 * @return {boolean} True if path is empty.
 */
acgraph.vector.PathBase.prototype.isEmpty = function() {
  return this.segments_.length == 0;
};


/**
 * Simplifies path, turning arc into set of curves, making transfromations possible.
 * If path is  already simple - does nothing.
 * @return {!acgraph.vector.PathBase} {@link acgraph.vector.PathBase} for method chaining.
 */
acgraph.vector.PathBase.prototype.simplify = function() {
  if (this.isSimple())
    return this;

  var points = this.arguments_;
  var segments = this.segments_;
  var count = this.count_;

  this.arguments_ = [];
  this.segments_ = [];
  this.count_ = [];
  this.clearInternal_();

  acgraph.vector.PathBase.forEachSegment_(
      goog.bind(
          function(segment, args) {
            acgraph.vector.PathBase.simplifySegmentMap_[segment].apply(this, args);
          },
          this
      ), segments, count, points
  );

  // Set unsync flag
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);

  // Do not reset bounds cache - this operation doesn't change them.

  return this;
};


/**
 Resets all path operations.
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.clearInternal = function() {
  if (!this.isEmpty()) {
    // Everything is cleared, including all chaches
    this.clearInternal_();
    // A flag is set, indicating that data is not synchronized
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }

  return this;
};


/**
 Moves path cursor position to a specified coordinate.</br>
 Remember that if you call the <b>moveTo</b> method a few times in a row, only the last call will be applied.
 @param {number} x The target point’s X-coordinate.
 @param {number} y The  target point’s Y-coordinate.
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.moveToInternal = function(x, y) {
  if (goog.array.peek(this.segments_) == acgraph.vector.PathBase.Segment.MOVETO) {
    this.arguments_.length -= 2;
  } else {
    this.segments_.push(acgraph.vector.PathBase.Segment.MOVETO);
    this.count_.push(1);
  }
  this.arguments_.push(x, y);
  this.currentPoint_ = this.closePoint_ = [x, y];

  // Borders cache is not reset as there is no extension for the time being and borders do not change
  this.transformedPathCache_ = null;

  // A flag is set, indicating that data is not synchronized
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);

  return this;
};


/**
 Adds specified points to the current path, drawing sequentially a straight line through the specified coordinates.
 @param {number} x A target point’s X-coordinate.
 @param {number} y A target point’s Y-coordinate.
 @param {...number} var_args The target points’ coordinates: each odd parameter is interpreted as X and each even as Y.
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.lineToInternal = function(x, y, var_args) {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (lastSegment != acgraph.vector.PathBase.Segment.LINETO) {
    this.segments_.push(acgraph.vector.PathBase.Segment.LINETO);
    this.count_.push(0);
  }
  for (var i = 0; i < arguments.length; i += 2) {
    x = arguments[i];
    y = arguments[i + 1];
    this.arguments_.push(x, y);
  }
  this.count_[this.count_.length - 1] += i / 2;
  this.currentPoint_ = [x, y];

  // Caches are reset
  this.dropBoundsCache();
  this.transformedPathCache_ = null;

  // A flag is set, indicating that data is not synchronized
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);

  return this;
};


/**
 Adds specified points to the path, drawing sequentially a cubic B?zier curve from the current point to the next.
 Each curve is defined by 3 points (6 coordinates) – two control points and an endpoint.
 @param {number} control1X The first control point’s X-coordinate.
 @param {number} control1Y The first control point’s Y-coordinate.
 @param {number} control2X The second control point’s X-coordinate.
 @param {number} control2Y The second control point’s Y-coordinate.
 @param {number} endX The endpoint’s X-coordinate.
 @param {number} endY The endpoint’s Y-coordinate.
 @param {...number} var_args The coordinates, defining curves, in sets of 6: first control points, then an endpoint (in the same order as the primary parameters).
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.curveToInternal = function(control1X, control1Y, control2X, control2Y, endX, endY, var_args) {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (lastSegment != acgraph.vector.PathBase.Segment.CURVETO) {
    this.segments_.push(acgraph.vector.PathBase.Segment.CURVETO);
    this.count_.push(0);
  }
  for (var i = 0; i < arguments.length; i += 6) {
    var x = arguments[i + 4];
    var y = arguments[i + 5];
    this.arguments_.push(arguments[i], arguments[i + 1],
        arguments[i + 2], arguments[i + 3], x, y);
  }
  this.count_[this.count_.length - 1] += i / 6;
  this.currentPoint_ = [x, y];

  // Caches are reset
  this.dropBoundsCache();
  this.transformedPathCache_ = null;

  // A flag is set, indicating that data is not synchronized
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);

  return this;
};


/**
 Adds specified points to the path, drawing sequentially a quadratic Bezier curve from the current point to the next.
 Each curve is defined by 2 points (4 coordinates) – a control point and an endpoint.
 @param {number} controlX The control point’s X-coordinate.
 @param {number} controlY The control point’s Y-coordinate.
 @param {number} endX The endpoint’s X-coordinate.
 @param {number} endY The endpoint’s Y-coordinate.
 @param {...number} var_args coordinates, defining curves, in sets of four: first the control point, then an endpoint (in the same order as the primary parameters).
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.quadraticCurveToInternal = function(controlX, controlY, endX, endY, var_args) {
  if (this.segments_.length == 0) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }

  var prevX = this.currentPoint_[0];
  var prevY = this.currentPoint_[1];

  for (var i = 0; i < arguments.length; i += 4) {
    controlX = arguments[i];
    controlY = arguments[i + 1];
    var currentX = arguments[i + 2];
    var currentY = arguments[i + 3];
    this.curveToInternal(prevX + 2 * (controlX - prevX) / 3, prevY + 2 * (controlY - prevY) / 3,
        controlX + (currentX - controlX) / 3, controlY + (currentY - controlY) / 3,
        currentX, currentY);
    prevX = currentX;
    prevY = currentY;
  }

  return this;
};


/**
 * Arc with (cx, cy) center, start angle (from) and end angle (from + sweep),
 * along with clockwise/counterclockwise draw option.
 * @param {number} cx Center x.
 * @param {number} cy Center y.
 * @param {number} rx X radius.
 * @param {number} ry Y radius.
 * @param {number} from From angle in degrees.
 * @param {number} sweep Sweep angle in degrees.
 * @param {boolean=} opt_lineTo Line to start point. If true - lineTo will be used instead of moveto. False by default.
 * @return {acgraph.vector.PathBase} Path with predefined data (emulate circle arc).
 */
acgraph.vector.PathBase.prototype.circularArcInternal = function(cx, cy, rx, ry, from, sweep, opt_lineTo) {
  var startX = cx + goog.math.angleDx(from, rx);
  var startY = cy + goog.math.angleDy(from, ry);

  if (!this.currentPoint_ || this.currentPoint_[0] != startX || this.currentPoint_[1] != startY) {
    if (opt_lineTo)
      this.lineToInternal(startX, startY);
    else
      this.moveToInternal(startX, startY);
  }

  return this.arcToInternal(rx, ry, from, sweep);
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
 @return {acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.arcToByEndPointInternal = function(x, y, rx, ry, largeArc, clockwiseArc) {
  if (rx == 0 || ry == 0)
    return this.lineToInternal(x, y);

  // To draw an arc, the current point is needed
  if (this.segments_.length == 0) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  /** @type {number} */
  var x0 = this.currentPoint_[0];
  /** @type {number} */
  var y0 = this.currentPoint_[1];
  // If the current point and the target point coincide, two flags are not enough:
  // there is an infinite number of ellipse arcs passing through one point. So the simplest solution is chosen – not to draw.
  if (x0 == x && y0 == y)
    return this;

  rx = Math.abs(rx);
  ry = Math.abs(ry);

  var xMid = (x0 - x) / 2;
  var yMid = (y0 - y) / 2;
  var sqrXMid = xMid * xMid;
  var sqrYMid = yMid * yMid;
  var sqrRx = rx * rx;
  var sqrRy = ry * ry;

  var lambda = sqrXMid / sqrRx + sqrYMid / sqrRy;
  if (lambda > 1) {
    lambda = Math.sqrt(lambda);
    rx *= lambda;
    ry *= lambda;
    sqrRx = rx * rx;
    sqrRy = ry * ry;
  }

  var k = (sqrRx * sqrRy - sqrRx * sqrYMid - sqrRy * sqrXMid) /
          (sqrRx * sqrYMid + sqrRy * sqrXMid);
  // In some cases an infinitesimal negative still comes up for some reason,
  // and messes things up.
  if (k < 0) k = 0;
  k = Math.sqrt(k);

  if (largeArc == clockwiseArc)
    k = -k;

  var cxNormalized = k * rx * yMid / ry;
  var cyNormalized = -k * ry * xMid / rx;

  var startAngle = acgraph.math.angleBetweenVectors(1, 0, (xMid - cxNormalized) / rx, (yMid - cyNormalized) / ry);
  var extent = acgraph.math.angleBetweenVectors((xMid - cxNormalized) / rx, (yMid - cyNormalized) / ry,
      (-xMid - cxNormalized) / rx, (-yMid - cyNormalized) / ry) % 360;

  if (!clockwiseArc && extent > 0)
    extent -= 360;
  else if (clockwiseArc && extent < 0)
    extent += 360;

  return this.arcToInternal(rx, ry, startAngle, extent);
};


/**
 Adds a command to the path that draws an arc of an ellipse with radii <b>rx, ry</b>, starting from an angle
 <b>fromAngle</b>, with an angular length <b>extent</b>. The positive direction is considered the direction from
 a positive direction of the X-axis to a positive direction of the Y-axis, that is clockwise.<br/>
 @param {number} rx The X-axis radius of the ellipse.
 @param {number} ry The Y-axis radius of the ellipse.
 @param {number} fromAngle The starting angle, measured in degrees in a clockwise direction.
 @param {number} extent The angular length of the arc.
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
*/
acgraph.vector.PathBase.prototype.arcToInternal = function(rx, ry, fromAngle, extent) {
  // To draw an arc, the current point is needed
  if (this.segments_.length == 0) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  // The angular length of the arc is checked for 0 to avoid getting NaN in inc = extent / count.
  // If the angular length = 0, drawing such an arc can be skipped.
  if (extent == 0) return this;
  var cx = this.currentPoint_[0] - goog.math.angleDx(fromAngle, rx);
  var cy = this.currentPoint_[1] - goog.math.angleDy(fromAngle, ry);
  var ex, ey, toAngle;
  var count = goog.math.safeCeil(Math.abs(extent) / acgraph.vector.PathBase.MAX_ARC_EXTENT_);
  var inc = extent / count;
  for (var i = 0; i < count; i++) {
    toAngle = fromAngle + inc;
    ex = cx + goog.math.angleDx(toAngle, rx);
    ey = cy + goog.math.angleDy(toAngle, ry);

    this.arguments_.push(rx, ry, fromAngle, inc, ex, ey);
    this.segments_.push(acgraph.vector.PathBase.Segment.ARCTO);
    this.count_.push(1);
    fromAngle = toAngle;
  }
  this.simple_ = false;
  this.currentPoint_ = [ex, ey];

  // Caches are reset
  this.dropBoundsCache();
  this.transformedPathCache_ = null;

  // A flag is set, indicating that data is not synchronized
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);

  return this;
};


/**
 This method is similar to {@link acgraph.vector.PathBase#arcTo}, but in this case the arc is approximated by B?zier curves.
 <b>Attention!</b> The method is recommended when transformations are used: using the ordinary
 {@link acgraph.vector.PathBase#arcTo} and {@link acgraph.vector.PathBase#arcToByEndPoint} methods with transformations
 leads to productivity loss.<br/>
 java.awt.geom.ArcIterator algorithm adoptation
 @param {number} rx The X-axis radius of the ellipse.
 @param {number} ry The Y-axis radius of the ellipse.
 @param {number} fromAngle The starting angle, measured in degrees in a clockwise direction.
 @param {number} extent The angular length of the arc.
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.arcToAsCurvesInternal = function(rx, ry, fromAngle, extent) {
  var cx = this.currentPoint_[0] - goog.math.angleDx(fromAngle, rx);
  var cy = this.currentPoint_[1] - goog.math.angleDy(fromAngle, ry);
  var curveParams = acgraph.math.arcToBezier(cx, cy, rx, ry, fromAngle, extent);

  this.curveToInternal.apply(this, curveParams);

  // Caches are reset
  this.dropBoundsCache();
  this.transformedPathCache_ = null;

  // A flag is set, indicating that data is not synchronized
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);

  return this;
};


/**
 Adds a command that closes the path by connecting the last point with the first straight line.
 @return {!acgraph.vector.PathBase} An instance of the {@link acgraph.vector.PathBase} class for method chaining.
 */
acgraph.vector.PathBase.prototype.closeInternal = function() {
  var lastSegment = goog.array.peek(this.segments_);
  if (lastSegment == null) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.EMPTY_PATH);
  }
  if (lastSegment != acgraph.vector.PathBase.Segment.CLOSE) {
    this.arguments_.push(this.closePoint_[0], this.closePoint_[1]);
    this.segments_.push(acgraph.vector.PathBase.Segment.CLOSE);
    this.count_.push(1);
    this.currentPoint_ = this.closePoint_;
    // A flag is set, indicating that data is not synchronized
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }

  return this;
};
//endregion


//region --- Bounds ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.PathBase.prototype.getBoundsWithTransform = function(transform) {
  return this.calcBounds_(transform, acgraph.vector.PathBase.boundsCalculationMap_, true);
};


/**
 * Calculates path bounds with transformation.
 * @param {goog.math.AffineTransform} transform Transformation.
 * @param {!Array.<Function>} calcMap Hash-map of functions to calculate bounds of segment.
 * @param {boolean} allowCache Allows to cache result if transformation coincide with own or absolute.
 * @return {!goog.math.Rect} Bounds.
 * @private
 */
acgraph.vector.PathBase.prototype.calcBounds_ = function(transform, calcMap, allowCache) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform)
    return this.boundsCache.clone();
  else if (this.absoluteBoundsCache && isFullTransform)
    return this.absoluteBoundsCache.clone();
  else {
    /** @type {goog.math.Rect} */
    var rect;

    if (this.currentPoint_) {
      if (transform && !transform.isIdentity()) {
        var arr = [this.currentPoint_[0], this.currentPoint_[1]];
        transform.transform(arr, 0, arr, 0, 1);
        rect = new goog.math.Rect(arr[0], arr[1], 0, 0);
        this.simplify();
      } else
        rect = new goog.math.Rect(this.currentPoint_[0], this.currentPoint_[1], 0, 0);
      this.forEachSegment(
          function(segment, args) {
            acgraph.utils.partialApplyingArgsToFunction(calcMap[segment], args, this);
          },
          {rect: rect, transform: transform}, true
      );
    } else {
      rect = new goog.math.Rect(NaN, NaN, NaN, NaN);
    }
    if (isSelfTransform && allowCache)
      this.boundsCache = rect.clone();
    if (isFullTransform && allowCache)
      this.absoluteBoundsCache = rect.clone();
    return rect;
  }
};
//endregion


/**
 Returns the last coordinates added to the path.
 @return {goog.math.Coordinate} The current coordinates of the cursor.
 */
acgraph.vector.PathBase.prototype.getCurrentPointInternal = function() {
  if (this.currentPoint_) {
    return new goog.math.Coordinate(this.currentPoint_[0], this.currentPoint_[1]);
  }

  return null;
};


/**
 * Returns point to which the path is "closed" using close command.
 * (coordinates of start of the last open-ended shape or last moveTo() coordinates).
 *
 * @return {goog.math.Coordinate} Current cursor coordinat in {@code [x, y] format}.
 */
acgraph.vector.PathBase.prototype.getClosePoint = function() {
  if (this.closePoint_) {
    return new goog.math.Coordinate(this.closePoint_[0], this.closePoint_[1]);
  }

  return null;
};


/** @inheritDoc */
acgraph.vector.PathBase.prototype.transformationChanged = function() {
  goog.base(this, 'transformationChanged');
  this.transformedPathCache_ = null;
};


/** @inheritDoc */
acgraph.vector.PathBase.prototype.parentTransformationChanged = function() {
  goog.base(this, 'parentTransformationChanged');
  this.transformedPathCache_ = null;
};


/** @inheritDoc */
acgraph.vector.PathBase.prototype.renderTransformation = function() {
  // Resolve transformation unsync
  acgraph.getRenderer().setPathTransformation(this);
  // Set sync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.PathBase.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createPathElement();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.PathBase.prototype.renderInternal = function() {
  goog.base(this, 'renderInternal');
  // If data is unsync  - recreate path data attribute
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    this.renderPath();
  }
};


/**
 * Applies all pathe setting to DOM element.
 * @protected
 */
acgraph.vector.PathBase.prototype.renderPath = function() {
  // Apply to DOM element
  acgraph.getRenderer().setPathProperties(this);
  // Clear unsync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rest static members !DON'T MOVE UP!
//
//----------------------------------------------------------------------------------------------------------------------
// This static arrays must be initialized here, because in first section function do
// not exist yet.
/**
 * Types of segments and simplifying functions. Used in {@code simplify} method.
 * @type {!Array.<Function>}
 * @private
 */
acgraph.vector.PathBase.simplifySegmentMap_ = (function() {
  var map = [];
  map[acgraph.vector.PathBase.Segment.MOVETO] = acgraph.vector.PathBase.prototype.moveToInternal;
  map[acgraph.vector.PathBase.Segment.LINETO] = acgraph.vector.PathBase.prototype.lineToInternal;
  map[acgraph.vector.PathBase.Segment.CLOSE] = acgraph.vector.PathBase.prototype.closeInternal;
  map[acgraph.vector.PathBase.Segment.CURVETO] = acgraph.vector.PathBase.prototype.curveToInternal;
  map[acgraph.vector.PathBase.Segment.ARCTO] = acgraph.vector.PathBase.prototype.arcToAsCurvesInternal;
  return map;
})();


/**
 * Types of segment and functions to calculate bounds.
 * @type {!Array.<Function>}
 * @private
 */
acgraph.vector.PathBase.boundsCalculationMap_ = (function() {
  var map = [];
  map[acgraph.vector.PathBase.Segment.MOVETO] = goog.nullFunction;
  map[acgraph.vector.PathBase.Segment.LINETO] = acgraph.vector.PathBase.calcLineBounds_;
  map[acgraph.vector.PathBase.Segment.CLOSE] = goog.nullFunction;
  map[acgraph.vector.PathBase.Segment.CURVETO] = acgraph.vector.PathBase.calcCurveBounds_;
  map[acgraph.vector.PathBase.Segment.ARCTO] = acgraph.vector.PathBase.calcArcBounds_;
  return map;
})();


/**
 * Path lenght.
 * @return {number} .
 */
acgraph.vector.PathBase.prototype.getLength = function() {
  var length = 0;
  if (this.isEmpty()) return length;
  /** @type {!Array.<string|number>} */
  var list = [];
  this.forEachSegment(function(segment, args) {
    if (segment != acgraph.vector.PathBase.Segment.MOVETO) {
      var step;
      var params = goog.array.slice(list, list.length - 2);
      if (segment == acgraph.vector.PathBase.Segment.ARCTO) {
        step = 6;
        var cx = params[0] - goog.math.angleDx(args[2], args[0]);
        var cy = params[1] - goog.math.angleDy(args[2], args[1]);
        args = acgraph.math.arcToBezier(cx, cy, args[0], args[1], args[2], args[3]);
      } else if (segment == acgraph.vector.PathBase.Segment.LINETO) {
        step = 2;
      } else if (segment == acgraph.vector.PathBase.Segment.CURVETO) {
        step = 6;
      }

      for (var i = 0, len = args.length - (step - 1); i < len; i += step) {
        Array.prototype.push.apply(params, goog.array.slice(args, i, i + step));
        length += acgraph.math.bezierCurveLength(params);
        params = goog.array.slice(params, params.length - 2);
      }
    }
    acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
  });

  return length;
};


// /**
//  * Types of segment and functions to calculate bounds.
//  * @type {!Array.<Function>}
//  * @private
//  */
// acgraph.vector.PathBase.boundsRoughCalculationMap_ = (function() {
//   var map = [];
//   map[acgraph.vector.PathBase.Segment.MOVETO] = goog.nullFunction;
//   map[acgraph.vector.PathBase.Segment.LINETO] = acgraph.vector.PathBase.calcLineBounds_;
//   map[acgraph.vector.PathBase.Segment.CLOSE] = goog.nullFunction;
//   map[acgraph.vector.PathBase.Segment.CURVETO] = acgraph.vector.PathBase.calcRoughCurveBounds_;
//   map[acgraph.vector.PathBase.Segment.ARCTO] = acgraph.vector.PathBase.calcArcBounds_;
//   return map;
// })();


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Serialize only path arguments. For copy path data purposes.
 * @param  {Object=} opt_data .
 * @return {Object}
 */
acgraph.vector.PathBase.prototype.serializePathArgs = function(opt_data) {
  var data = opt_data || {};
  data['closePoint'] = this.closePoint_ ? this.closePoint_.slice() : [];
  data['currentPoint'] = this.currentPoint_ ? this.currentPoint_.slice() : [];
  data['segments'] = this.segments_.slice();
  data['count'] = this.count_.slice();
  data['arguments'] = this.arguments_.slice();

  return data;
};


/** @inheritDoc */
acgraph.vector.PathBase.prototype.deserialize = function(data) {
  this.closePoint_ = data['closePoint'];
  this.currentPoint_ = data['currentPoint'];
  this.segments_ = data['segments'];
  this.count_ = data['count'];
  this.arguments_ = data['arguments'];
  this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.PathBase.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['type'] = 'path';
  data = this.serializePathArgs(data);
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.PathBase.prototype.disposeInternal = function() {
  this.closePoint_ = null;
  this.currentPoint_ = null;
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  delete this.segments_;
  delete this.count_;
  delete this.arguments_;
  goog.base(this, 'disposeInternal');
};


/**
 * Clears internal data.
 *
 * @return {!acgraph.vector.PathBase} Path.
 * @private
 */
acgraph.vector.PathBase.prototype.clearInternal_ = function() {
  this.segments_.length = 0;
  this.count_.length = 0;
  this.arguments_.length = 0;
  this.dropBoundsCache();
  this.transformedPathCache_ = null;
  delete this.closePoint_;
  delete this.currentPoint_;
  delete this.simple_;
  return this;
};

