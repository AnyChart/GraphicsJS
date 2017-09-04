goog.provide('acgraph.vector.Ellipse');

goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Shape');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');



/**
 Ellipse Class.<br>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#ellipse} or
 {@link acgraph.vector.Layer#ellipse} to make stage or layer bound ellipse.
 <br/> Use {@link acgraph.ellipse} to create an unbound ellipse.
 @see acgraph.vector.Stage#ellipse
 @see acgraph.vector.Layer#ellipse
 @see acgraph.ellipse
 @name acgraph.vector.Ellipse
 @param {number=} opt_cx Center X.
 @param {number=} opt_cy Center Y.
 @param {number=} opt_rx X radius.
 @param {number=} opt_ry Y radius.
 @constructor
 @extends {acgraph.vector.Shape}
 */
acgraph.vector.Ellipse = function(opt_cx, opt_cy, opt_rx, opt_ry) {
  /**
   * Ellipse center.
   * @type {goog.math.Coordinate}
   * @private
   */
  this.center_ = new goog.math.Coordinate(
      opt_cx || 0,
      opt_cy || 0);
  /**
   * X radius in pixels.
   * @type {number}
   * @private
   */
  this.radiusX_ = opt_rx || 0;
  /**
   * Y radius in pixels.
   * @type {number}
   * @private
   */
  this.radiusY_ = opt_ry || 0;

  goog.base(this);
};
goog.inherits(acgraph.vector.Ellipse, acgraph.vector.Shape);


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sync states. Inherited from Shape.
 * @type {number}
 */
acgraph.vector.Ellipse.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.DATA;


/** @inheritDoc */
acgraph.vector.Ellipse.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.ELLIPSE;
};


/**
 Returns Center X.
 @param {number=} opt_value .
 @return {!acgraph.vector.Ellipse|number} .
 */
acgraph.vector.Ellipse.prototype.centerX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.center_.x != opt_value) {
      this.center_.x = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.center_.x;
};


/**
 Returns Center Y.
 @param {number=} opt_value .
 @return {!acgraph.vector.Ellipse|number} .
 */
acgraph.vector.Ellipse.prototype.centerY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.center_.y != opt_value) {
      this.center_.y = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.center_.y;
};


/**
 Returns Center Cooridnates.
 @param {goog.math.Coordinate=} opt_value .
 @return {!acgraph.vector.Ellipse|goog.math.Coordinate} .
 */
acgraph.vector.Ellipse.prototype.center = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!goog.math.Coordinate.equals(this.center_, opt_value)) {
      // clone is not used to avoid creating new objects
      this.center_.x = opt_value.x;
      this.center_.y = opt_value.y;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.center_.clone();
};


/**
 Returns X radius.
 @param {number=} opt_value .
 @return {!acgraph.vector.Ellipse|number} .
 */
acgraph.vector.Ellipse.prototype.radiusX = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.radiusX_ != opt_value) {
      this.radiusX_ = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.radiusX_;
};


/**
 Returns Y radius.
 @param {number=} opt_value .
 @return {!acgraph.vector.Ellipse|number} .
 */
acgraph.vector.Ellipse.prototype.radiusY = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.radiusY_ != opt_value) {
      this.radiusY_ = opt_value;
      this.dropBoundsCache();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.radiusY_;
};


/**
 Sets radii.
 @param {number} rx X radius.
 @param {number} ry Y radius.
 @return {!acgraph.vector.Ellipse} {@link acgraph.vector.Ellipse} instance for method chaining.
 */
acgraph.vector.Ellipse.prototype.setRadius = function(rx, ry) {
  this.radiusX(rx);
  this.radiusY(ry);
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Ellipse.prototype.getBoundsWithoutTransform = function() {
  return new goog.math.Rect(
      this.center_.x - this.radiusX_,
      this.center_.y - this.radiusY_,
      this.radiusX_ + this.radiusX_,
      this.radiusY_ + this.radiusY_);
};


/** @inheritDoc */
acgraph.vector.Ellipse.prototype.calcBoundsWithTransform = function(transform) {
  /** @type {goog.math.Rect} */
  var rect;

  if (transform) {
    var curves = acgraph.math.arcToBezier(this.center_.x, this.center_.y, this.radiusX_, this.radiusY_, 0, 360, true);
    transform.transform(curves, 0, curves, 0, curves.length / 2);
    rect = acgraph.math.calcCurveBounds.apply(null, curves);
  } else {
    rect = this.getBoundsWithoutTransform();
  }
  return rect;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Ellipse.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createEllipseElement();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Ellipse.prototype.renderInternal = function() {
  // Reset data if it is not synced
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    this.renderData();
    if (this.fill() && this.fill()['src']) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.FILL);
    }
  }

  goog.base(this, 'renderInternal');
};


/** @inheritDoc */
acgraph.vector.Ellipse.prototype.renderTransformation = function() {
  // Resolve transformation state
  acgraph.getRenderer().setEllipseTransformation(this);
  // Set flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


/**
 * Apply all setting to the DOM element.
 */
acgraph.vector.Ellipse.prototype.renderData = function() {
  // Apply data to the DOM element
  acgraph.getRenderer().setEllipseProperties(this);
  // Set flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Ellipse.prototype.deserialize = function(data) {
  this.centerX(data['cx']).centerY(data['cy']);
  if ('rx' in data) this.radiusX(data['rx']);
  if ('ry' in data) this.radiusY(data['ry']);
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.Ellipse.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['type'] = 'ellipse';
  data['cx'] = this.centerX();
  data['cy'] = this.centerY();
  data['rx'] = this.radiusX();
  data['ry'] = this.radiusY();
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Ellipse.prototype.disposeInternal = function() {
  this.dropBoundsCache();
  this.center_ = null;

  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  goog.exportSymbol('acgraph.vector.Ellipse', acgraph.vector.Ellipse);
  var proto = acgraph.vector.Ellipse.prototype;
  proto['center'] = proto.center;
  proto['centerX'] = proto.centerX;
  proto['centerY'] = proto.centerY;
  proto['radiusX'] = proto.radiusX;
  proto['radiusY'] = proto.radiusY;
  proto['setRadius'] = proto.setRadius;
})();
