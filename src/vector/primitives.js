goog.provide('acgraph.vector.primitives');
goog.require('acgraph.vector.Path');

/**
 * acgraph.vector.primitives namespace. Contains some predefined functions to simply create common paths.
 * @namespace
 * @name acgraph.vector.primitives
 *
 */


/**
 Draws multi-pointed star.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @param {number} innerRadius Inner star radius.
 @param {number} numberOfSpikes Number of star spikes. Should be 2 or higher.
 @param {number=} opt_startDegrees Angle of the first spike in degrees.
 @param {number=} opt_curvature Curvature factor. Scopes from -1 to 1, <b>default is 0</b>. 0 Means that spikes will be drawn
    as lines, positive values make spikes thicker and negative make spikes thinner.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.star = function(stageOrPath, centerX, centerY, outerRadius, innerRadius, numberOfSpikes, opt_startDegrees, opt_curvature) {
  // Getting a path.
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);

  // We cannot do anything if spikes count should be less than 2.
  if (numberOfSpikes < 2) return path;

  // current angle in degrees
  var currentAngle = (opt_startDegrees || 0);
  // current point of a star
  var currentX = goog.math.angleDx(currentAngle, outerRadius);
  var currentY = goog.math.angleDy(currentAngle, outerRadius);
  // angle step in degrees (a half of angle distance between to spikes)
  var step = (360 / (numberOfSpikes * 2));
  var i;

  // start by moving to a first spike
  path.moveTo(currentX + centerX, currentY + centerY);

  // Debug code - define colors for another debug code
  //  var red = stageOrPath.getStage().stroke('red', .5, 3);
  //  var green = stageOrPath.getStage().stroke('green', .5, 3);
  //  var blue = stageOrPath.getStage().fill('blue', .5);
  //  var none = stageOrPath.getStage().fill('none');

  // if passed curvature is not zero - using curves to draw a star
  if (opt_curvature) {
    // for each spike in clockwise direction draw a curve from a spike to a hollow (right part of a spike) and
    // then from the hollow to a spike (left part of a spike). Curves are meant to be a quadratic bezier curve drawn as
    // a cubic bezier curve. Quadratic to cubic transformation according to
    // https://en.wikipedia.org/wiki/B%C3%A9zier_curve
    for (i = 0; i < numberOfSpikes; i++) {
      // draw a right part of a spike
      var prevAngle = currentAngle;
      currentAngle += step;
      var prevX = currentX;
      var prevY = currentY;
      var innerX = goog.math.angleDx(prevAngle, innerRadius);
      var innerY = goog.math.angleDy(prevAngle, innerRadius);
      var outerX = goog.math.angleDx(currentAngle, outerRadius);
      var outerY = goog.math.angleDy(currentAngle, outerRadius);
      currentX = goog.math.angleDx(currentAngle, innerRadius);
      currentY = goog.math.angleDy(currentAngle, innerRadius);
      // A ratio of spike line where it crosses a line of control points
      var u = (outerX - innerX) * (prevY - innerY) - (outerY - innerY) * (prevX - innerX);
      u /= (outerY - innerY) * (currentX - prevX) - (outerX - innerX) * (currentY - prevY);
      var controlX = acgraph.vector.primitives.getCurvedLineControlX_(innerRadius, outerRadius, prevAngle, currentAngle, opt_curvature, 1 - u);
      var controlY = acgraph.vector.primitives.getCurvedLineControlY_(innerRadius, outerRadius, prevAngle, currentAngle, opt_curvature, 1 - u);
      // drawing a quadratic curve from a spike to a hollow with control point (controlX, controlY) as a cubic bezier
      path.quadraticCurveTo(centerX + controlX, centerY + controlY, centerX + currentX, centerY + currentY);

      // Debug code - draws basic star lines and control point for rays
      //stage.path(stage, null, red).moveTo(centerX + prevX, centerY + prevY).lineTo(centerX + currentX, centerY + currentY);
      //stage.path(stage, null, green).moveTo(centerX + innerX, centerY + innerY).lineTo(centerX + outerX, centerY + outerY);
      //stage.circle(controlX + centerX, controlY + centerY, 3, stage, blue, none);
      //console.log(controlX);

      // The left side of a spike is drawn accordingly with some mirroring
      prevAngle = currentAngle;
      currentAngle += step;
      prevX = currentX;
      prevY = currentY;
      innerX = goog.math.angleDx(currentAngle, innerRadius);
      innerY = goog.math.angleDy(currentAngle, innerRadius);
      outerX = goog.math.angleDx(prevAngle, outerRadius);
      outerY = goog.math.angleDy(prevAngle, outerRadius);
      currentX = goog.math.angleDx(currentAngle, outerRadius);
      currentY = goog.math.angleDy(currentAngle, outerRadius);
      u = (outerX - innerX) * (prevY - innerY) - (outerY - innerY) * (prevX - innerX);
      u /= (outerY - innerY) * (currentX - prevX) - (outerX - innerX) * (currentY - prevY);
      controlX = acgraph.vector.primitives.getCurvedLineControlX_(innerRadius, outerRadius, currentAngle, prevAngle, opt_curvature, u);
      controlY = acgraph.vector.primitives.getCurvedLineControlY_(innerRadius, outerRadius, currentAngle, prevAngle, opt_curvature, u);
      // drawing a quadratic curve from a hollow to a spike with control point (controlX, controlY) as a cubic bezier
      path.quadraticCurveTo(centerX + controlX, centerY + controlY, centerX + currentX, centerY + currentY);

      // Debug code - draws basic star lines and control point for rays
      //stage.path(stage, null, red).moveTo(centerX + prevX, centerY + prevY).lineTo(centerX + currentX, centerY + currentY);
      //stage.path(stage, null, green).moveTo(centerX + innerX, centerY + innerY).lineTo(centerX + outerX, centerY + outerY);
      //stage.circle(controlX + centerX, controlY + centerY, 3, stage, blue, none);
      //console.log(controlX);

    }
  } else {
    // else (no curvature) we draw a star with lines - it's simple!
    for (i = 0; i < numberOfSpikes; i++) {
      currentAngle += step;
      currentX = goog.math.angleDx(currentAngle, innerRadius);
      currentY = goog.math.angleDy(currentAngle, innerRadius);
      path.lineTo(centerX + currentX, centerY + currentY);

      currentAngle += step;
      currentX = goog.math.angleDx(currentAngle, outerRadius);
      currentY = goog.math.angleDy(currentAngle, outerRadius);
      path.lineTo(centerX + currentX, centerY + currentY);
    }
  }

  // returning a path with a star
  path.close();
  return path;
};


/**
 Draws a 4-spiked star.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.star4 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius / 2, 4);
};


/**
 Draws a 5-spiked star.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.star5 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius / 2, 5, -90);
};


/**
 Draws a 6-spiked star.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.star6 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * 0.5773502691896258, 6, -90);
};


/**
 Draws a 7-spiked star.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.star7 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius / 2, 7, -90);
};


/**
 Draws a 10-spiked star.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.star10 = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * 0.8506508083520399, 10);
};


/**
 Draws a triangle heading upwards set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a triangle.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of triangle circumscribed circle's center.
 @param {number} centerY Y coordinate of triangle circumscribed circle's center.
 @param {number} outerRadius Triangle circumscribed circle's radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.triangleUp = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * 0.5, 3, -90);
};


/**
 Draws a triangle heading downwards set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a triangle.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of triangle circumscribed circle's center.
 @param {number} centerY Y coordinate of triangle circumscribed circle's center.
 @param {number} outerRadius Triangle circumscribed circle's radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.triangleDown = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * 0.5, 3, 90);
};


/**
 Draws a triangle heading rightwards set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a triangle.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of triangle circumscribed circle's center.
 @param {number} centerY Y coordinate of triangle circumscribed circle's center.
 @param {number} outerRadius Triangle circumscribed circle's radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.triangleRight = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * 0.5, 3, 0);
};


/**
 Draws a triangle heading leftwards set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a triangle.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of triangle circumscribed circle's center.
 @param {number} centerY Y coordinate of triangle circumscribed circle's center.
 @param {number} outerRadius Triangle circumscribed circle's radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.triangleLeft = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * 0.5, 3, 180);
};


/**
 Draws a diamond set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a diamond.
    Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of diamond circumscribed circle's center.
 @param {number} centerY Y coordinate of diamond circumscribed circle's center.
 @param {number} outerRadius Diamond circumscribed circle's radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.diamond = function(stageOrPath, centerX, centerY, outerRadius) {
  return acgraph.vector.primitives.star(stageOrPath, centerX, centerY, outerRadius, outerRadius * Math.SQRT1_2, 4);
};


/**
 Draws a cross set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
 Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.cross = function(stageOrPath, centerX, centerY, outerRadius) {
  // Getting a path.
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  var halfW = outerRadius / 4;
  var left = centerX - outerRadius;
  var right = centerX + outerRadius;
  var top = centerY - outerRadius;
  var bottom = centerY + outerRadius;

  path.moveTo(centerX - halfW, top)
      .lineTo(centerX - halfW, centerY - halfW)
      .lineTo(left, centerY - halfW)
      .lineTo(left, centerY + halfW)
      .lineTo(centerX - halfW, centerY + halfW)
      .lineTo(centerX - halfW, bottom)
      .lineTo(centerX + halfW, bottom)
      .lineTo(centerX + halfW, centerY + halfW)
      .lineTo(right, centerY + halfW)
      .lineTo(right, centerY - halfW)
      .lineTo(centerX + halfW, centerY - halfW)
      .lineTo(centerX + halfW, top)
      .close();
  return path;
};


/**
 Draws a diagonal cross set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
 Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.diagonalCross = function(stageOrPath, centerX, centerY, outerRadius) {
  // Getting a path.
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  var d = outerRadius * Math.SQRT1_2 / 2;
  var left = centerX - outerRadius;
  var right = centerX + outerRadius;
  var top = centerY - outerRadius;
  var bottom = centerY + outerRadius;

  path.moveTo(left + d, top)
      .lineTo(centerX, centerY - d)
      .lineTo(right - d, top)
      .lineTo(right, top + d)
      .lineTo(centerX + d, centerY)
      .lineTo(right, bottom - d)
      .lineTo(right - d, bottom)
      .lineTo(centerX, centerY + d)
      .lineTo(left + d, bottom)
      .lineTo(left, bottom - d)
      .lineTo(centerX - d, centerY)
      .lineTo(left, top + d)
      .close();
  return path;
};


/**
 Draws a thick horizontal line set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
 Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.hLine = function(stageOrPath, centerX, centerY, outerRadius) {
  // Getting a path.
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  var halfW = outerRadius / 4;
  var left = centerX - outerRadius;
  var right = centerX + outerRadius;

  path.moveTo(right, centerY - halfW)
      .lineTo(right, centerY + halfW)
      .lineTo(left, centerY + halfW)
      .lineTo(left, centerY - halfW)
      .close();
  return path;
};


/**
 Draws a thick vertical line set by it's circumscribed circle's center and radius.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a star.
   Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} centerX X coordinate of star center.
 @param {number} centerY Y coordinate of star center.
 @param {number} outerRadius Outer star radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.vLine = function(stageOrPath, centerX, centerY, outerRadius) {
  // Getting a path.
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  var halfW = outerRadius / 4;
  var top = centerY - outerRadius;
  var bottom = centerY + outerRadius;

  path.moveTo(centerX - halfW, top)
      .lineTo(centerX + halfW, top)
      .lineTo(centerX + halfW, bottom)
      .lineTo(centerX - halfW, bottom)
      .close();
  return path;
};


/**
 Draws a pie sector with sides (a curvilinear isosceles triangle with center in <i>(cx, cy)</i>).
 If sweep modulus is larger or equal 360, draws an ellipse (without sector sides).
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a pie.
   Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} cx Center x.
 @param {number} cy Center y.
 @param {number} r Radius.
 @param {number} start Start angle in degrees.
 @param {number} sweep Sweep angle in degrees.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.pie = function(stageOrPath, cx, cy, r, start, sweep) {
  // Getting a path.
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  sweep = goog.math.clamp(sweep, -360, 360);

  if (Math.abs(sweep) == 360) {
    path.circularArc(cx, cy, r, r, start, sweep, false);
  } else {
    path.moveTo(cx, cy).circularArc(cx, cy, r, r, start, sweep, true).close();
  }
  return path;
};


/**
 Draws a donut sector with sides. If sweep modulus is larger or equal 360, draws two concentric circles (without sides).
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath Stage to create a path or a Path to append a donut.
   Path is not cleared before star drawing, so you need to clear it manually.
 @param {number} cx Center x.
 @param {number} cy Center y.
 @param {number} outerR Outer radius.
 @param {number} innerR Inner radius.
 @param {number} start Start angle in degrees.
 @param {number} sweep Sweep angle in degrees.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.donut = function(stageOrPath, cx, cy, outerR, innerR, start, sweep) {
  if (outerR < 0) outerR = 0;
  if (innerR < 0) innerR = 0;
  if (outerR < innerR) {
    var tmp = outerR;
    outerR = innerR;
    innerR = tmp;
  }
  if (innerR <= 0) return acgraph.vector.primitives.pie(stageOrPath, cx, cy, outerR, start, sweep);

  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  sweep = goog.math.clamp(sweep, -360, 360);
  var drawSides = Math.abs(sweep) < 360;

  path.circularArc(cx, cy, outerR, outerR, start, sweep)
      .circularArc(cx, cy, innerR, innerR, start + sweep, -sweep, drawSides);
  if (drawSides)
    path.close();
  return path;
};


/**
 * An inner routine used in curved star spike line params calculation.
 * @param {number} innerRadius Inner star radius.
 * @param {number} outerRadius Outer star radius.
 * @param {number} innerAngle An angle where the inner part of a star is placed.
 * @param {number} outerAngle An angle where the outer part of a star is placed.
 * @param {number} curvature A factor of spike curvature.
 * @param {number} u A ratio where the line of GPP of control points crosses a spike line.
 * @return {number} X coordinate of quadratic bezier control point.
 * @private
 */
acgraph.vector.primitives.getCurvedLineControlX_ = function(innerRadius, outerRadius, innerAngle, outerAngle, curvature, u) {
  var innerX = goog.math.angleDx(innerAngle, innerRadius);
  var outerX = goog.math.angleDx(outerAngle, outerRadius);
  var len = outerX - innerX;
  if (curvature >= 0)
    return innerX + len * (u + curvature - u * curvature);
  else
    return innerX + len * u * (curvature + 1);
};


/**
 * An inner routine used in curved star spike line params calculation.
 * @param {number} innerRadius Inner star radius.
 * @param {number} outerRadius Outer star radius.
 * @param {number} innerAngle An angle where the inner part of a star is placed.
 * @param {number} outerAngle An angle where the outer part of a star is placed.
 * @param {number} curvature A factor of spike curvature.
 * @param {number} u A ratio where the line of GPP of control points crosses a spike line.
 * @return {number} Y coordinate of quadratic bezier control point.
 * @private
 */
acgraph.vector.primitives.getCurvedLineControlY_ = function(innerRadius, outerRadius, innerAngle, outerAngle, curvature, u) {
  var innerY = goog.math.angleDy(innerAngle, innerRadius);
  var outerY = goog.math.angleDy(outerAngle, outerRadius);
  var len = outerY - innerY;
  if (curvature >= 0)
    return innerY + len * (u + curvature - u * curvature);
  else
    return innerY + len * u * (curvature + 1);
};


/**
 * Changes incoming array of corner radius to [topLeft, topRight, bottomRight, bottomLeft] view.
 * @param {Array.<number>} radiusOfCorners Array of corner radius.
 * @private
 */
acgraph.vector.primitives.normalizeCornerRadiiSet_ = function(radiusOfCorners) {
  var topRight, bottomRight, bottomLeft;

  switch (radiusOfCorners.length) {
    case 1:
      topRight = bottomRight = bottomLeft = radiusOfCorners[0];
      radiusOfCorners.push(topRight, bottomRight, bottomLeft);
      break;
    case 2:
      bottomRight = radiusOfCorners[0];
      bottomLeft = radiusOfCorners[1];
      radiusOfCorners.push(bottomRight, bottomLeft);
      break;
    case 3:
      bottomLeft = radiusOfCorners[1];
      radiusOfCorners.push(bottomLeft);
      break;
    case 4:
      break;
    case 0:
    default:
      radiusOfCorners.push(5, 5, 5, 5);
      break;
  }
};


/**
 Draws a rect with truncated corners.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath to create a path or a Path to append a rect.
 Path is not cleared before rect drawing, so you need to clear it manually.
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle.
 <table>
   <tr>
       <th>Args</th><th>Description</th>
   </tr>
   <tr>
    <td><b><ol>
        <li>top-left</li>
        <li>top-right</li>
        <li>bottom-right</li>
        <li>bottom-left</li>
    </ol></b></td>
    <td>Parameters are set in order, starting with top-left corner and clockwise.</td>
   </tr>
   <tr>
    <td><b><ol>
        <li>top-left</li>
        <li>top-right & bottom-left</li>
        <li>bottom-right</li>
    </ol></b></td>
    <td>First parameter is top-left corner, second - top-right and bottom-left, third - bottom-right.</td>
   </tr>
   <tr>
       <td><b><ol>
           <li>left-top & bottom-right</li>
           <li>left-right & bottom-left</li>
       </ol></b></td>
       <td>First parameter is for left-top and bottom-right, second - for
 left-right abd bottom-left</td>
   </tr>
   <tr>
       <td><b><ol><li>all corners</li></ol></b></td>
       <td>its value will be applied to each of four corners pf rectangle.</td>
   </tr>
 </table>
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.truncatedRect = function(stageOrPath, rect, var_args) {
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  var topLeft, topRight, bottomRight, bottomLeft;
  if (arguments.length == 6) {
    topLeft = arguments[2];
    topRight = arguments[3];
    bottomRight = arguments[4];
    bottomLeft = arguments[5];

    path
        .moveTo(rect.left + topLeft, rect.top)
        .lineTo(rect.left + rect.width - topRight, rect.top)
        .lineTo(rect.left + rect.width, rect.top + topRight)
        .lineTo(rect.left + rect.width, rect.top + rect.height - bottomRight)
        .lineTo(rect.left + rect.width - bottomRight, rect.top + rect.height)
        .lineTo(rect.left + bottomLeft, rect.top + rect.height)
        .lineTo(rect.left, rect.top + rect.height - bottomLeft)
        .lineTo(rect.left, rect.top + topLeft)
        .close();
  } else {
    var radiusOfCorners_ = goog.array.slice(arguments, 2, 6);

    acgraph.vector.primitives.normalizeCornerRadiiSet_(radiusOfCorners_);

    topLeft = radiusOfCorners_[0];
    topRight = radiusOfCorners_[1];
    bottomRight = radiusOfCorners_[2];
    bottomLeft = radiusOfCorners_[3];

    acgraph.vector.primitives.truncatedRect(path, rect, topLeft, topRight, bottomRight, bottomLeft);
  }
  return path;
};


/**
 Draws a rect with rounded inner corners.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath to create a path or a Path to append a rect.
 Path is not cleared before rect drawing, so you need to clear it manually.
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle:
 <table>
  <tr>
   <th>Args</th><th>Description</th>
  </tr>
  <tr>
   <td><b><ol>
    <li>top-left</li>
    <li>top-right</li>
    <li>bottom-right</li>
    <li>bottom-left</li>
    </ol></b></td>
   <td>Parameters are set in order, starting from top-left corner clockwise.</td>
  </tr>
  <tr>
   <td><b><ol>
    <li>top-left</li>
    <li>top-right & bottom-left</li>
    <li>bottom-right</li>
    </ol></b></td>
   <td>First parameter is top-left corner, second - top-right and bottom-left, third - bottom-right.</td>
  </tr>
  <tr>
   <td><b><ol>
    <li>left-top & bottom-right</li>
    <li>left-right & bottom-left</li>
    </ol></b></td>
   <td>First parameter is for left-top and bottom-right, second - left-right and bottom-left</td>
  </tr>
  <tr>
   <td><b><ol><li>all corners</li></ol></b></td>
   <td>its value will be applied to each of four rectangle corners.</td>
  </tr>
 </table>
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.roundedRect = function(stageOrPath, rect, var_args) {
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);
  var topLeft, topRight, bottomRight, bottomLeft;
  if (arguments.length == 6) {
    topLeft = arguments[2];
    topRight = arguments[3];
    bottomRight = arguments[4];
    bottomLeft = arguments[5];

    path
        .moveTo(rect.left + topLeft, rect.top)
        .lineTo(rect.left + rect.width - topRight, rect.top)
        .arcToByEndPoint(rect.left + rect.width, rect.top + topRight, topRight, topRight, false, true)
        .lineTo(rect.left + rect.width, rect.top + rect.height - bottomRight)
        .arcToByEndPoint(rect.left + rect.width - bottomRight, rect.top + rect.height, bottomRight, bottomRight, false, true)
        .lineTo(rect.left + bottomLeft, rect.top + rect.height)
        .arcToByEndPoint(rect.left, rect.top + rect.height - bottomLeft, bottomLeft, bottomLeft, false, true);
    if (topLeft != 0) {
      path.lineTo(rect.left, rect.top + topLeft);
      path.arcToByEndPoint(rect.left + topLeft, rect.top, topLeft, topLeft, false, true);
    }
    path.close();
  } else {
    var radiusOfCorners_ = goog.array.slice(arguments, 2, 6);

    acgraph.vector.primitives.normalizeCornerRadiiSet_(radiusOfCorners_);

    topLeft = radiusOfCorners_[0];
    topRight = radiusOfCorners_[1];
    bottomRight = radiusOfCorners_[2];
    bottomLeft = radiusOfCorners_[3];

    acgraph.vector.primitives.roundedRect(path, rect, topLeft, topRight, bottomRight, bottomLeft);
  }
  return path;
};


/**
 Draws a rect with rounded corners.
 @param {!(acgraph.vector.Stage|acgraph.vector.Path)} stageOrPath to create a path or a Path to append a rect.
 Path is not cleared before rect drawing, so you need to clear it manually.
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle:
 <table>
  <tr>
    <th>Args</th><th>Description</th>
  </tr>
  <tr>
   <td><b><ol>
    <li>top-left</li>
    <li>top-right</li>
    <li>bottom-right</li>
    <li>bottom-left</li>
    </ol></b></td>
   <td>Parameters are set in order, starting from top-left corner clockwise.</td>
  </tr>
  <tr>
   <td><b><ol>
    <li>top-left</li>
    <li>top-right & bottom-left</li>
    <li>bottom-right</li>
    </ol></b></td>
   <td>First parameter is top-left corner, second - top-right and bottom-left, third - bottom-right.</td>
  </tr>
  <tr>
   <td><b><ol>
    <li>left-top & bottom-right</li>
    <li>left-right & bottom-left</li>
    </ol></b></td>
   <td>First parameter is for left-top and bottom-right, second - left-right and bottom-left</td>
  </tr>
  <tr>
   <td><b><ol><li>all corners</li></ol></b></td>
   <td>its value will be applied to each of four rectangle corners.</td>
  </tr>
 </table>
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 */
acgraph.vector.primitives.roundedInnerRect = function(stageOrPath, rect, var_args) {
  /** @type {!acgraph.vector.Path} */
  var path = stageOrPath.path ? stageOrPath.path() : /** @type {!acgraph.vector.Path} */(stageOrPath);

  var topLeft, topRight, bottomRight, bottomLeft;
  if (arguments.length == 6) {
    topLeft = arguments[2];
    topRight = arguments[3];
    bottomRight = arguments[4];
    bottomLeft = arguments[5];

    path
        .moveTo(rect.left + topLeft, rect.top)
        .lineTo(rect.left + rect.width - topRight, rect.top)
        .arcToByEndPoint(rect.left + rect.width, rect.top + topRight, topRight, topRight, false, false)
        .lineTo(rect.left + rect.width, rect.top + rect.height - bottomRight)
        .arcToByEndPoint(rect.left + rect.width - bottomRight, rect.top + rect.height, bottomRight, bottomRight, false, false)
        .lineTo(rect.left + bottomLeft, rect.top + rect.height)
        .arcToByEndPoint(rect.left, rect.top + rect.height - bottomLeft, bottomLeft, bottomLeft, false, false);

    if (topLeft != 0) {
      path
          .lineTo(rect.left, rect.top + topLeft)
          .arcToByEndPoint(rect.left + topLeft, rect.top, topLeft, topLeft, false, false);
    }
    path.close();
  } else {
    var radiusOfCorners_ = goog.array.slice(arguments, 2, 6);

    acgraph.vector.primitives.normalizeCornerRadiiSet_(radiusOfCorners_);

    topLeft = radiusOfCorners_[0];
    topRight = radiusOfCorners_[1];
    bottomRight = radiusOfCorners_[2];
    bottomLeft = radiusOfCorners_[3];

    acgraph.vector.primitives.roundedInnerRect(path, rect, topLeft, topRight, bottomRight, bottomLeft);
  }
  return path;
};


//exports
goog.exportSymbol('acgraph.vector.primitives.star', acgraph.vector.primitives.star);
goog.exportSymbol('acgraph.vector.primitives.star4', acgraph.vector.primitives.star4);
goog.exportSymbol('acgraph.vector.primitives.star5', acgraph.vector.primitives.star5);
goog.exportSymbol('acgraph.vector.primitives.star6', acgraph.vector.primitives.star6);
goog.exportSymbol('acgraph.vector.primitives.star7', acgraph.vector.primitives.star7);
goog.exportSymbol('acgraph.vector.primitives.star10', acgraph.vector.primitives.star10);
goog.exportSymbol('acgraph.vector.primitives.diamond', acgraph.vector.primitives.diamond);
goog.exportSymbol('acgraph.vector.primitives.triangleUp', acgraph.vector.primitives.triangleUp);
goog.exportSymbol('acgraph.vector.primitives.triangleDown', acgraph.vector.primitives.triangleDown);
goog.exportSymbol('acgraph.vector.primitives.triangleRight', acgraph.vector.primitives.triangleRight);
goog.exportSymbol('acgraph.vector.primitives.triangleLeft', acgraph.vector.primitives.triangleLeft);
goog.exportSymbol('acgraph.vector.primitives.cross', acgraph.vector.primitives.cross);
goog.exportSymbol('acgraph.vector.primitives.diagonalCross', acgraph.vector.primitives.diagonalCross);
goog.exportSymbol('acgraph.vector.primitives.hLine', acgraph.vector.primitives.hLine);
goog.exportSymbol('acgraph.vector.primitives.vLine', acgraph.vector.primitives.vLine);
goog.exportSymbol('acgraph.vector.primitives.pie', acgraph.vector.primitives.pie);
goog.exportSymbol('acgraph.vector.primitives.donut', acgraph.vector.primitives.donut);
goog.exportSymbol('acgraph.vector.primitives.truncatedRect', acgraph.vector.primitives.truncatedRect);
goog.exportSymbol('acgraph.vector.primitives.roundedRect', acgraph.vector.primitives.roundedRect);
goog.exportSymbol('acgraph.vector.primitives.roundedInnerRect', acgraph.vector.primitives.roundedInnerRect);
