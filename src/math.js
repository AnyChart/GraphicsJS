goog.provide('acgraph.math');

goog.require('goog.math');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');


/**
 A namespace of classes of geometric shapes.
 @namespace
 @name acgraph.math
 */


//region --- Bézier Calculations ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Bézier Calculations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Converts an arc of an ellipse with given parameters into a set of Bézier curves and returns the array of the parameters of these curves.
 * The initial point is not returned in this array, so if you, for example, use “moveTo” to go to the initial point,
 * it will be possible to draw the whole arc just by passing all parameters to “curveTo”.
 * @param {number} cx The X-coordinate of the center of the ellipse.
 * @param {number} cy The Y-coordinate of the center of the ellipse.
 * @param {number} rx The X-radius of the ellipse.
 * @param {number} ry The Y-radius of the ellipse.
 * @param {number} fromAngle The starting angle of the arc (in degrees).
 * @param {number} extent The angular length of the arc (in degrees).
 * @param {boolean=} opt_addFirstPointToResult Defines whether the intial point is added to the result. It is “false”
 *    by default, and if it is set to “true”, the first pair of coordinates in the result will refer to the first point, and the curves, each defined by 3 pairs of coordinates,
 *    will start from the second index of the array.
 * @return {!Array.<number>} The array of the parameters of the curves related to the arc. One curve is defined by 3 pairs of
 *    coordinates (i.e. by 6 elements of the array). The first 2 pairs are the control points of the curve, and the third pair is the endpoint.
 */
acgraph.math.arcToBezier = function(cx, cy, rx, ry, fromAngle, extent, opt_addFirstPointToResult) {
  var extentRad = goog.math.toRadians(extent);
  var arcSegs = Math.ceil(Math.abs(extentRad) / Math.PI * 2);
  var inc = extentRad / arcSegs;
  var angle = goog.math.toRadians(fromAngle);
  var res = opt_addFirstPointToResult ?
      [cx + goog.math.angleDx(fromAngle, rx), cy + goog.math.angleDy(fromAngle, ry)] :
      [];
  for (var j = 0; j < arcSegs; j++) {
    var relX = Math.cos(angle);
    var relY = Math.sin(angle);
    var z = 4 / 3 * Math.sin(inc / 2) / (1 + Math.cos(inc / 2));
    var c0 = cx + (relX - z * relY) * rx;
    var c1 = cy + (relY + z * relX) * ry;
    angle += inc;
    relX = Math.cos(angle);
    relY = Math.sin(angle);
    res.push(
        c0, c1,
        cx + (relX + z * relY) * rx,
        cy + (relY - z * relX) * ry,
        cx + relX * rx,
        cy + relY * ry
    );
  }
  return res;
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
 * @return {!goog.math.Rect} The bounding rectangle for a set of Bézier curves.
 */
acgraph.math.calcCurveBounds = function(var_args) {
  /**
   * The array of suspected points, of which will later the response will be formed. It consists of 2 arrays,
   * first of the X-coordinates of the suspected points, and second of the Y-coordinates. From the very beginning the initial point
   * of the sequence of curves is added.
   * @type {Array.<Array.<number>>}
   */
  var bounds = [
    [arguments[0]],
    [arguments[1]]
  ];

  /**
   * Finds the value of a coordinate of a cubic Bézier curve with arguments p0, p1, p2, p3, the value of the parameter being t.
   * @param {number} p0 The initial value of the coordinate.
   * @param {number} p1 The first control point for the coordinate.
   * @param {number} p2 The second control point for the coordinate.
   * @param {number} p3 The resulting value of the coordinate.
   * @param {number} t The value of the parameter of the curve for which it is necessary to get a coordinate.
   * @return {number} The value of the coordinate in the given point.
   */
  var f = function(p0, p1, p2, p3, t) {
    var t2 = 1 - t;
    return t2 * t2 * t2 * p0 +
        3 * t2 * t2 * t * p1 +
        3 * t2 * t * t * p2 +
        t * t * t * p3;
  };

  // For all sets of arguments
  for (var i = 2, len = arguments.length; i < len; i += 6) {
    /**
     * The first point of a curve, represented by 2 coordinates.
     * @type {Array.<number>}
     */
    var p0 = [arguments[i - 2], arguments[i - 1]];
    /**
     * The first control point of a curve, represented by 2 coordinates.
     * @type {Array.<number>}
     */
    var p1 = [arguments[i], arguments[i + 1]];
    /**
     * The second control point of a curve, represented by 2 coordinates.
     * @type {Array.<number>}
     */
    var p2 = [arguments[i + 2], arguments[i + 3]];
    /**
     * The last point of a curve, represented by 2 coordinates.
     * @type {Array.<number>}
     */
    var p3 = [arguments[i + 4], arguments[i + 5]];

    // The coordinates of the last point are recorded as suspected.
    bounds[0].push(p3[0]);
    bounds[1].push(p3[1]);

    /** @type {number} */
    var t;

    // For each coordinate (X and Y) the same operations are performed
    for (var j = 0; j < 2; j++) {
      // The parameters of the derivative for the function defining the curve are calculated.
      /**
       * The coefficient of the derivative for t^2.
       * @type {number}
       */
      var a = -3 * p0[j] + 9 * p1[j] - 9 * p2[j] + 3 * p3[j];
      /**
       * The coefficient of the derivative for t.
       * @type {number}
       */
      var b = 6 * p0[j] - 12 * p1[j] + 6 * p2[j];
      /**
       * The free coefficient of the derivative.
       * @type {number}
       */
      var c = 3 * p1[j] - 3 * p0[j];

      // If the equation of the derivative is not a parabola
      if (a == 0) {
        // If the equation of the derivative is a straight line
        if (b != 0) {
          // The zero coordinate for this straight line is found
          t = -c / b;
          // If zero lies inside the interval (0,1)
          if (0 < t && t < 1)
            // the value of the curve in this point is recorded as suspected
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
        }
      } else {
        // If the equation of the derivative is a parabola, the roots of the equation a*t^2 + b*t + c = 0 are found
        // First the discriminant is found
        /**
         * The discriminant of the derivative equation
         * @type {number}
         */
        var D = b * b - 4 * c * a;
        // If the discriminant is greater than zero, there are 2 roots
        if (D > 0) {
          // the first root is found
          t = (-b + Math.sqrt(D)) / (2 * a);
          // If it lies inside the interval (0,1)
          if (0 < t && t < 1)
            // the value of the curve in this point is recorded as suspected
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));

          // The second root is found
          t = (-b - Math.sqrt(D)) / (2 * a);
          // If it lies inside the required interval
          if (0 < t && t < 1)
            // the value of the curve in this point is recorded as suspected
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
        } else if (D == 0) { // If the discriminant is zero, there is one root
          // It is found
          t = (-b) / (2 * a);
          // If it lies inside the interval (0,1)
          if (0 < t && t < 1)
            // The value of the curve in this point is recorded as suspected
            bounds[j].push(f(p0[j], p1[j], p2[j], p3[j], t));
        }
      }
    }
  }

  // Then, according to the resulting list of the suspected coordinates, the bounding rectangle is found.
  /** @type {goog.math.Rect} */
  var rect = new goog.math.Rect(Math.min.apply(null, bounds[0]), Math.min.apply(null, bounds[1]), 0, 0);
  rect.width = Math.max.apply(null, bounds[0]) - rect.left;
  rect.height = Math.max.apply(null, bounds[1]) - rect.top;

  return rect;
};


/**
 * Returns approximate curve length.
 * @param {Array.<number>} params .
 * @param {number=} opt_approxSteps .
 * @return {number}
 */
acgraph.math.bezierCurveLength = function(params, opt_approxSteps) {
  var steps = opt_approxSteps || 100;
  var len = params.length;
  var order = len / 2 - 1;
  var points = [], ret;

  for (var idx = 0, step = 2; idx < len; idx += step) {
    var point = {
      x: params[idx],
      y: params[idx + 1]
    };
    points.push(point);
  }

  var lut = [];
  for (var t = 0; t <= steps; t++) {
    var t_ = t / steps;
    var ZERO = {x: 0, y: 0};

    // shortcuts
    if (t_ === 0) {
      lut.push(points[0]);
      continue;
    }
    if (t_ === 1) {
      lut.push(points[order]);
      continue;
    }

    var p = points;
    var mt = 1 - t_;

    // linear?
    if (order === 1) {
      ret = {
        x: mt * p[0].x + t_ * p[1].x,
        y: mt * p[0].y + t_ * p[1].y
      };
      lut.push(ret);
      continue;
    }

    // quadratic/cubic curve?
    if (order < 4) {
      var mt2 = mt * mt,
          t2 = t_ * t_,
          a, b, c, d = 0;
      if (order === 2) {
        p = [p[0], p[1], p[2], ZERO];
        a = mt2;
        b = mt * t_ * 2;
        c = t2;
      }
      else if (order === 3) {
        a = mt2 * mt;
        b = mt2 * t_ * 3;
        c = mt * t2 * 3;
        d = t_ * t2;
      }
      ret = {
        x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
        y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y
      };
      lut.push(ret);
      continue;
    }

    // higher order curves: use de Casteljau's computation
    var dCpts = JSON.parse(JSON.stringify(points));
    while (dCpts.length > 1) {
      for (var i = 0; i < dCpts.length - 1; i++) {
        dCpts[i] = {
          x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t_,
          y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t_
        };
      }
      dCpts.splice(dCpts.length - 1, 1);
    }

    lut.push(dCpts[0]);
  }

  var pts = lut;
  var p0 = points[0];
  var alen = 0;
  for (var i = 0, p1, dx, dy; i < pts.length - 1; i++) {
    p0 = pts[i];
    p1 = pts[i + 1];
    dx = p1.x - p0.x;
    dy = p1.y - p0.y;
    alen += Math.sqrt(dx * dx + dy * dy);
  }
  alen = ((100 * alen) | 0) / 100;
  return alen;
};


/**
 * Multiplication of N matrices.
 * @param {...goog.math.AffineTransform} var_args The matrices to be multiplied.
 * @return {goog.math.AffineTransform} The resulting transformation matrix.
 */
acgraph.math.concatMatrixes = function(var_args) {
  if (arguments.length == 0) return null;
  /** @type {goog.math.AffineTransform} */
  var resultMatrix = null;
  var cloneResultMatrix = false;
  for (var i = 0, len = arguments.length; i < len; i++) {
    if (arguments[i])
      if (resultMatrix) {
        if (!cloneResultMatrix) cloneResultMatrix = !!(resultMatrix = resultMatrix.clone());
        resultMatrix.concatenate(arguments[i]);
      } else {
        resultMatrix = arguments[i];
      }
  }
  return resultMatrix;
};


/**
 * Transforms a given rectangle and returns a bounding rectangle for it in the initial coordinate system.
 * If transformation is not assigned or not essential, the given rectangle is returned, otherwise a new instance is created.
 * @param {!goog.math.Rect} rect The rectangle to be transformed.
 * @param {goog.math.AffineTransform} tx The transformation to be applied.
 * @return {!goog.math.Rect} The bounding rectangle for the transformed one.
 */
acgraph.math.getBoundsOfRectWithTransform = function(rect, tx) {
  if (!tx || tx.isIdentity()) return rect;
  var left = rect.left;
  var top = rect.top;
  var right = left + rect.width;
  var bottom = top + rect.height;
  var points = [
    left, top,
    left, bottom,
    right, top,
    right, bottom
  ];
  tx.transform(points, 0, points, 0, 4);
  left = Math.min(points[0], points[2], points[4], points[6]);
  top = Math.min(points[1], points[3], points[5], points[7]);
  right = Math.max(points[0], points[2], points[4], points[6]);
  bottom = Math.max(points[1], points[3], points[5], points[7]);
  return new goog.math.Rect(left, top, right - left, bottom - top);
};


/**
 * Rounds a given number to a certain number of decimal places.
 * @param {number} num The number to be rounded.
 * @param {number=} opt_digitsCount Optional The number of places after the decimal point.
 * @return {number} The rounded number.
 */
acgraph.math.round = function(num, opt_digitsCount) {
  var tmp = Math.pow(10, opt_digitsCount || 0);
  return Math.round(num * tmp) / tmp;
};


/**
 * Calculates the angle between two vectors, U([ux, uy]) and V([vx, vy]), defined by their coordinates.
 * @param {number} ux The X-coordinate of the vector U.
 * @param {number} uy The Y-coordinate of the vector U.
 * @param {number} vx The X coordinate of the vector V.
 * @param {number} vy The Y coordinate of the vector V.
 * @return {number} The angle between vectors U and V, in degrees.
 */
acgraph.math.angleBetweenVectors = function(ux, uy, vx, vy) {
  var sign = ux * vy - uy * vx; // sign determining
  var cos = (ux * vx + uy * vy) / // vector multiplication
      (Math.sqrt(ux * ux + uy * uy) * Math.sqrt(vx * vx + vy * vy)); // multiplication of vector lengths
  cos = goog.math.clamp(cos, -1, 1);
  var result = goog.math.toDegrees(Math.acos(cos));
  return sign > 0 ? result : -result;
};


/**
 * Extracts the rotation angle in degrees from a transformation matrix.
 * @param {goog.math.AffineTransform} transform The target transformation. May be null.
 * @return {number} The rotation angle in degrees.
 */
acgraph.math.getRotationAngle = function(transform) {
  if (transform)
    return goog.math.toDegrees(Math.atan2(transform.getShearY(), transform.getScaleY()));
  else
    return 0;
};


/**
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @param {number} sourceWidth
 * @param {number} sourceHeight
 * @return {Array.<number>}
 */
acgraph.math.fitWithProportion = function(targetWidth, targetHeight, sourceWidth, sourceHeight) {
  if (targetWidth < targetHeight) {
    return [targetWidth, targetWidth / sourceWidth * sourceHeight];
  } else if (targetWidth > targetHeight) {
    return [targetHeight / sourceHeight * sourceWidth, targetHeight];
  } else {
    return [targetWidth, targetHeight];
  }
};
//endregion


//region --- Coordinate
//------------------------------------------------------------------------------
//
//  Coordinate
//
//------------------------------------------------------------------------------
/**
 Getter for the X-coordinate.
 @this {goog.math.Coordinate}
 @return {number} X-coordinate.
 */
goog.math.Coordinate.prototype.getX = function() {
  return this.x;
};


/**
 Getter for the Y-coordinate.
 @this {goog.math.Coordinate}
 @return {number} The Y-coordinate.
 */
goog.math.Coordinate.prototype.getY = function() {
  return this.y;
};


//endregion
//region --- Rect
//------------------------------------------------------------------------------
//
//  Rect
//
//------------------------------------------------------------------------------
/**
 Getter for the X-coordinate of a rectangle.
 @this {goog.math.Rect}
 @return {number} The X-coordinate of the left side of a rectangle.
 */
goog.math.Rect.prototype.getLeft = function() {
  return this.left;
};


/**
 Getter for the top of a rectangle.
 @this {goog.math.Rect}
 @return {number} The Y-coordinate of the top of a rectangle.
 */
goog.math.Rect.prototype.getTop = function() {
  return this.top;
};


/**
 Getter for the width of a rectangle.
 @this {goog.math.Rect}
 @return {number} The width of a rectangle.
 */
goog.math.Rect.prototype.getWidth = function() {
  return this.width;
};


/**
 Getter for the height of a rectangle.
 @this {goog.math.Rect}
 @return {number} The height of a rectangle.
 */
goog.math.Rect.prototype.getHeight = function() {
  return this.height;
};


/**
 Getter for the right side of a rectangle.
 @this {goog.math.Rect}
 @return {number} The X-coordinate of the right side of a rectangle.
 */
goog.math.Rect.prototype.getRight = function() {
  return this.left + this.width;
};


/**
 Getter for the bottom of a rectangle.
 @this {goog.math.Rect}
 @return {number} The Y-coordinate of the bottom of a rectangle.
 */
goog.math.Rect.prototype.getBottom = function() {
  return this.top + this.height;
};


//endregion
//region --- Size
//------------------------------------------------------------------------------
//
//  Size
//
//------------------------------------------------------------------------------
/**
 Getter for the width.
 @this {goog.math.Size}
 @return {number} Width.
 */
goog.math.Size.prototype.getWidth = function() {
  return this.width;
};


/**
 Getter for the height.
 @this {goog.math.Size}
 @return {number} Height.
 */
goog.math.Size.prototype.getHeight = function() {
  return this.height;
};


//endregion
//exports
(function() {
  goog.exportSymbol('acgraph.math.Coordinate', goog.math.Coordinate);
  goog.exportSymbol('acgraph.math.Rect', goog.math.Rect);
  goog.exportSymbol('acgraph.math.Size', goog.math.Size);
  var proto = goog.math.Coordinate.prototype;
  proto['getX'] = proto.getX;
  proto['getY'] = proto.getY;
  proto = goog.math.Rect.prototype;
  proto['getWidth'] = proto.getWidth;
  proto['getHeight'] = proto.getHeight;
  proto['getLeft'] = proto.getLeft;
  proto['getTop'] = proto.getTop;
  proto['getWidth'] = proto.getWidth;
  proto['getHeight'] = proto.getHeight;
  proto['getRight'] = proto.getRight;
  proto['getBottom'] = proto.getBottom;
})();
