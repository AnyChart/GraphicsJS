goog.provide('acgraph.vector.RadialGradient');
goog.require('acgraph.utils.IdGenerator');
goog.require('goog.Disposable');



/**
 * Radial gradient.
 * @param {!Array.<acgraph.vector.GradientKey>} keys Color-stop gradient keys.
 * @param {number} cx X coordinate of center radial gradient.
 * @param {number} cy Y coordinate of center radial gradient.
 * @param {number} fx X coordinate of focal point.
 * @param {number} fy Y coordinate of focal point.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {goog.math.Rect=} opt_mode If defined then userSpaceOnUse mode else objectBoundingBox.
 * @param {goog.math.AffineTransform=} opt_transform Gradient transform.
 * @extends {goog.Disposable}
 * @constructor
 */
acgraph.vector.RadialGradient = function(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform) {
  goog.base(this);
  /**
   * Center X.
   * @type {number}
   */
  this.cx = cx;
  /**
   * Center Y.
   * @type {number}
   */
  this.cy = cy;
  /**
   * Focal point X.
   * @type {number}
   */
  this.fx = fx;
  /**
   * Focal point Y.
   * @type {number}
   */
  this.fy = fy;
  /**
   * Gradient keys.
   * @type {!Array.<acgraph.vector.GradientKey>}
   */
  this.keys = keys;
  /**
   * Gradient opacity (0 to 1). Values greater than 1 default to 1,
   * lesser than 0 - to 0.
   * @type {number}
   */
  this.opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  /**
   * Gradient rectangel. If set - gradient works in
   * userSpaceOnUse mode (see opt_bounds description).
   * @type {goog.math.Rect}
   */
  this.bounds = goog.isDefAndNotNull(opt_mode) ? opt_mode : null;
  /**
   * Gradient transform.
   * @type {goog.math.AffineTransform}
   */
  this.transform = goog.isDefAndNotNull(opt_transform) ? opt_transform : null;
};
goog.inherits(acgraph.vector.RadialGradient, goog.Disposable);


//----------------------------------------------------------------------------------------------------------------------
//
//  Static members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Static method, which returns gradient as string that identifies gradient.
 * This id allows to compare gradients with one operation and don't
 * iterate parameters each time. Read more about parameters at
 * {@link acgraph.vector.RadialGradient}
 * @param {Array.<acgraph.vector.GradientKey>} keys Gradient keys.
 * @param {number} cx Center X.
 * @param {number} cy Center Y.
 * @param {number} fx Focal point X.
 * @param {number} fy Focal point Y.
 * @param {number=} opt_opacity Gradient opacity.
 * @param {goog.math.Rect=} opt_mode Gradient mode.
 * @param {goog.math.AffineTransform=} opt_transform Gradient transform.
 * @return {string} String id.
 */
acgraph.vector.RadialGradient.serialize = function(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform) {
  // Conversion of input params, the same as in constructor, to apply defaults
  // and unify values.
  /** @type {number}*/
  var opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  /** @type {Array.<string>} */
  var gradientKeys = [];
  goog.array.forEach(keys, function(el) {
    gradientKeys.push('' + el['offset'] + el['color'] + (el['opacity'] ? el['opacity'] : 1));
  });
  /** @type {string} */
  var boundsToString = opt_mode ? '' + opt_mode.left + opt_mode.top + opt_mode.width + opt_mode.height : '';
  var transformationToString = opt_transform ? opt_transform.toString() : '';

  return gradientKeys.join('') + opacity + cx + cy + fx + fy + boundsToString + transformationToString;
};


//region --- Section Properties ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Is rendering finished or not.
 * @type {boolean}
 */
acgraph.vector.RadialGradient.prototype.rendered = false;


/**
 * If gradient is rendered - we need Defs instance here, so we could remove gradient in a valid way.
 * @type {acgraph.vector.Defs}
 */
acgraph.vector.RadialGradient.prototype.defs = null;


/**
 * Gradient id.
 * @type {string}
 */
acgraph.vector.RadialGradient.prototype.id_;


/**
 * Returns auto-generated gradient id.
 * @return {!string} Returns gradient id.
 */
acgraph.vector.RadialGradient.prototype.id = function() {
  return this.id_ || (this.id_ = acgraph.utils.IdGenerator.getInstance().generateId(this));
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Type prefix
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Returns type prefix.
 * @return {acgraph.utils.IdGenerator.ElementTypePrefix} Type prefix.
 */
acgraph.vector.RadialGradient.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.RADIAL_GRADIENT;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Disposes gradient completelt, removes from parent layer, null internal links,
 * removes from DOM structure.
 */
acgraph.vector.RadialGradient.prototype.dispose = function() {
  goog.base(this, 'dispose');
};


/** @inheritDoc */
acgraph.vector.RadialGradient.prototype.disposeInternal = function() {
  if (this.defs) {
    this.defs.removeRadialGradient(this);
    this.defs = null;
  }
  this.bounds = null;
  this.transform = null;
  delete this.keys;
  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.RadialGradient.prototype;
  proto['dispose'] = proto.dispose;
})();
