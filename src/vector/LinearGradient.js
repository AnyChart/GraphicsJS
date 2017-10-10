goog.provide('acgraph.vector.LinearGradient');
goog.require('acgraph.utils.IdGenerator');
goog.require('goog.Disposable');



/**
 * Linear gradient. Used to fill shapes with linear gradient configured with (acgraph.vector.GradientKey)
 * array. Gradient line is a perpendicular to colors line. Gradient angle is an angle relative to
 * horizontal line (0 degrees means horizontal). Gradient has its own opacity, but keys opacity has
 * prioprity over it. TODO: check this for sure
 * Linear gradient has two modes three modes: ObjectBoundingBox with angle preservation, .
 * ObjectBoundingBox without angle preservation andUserSpaceOnUse
 * @param {!Array.<acgraph.vector.GradientKey>} keys Gradient keys.
 * @param {number=} opt_opacity Gradient opacity. Defaults to 1.
 * @param {number=} opt_angle Gradient angle. 0 degrees means gradient line is horizontal
 * and goes left to right (think of 3 o'clock). Defaults to 1.
 * @param {(boolean|goog.math.Rect)=} opt_mode Gradient mode. (ObjectBoundingBox with angle preservation,
 * ObjectBoundingBox without angle and UserSpaceOnUse)
 * <h4>Modes:</h4>
 * <b>ObjectBoundingBox with angle preservation</b>
 * Activated when parameter set to True.
 * In this mode the result angle will visually correspond the original setting, non regarding browser scaling duplication
 * (so, for objects that do not have 1:1 proportion with the original figure, the gradient angle will correspond to the
 * initial value due to internal calculations).
 * <b>ObjectBoundingBox without angle preservation</b>
 * Activated when parameter set to False.
 * In this mode, gradient vector is calculated with the preset angle, but the result gradient angle on the rendered page
 * can be changed if the object proportion is not 1:1 in the browser. So visually the result gradient angle may not correspond
 * to the original settings.
 * <b>UserSpaceOnUse</b>
 * Activated when goog.math.Rect object is passed.
 * In this mode gradient settings are added by gradient size and borders/coordinates, and rendering is calculated within those
 * borders. After that, the fill is executed on the element figure according to its coordinates.
 * Read more at <a href='http://www.w3.org/TR/SVG/pservers.html#LinearGradientElementGradientUnitsAttribute'>
 * gradientUnits</a>. Angle is always preserved in this mode.
 * @param {goog.math.AffineTransform=} opt_transform Gradient transform.
 * @constructor
 * @extends {goog.Disposable}
 */
acgraph.vector.LinearGradient = function(keys, opt_opacity, opt_angle, opt_mode, opt_transform) {
  goog.base(this);
  /**
   * Gradient keys.
   * @type {!Array.<acgraph.vector.GradientKey>}
   */
  this.keys = keys;
  /**
   * Gradient opacity from 0 to 1. Defaults to 1 if greatet, to 0 if less.
   * @type {number}
   */
  this.opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  /**
   * Gradient angle. 0 degrees - horizontal gradient (think of 3 o'clock). Transform to
   * [0, 360) range. Positive values go counterclockwise.
   * @type {number}
   */
  this.angle = goog.isDefAndNotNull(opt_angle) ? goog.math.standardAngle(opt_angle) : 0;
  /**
   * Gradient mode.
   * @type {(boolean|!goog.math.Rect)}
   */
  this.mode = goog.isDefAndNotNull(opt_mode) ? opt_mode : false;
  /**
   * Gradient mode.
   * @type {boolean}
   */
  this.saveAngle = !!opt_mode;
  /**
   * Gradient bounds. If set - gradient is in userSpaceOnUse mode (see opt_bounds description).
   * @type {goog.math.Rect}
   */
  this.bounds = (opt_mode && (acgraph.utils.instanceOf(opt_mode, goog.math.Rect))) ?
      /** @type {goog.math.Rect} */(opt_mode) : null;
  /**
   * Gradient transform.
   * @type {goog.math.AffineTransform}
   */
  this.transform = goog.isDefAndNotNull(opt_transform) ? opt_transform : null;
};
goog.inherits(acgraph.vector.LinearGradient, goog.Disposable);


//----------------------------------------------------------------------------------------------------------------------
//
//  Static members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Static method, which returns gradient as string that identifies gradient.
 * This id allows to compare gradients with one operation and don't
 * iterate parameters each time. Read more about parameters at
 * {@link acgraph.vector.LinearGradient}
 * @param {Array.<acgraph.vector.GradientKey>} keys Gradient keys.
 * @param {number=} opt_opacity Gradient opacity.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|goog.math.Rect)=} opt_mode Gradient mode.
 * @param {goog.math.AffineTransform=} opt_transform Gradient transform.
 * @return {string} String id.
 */
acgraph.vector.LinearGradient.serialize = function(keys, opt_opacity, opt_angle, opt_mode, opt_transform) {
  // Conversion of input params, the same as in constructor, to apply defaults
  // and unify values.
  /** @type {number}*/
  var angle = goog.isDefAndNotNull(opt_angle) ? goog.math.standardAngle(opt_angle) : 0;
  /** @type {number}*/
  var opacity = goog.isDefAndNotNull(opt_opacity) ? goog.math.clamp(opt_opacity, 0, 1) : 1;
  /** @type {boolean}*/
  var saveAngle = !!opt_mode;
  /** @type {goog.math.Rect}*/
  var bounds = goog.isDefAndNotNull(opt_mode) ?
      acgraph.utils.instanceOf(opt_mode, goog.math.Rect) ?
          /** @type {goog.math.Rect} */(opt_mode) :
          null :
      null;

  /** @type {Array.<string>} */
  var gradientKeys = [];
  goog.array.forEach(keys, function(el) {
    gradientKeys.push('' + el['offset'] + el['color'] + (el['opacity'] ? el['opacity'] : null)
    );
  });
  /** @type {string} */
  var boundsToString = bounds ?
      '' + bounds.left + bounds.top + bounds.width + bounds.height :
      '';
  var transformationToString = opt_transform ? opt_transform.toString() : '';

  return gradientKeys.join('') + opacity + angle + saveAngle + boundsToString + transformationToString;
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
acgraph.vector.LinearGradient.prototype.rendered = false;


/**
 * If gradient is rendered - we need Defs instance here, so we could remove gradient in a valid way.
 * @type {acgraph.vector.Defs}
 */
acgraph.vector.LinearGradient.prototype.defs = null;


/**
 * Gradient id.
 * @type {string}
 */
acgraph.vector.LinearGradient.prototype.id_;


/**
 * Returns auto-generated gradient id.
 * @return {!string} Returns gradient id.
 */
acgraph.vector.LinearGradient.prototype.id = function() {
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
acgraph.vector.LinearGradient.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.LINEAR_GRADIENT;
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
acgraph.vector.LinearGradient.prototype.dispose = function() {
  goog.base(this, 'dispose');
};


/** @inheritDoc */
acgraph.vector.LinearGradient.prototype.disposeInternal = function() {
  if (this.defs) {
    this.defs.removeLinearGradient(this);
    this.defs = null;
  }
  this.bounds = null;
  this.transform = null;
  delete this.keys;
  this.mode = false;
  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.LinearGradient.prototype;
  proto['dispose'] = proto.dispose;
})();
