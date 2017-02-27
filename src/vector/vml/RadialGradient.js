goog.provide('acgraph.vector.vml.RadialGradient');
goog.require('acgraph.vector.RadialGradient');



/**
 * A class for implementing radial gradient in VML. Due to the weakness of this technology, different algorithms
 *  are used for this purpose than in SVG. In this implementation of radial gradient it is impossible
 * to set the focal point position – it  will always be at the same place as the center of the radial gradient itself (cx, cy). Besides,
 * the implementation supports only 2 colors. A radial gradient is implemented with the help of a pluggable image
 * of a linear gradient (from the black color in the middle to the white along the edges). When the gradient is applied to a figure,
 * it is filled with a pattern fill based on this image. It is impossible to change the image –
 * you can only move or stretch it. That is why there are limitations mentioned above. A full-fledged,
 * multicolored gradient with a custom focal point is possible only in a circle (or it can be implemented with the help of curves generating an ideal circle),
 * and in other shapes the gradient will be far from what is expected from a radial gradient.
 *
 * @param {!Array.<acgraph.vector.GradientKey>} keys Color-stop gradient keys.
 * @param {number} cx The X-coordinate of the center of the gradient.
 * @param {number} cy The Y-coordinate of the center of the gradient.
 * @param {number} size_x The size of the gradient along the X-axis.
 * @param {number} size_y The size of the gradient along the Y-axis.
 * @param {number=} opt_opacity The opacity of the gradient.
 * @param {goog.math.Rect=} opt_mode If defined, then the userSpaceOnUse mode is used, otherwise objectBoundingBox is used.
 * @extends {acgraph.vector.RadialGradient}
 * @constructor
 */
acgraph.vector.vml.RadialGradient = function(keys, cx, cy, size_x, size_y, opt_opacity, opt_mode) {
  goog.base(this, keys, cx, cy, cx, cx, opt_opacity, opt_mode);
  /**
   * The size of the radial gradient along the X-axis.
   * @type {number}
   */
  this.size_x = size_x;
  /**
   * The size of the radial gradient along the Y-axis.
   * @type {number}
   */
  this.size_y = size_y;
};
goog.inherits(acgraph.vector.vml.RadialGradient, acgraph.vector.RadialGradient);


/**
 * Serializes a radial-gradient object in a string.
 * @param {!Array.<acgraph.vector.GradientKey>} keys Color-stop gradient keys.
 * @param {number} cx The X-coordinate of the center of the gradient.
 * @param {number} cy The Y-coordinate of the center of the gradient.
 * @param {number} size_x The size of the gradient along the X-axis.
 * @param {number} size_y The size of the gradient along the Y-axis.
 * @param {number=} opt_opacity The opacity of the gradient.
 * @param {goog.math.Rect=} opt_mode If defined, then the userSpaceOnUse mode is used, otherwise objectBoundingBox is used.
 * @return {string} String ID for radial gradient object.
 */
acgraph.vector.vml.RadialGradient.serialize = function(keys, cx, cy, size_x, size_y, opt_opacity, opt_mode) {
  //Transformation of the input parameters, the same as in the class constructor, for applying default values and
  //unifying values.
  /** @type {number}*/
  var opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  /** @type {Array.<string>} */
  var gradientKeys = [];
  goog.array.forEach(keys, function(el) {
    gradientKeys.push('' + el.offset + el.color + (el.opacity ? el.opacity : null)
    );
  });
  /** @type {string} */
  var boundsToString = opt_mode ? '' + opt_mode.left + opt_mode.top + opt_mode.width + opt_mode.height : '';

  return gradientKeys.join('') + opacity + cx + cy + size_x + size_y + boundsToString;
};
