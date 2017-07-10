goog.provide('acgraph.vector.Image');

goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Element');
goog.require('goog.math.Rect');



/**
 * Image primitive.
 * @param {string=} opt_src IRI (Internationalized Resource Identifiers) for image source.
 * @param {number=} opt_x X coordinate of left-top corner image.
 * @param {number=} opt_y Y coordinate of left-top corner image.
 * @param {number=} opt_width Width of image bounds.
 * @param {number=} opt_height Height of image bounds.
 * @param {acgraph.vector.Image.Align=} opt_preserveAspectRatio Preserve aspect ratio.
 * @param {acgraph.vector.Image.Fitting=} opt_fittingMode Fitting mode.
 * @constructor
 * @extends {acgraph.vector.Element}
 */
acgraph.vector.Image = function(opt_src, opt_x, opt_y, opt_width, opt_height, opt_preserveAspectRatio, opt_fittingMode) {
  /**
   * IRI (Internationalized Resource Identifiers) for image source.
   * @type {?string}
   * @private
   */
  this.src_ = opt_src || null;

  /**
   * Image positioning.
   * http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
   * @type {acgraph.vector.Image.Align}
   * @private
   */
  this.align_ = opt_preserveAspectRatio || acgraph.vector.Image.Align.NONE;


  /**
   * Fitting mode.
   * http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
   * @type {acgraph.vector.Image.Fitting}
   * @private
   */
  this.fittingMode_ = opt_fittingMode || acgraph.vector.Image.Fitting.MEET;

  /**
   * Bounds.
   * @type {goog.math.Rect}
   * @private
   */
  this.bounds_ = new goog.math.Rect(opt_x || 0, opt_y || 0, opt_width || 0, opt_height || 0);

  /**
   * Image opacity.
   * @type {number}
   * @private
   */
  this.opacity_ = 1;

  goog.base(this);
};
goog.inherits(acgraph.vector.Image, acgraph.vector.Element);


/**
 * @enum {string}
 */
acgraph.vector.Image.Fitting = {
  /**
   * aspect ratio is preserved
   * the entire ‘viewBox’ is visible within the viewport
   * the ‘viewBox’ is scaled up as much as possible, while still meeting the other criteria
   */
  MEET: 'meet',
  /**
   * aspect ratio is preserved
   * the entire viewport is covered by the ‘viewBox’
   * the ‘viewBox’ is scaled down as much as possible, while still meeting the other criteria
   */
  SLICE: 'slice'
};


/**
 * @enum {string}
 */
acgraph.vector.Image.Align = {
  /**
   * Do not force uniform scaling. Scale the graphic content of the given element non-uniformly if necessary such that the element's bounding box exactly matches the viewport rectangle.
     (Note: if <align> is none, then the optional <meetOrSlice> value is ignored.)
   */
  NONE: 'none',
  /**
   * Force uniform scaling.
     Align the <min-x> of the element's ‘viewBox’ with the smallest X value of the viewport.
     Align the <min-y> of the element's ‘viewBox’ with the smallest Y value of the viewport.
   */
  X_MIN_Y_MIN: 'x-min-y-min',
  /**
   * Force uniform scaling.
     Align the midpoint X value of the element's ‘viewBox’ with the midpoint X value of the viewport.
     Align the <min-y> of the element's ‘viewBox’ with the smallest Y value of the viewport.
   */
  X_MID_Y_MIN: 'x-mid-y-min',
  /**
   * Force uniform scaling.
     Align the <min-x>+<width> of the element's ‘viewBox’ with the maximum X value of the viewport.
     Align the <min-y> of the element's ‘viewBox’ with the smallest Y value of the viewport.
   */
  X_MAX_Y_MIN: 'x-max-y-min',
  /**
   * Force uniform scaling.
     Align the <min-x> of the element's ‘viewBox’ with the smallest X value of the viewport.
     Align the midpoint Y value of the element's ‘viewBox’ with the midpoint Y value of the viewport.
   */
  X_MIN_Y_MID: 'x-min-y-mid',
  /**
   * Force uniform scaling.
     Align the midpoint X value of the element's ‘viewBox’ with the midpoint X value of the viewport.
     Align the midpoint Y value of the element's ‘viewBox’ with the midpoint Y value of the viewport.
   */
  X_MID_Y_MID: 'x-mid-y-mid',
  /**
   * Force uniform scaling.
     Align the <min-x>+<width> of the element's ‘viewBox’ with the maximum X value of the viewport.
     Align the midpoint Y value of the element's ‘viewBox’ with the midpoint Y value of the viewport.
   */
  X_MAX_Y_MID: 'x-max-y-mid',
  /**
   * Force uniform scaling.
     Align the <min-x> of the element's ‘viewBox’ with the smallest X value of the viewport.
     Align the <min-y>+<height> of the element's ‘viewBox’ with the maximum Y value of the viewport.
   */
  X_MIN_Y_MAX: 'x-min-y-max',
  /**
   * Force uniform scaling.
     Align the midpoint X value of the element's ‘viewBox’ with the midpoint X value of the viewport.
     Align the <min-y>+<height> of the element's ‘viewBox’ with the maximum Y value of the viewport.
   */
  X_MID_Y_MAX: 'x-mid-y-max',
  /**
   * Force uniform scaling.
     Align the <min-x>+<width> of the element's ‘viewBox’ with the maximum X value of the viewport.
     Align the <min-y>+<height> of the element's ‘viewBox’ with the maximum Y value of the viewport.
   */
  X_MAX_Y_MAX: 'x-max-y-max'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported dirty states.
 * @type {number}
 */
acgraph.vector.Image.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.DATA;


/** @inheritDoc */
acgraph.vector.Image.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.IMAGE;
};


/**
 * Fitting mode.
 * @param {acgraph.vector.Image.Fitting=} opt_value Fitting mode.
 * @return {!acgraph.vector.Image|acgraph.vector.Image.Fitting} Fitting mode value or this.
 */
acgraph.vector.Image.prototype.fittingMode = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.fittingMode_) {
      this.fittingMode_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.fittingMode_;
};


/**
 * Preserve aspect ratio.
 * @param {acgraph.vector.Image.Align=} opt_value Preserve aspect ratio.
 * @return {!acgraph.vector.Image|acgraph.vector.Image.Align} Preserve aspect ratio value or this.
 */
acgraph.vector.Image.prototype.align = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.align_) {
      this.align_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.align_;
};


/**
 * Getter/Setter for X coordinate.
 * @param {number=} opt_value X coordinate.
 * @return {!acgraph.vector.Image|number} If opt_value defined then returns Image object else X coordinate value.
 */
acgraph.vector.Image.prototype.x = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.left) {
      this.bounds_.left = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.left;
};


/**
 * Getter/Setter for Y coordinate.
 * @param {number=} opt_value Y coordinate.
 * @return {!acgraph.vector.Image|number} If opt_value defined then returns Image object else Y coordinate value.
 */
acgraph.vector.Image.prototype.y = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.top) {
      this.bounds_.top = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.top;
};


/**
 * Getter/Setter for image width.
 * @param {number=} opt_value Image width .
 * @return {!acgraph.vector.Image|number} If opt_value defined then returns Image object else image width value.
 */
acgraph.vector.Image.prototype.width = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.width) {
      this.bounds_.width = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.width;
};


/**
 * Getter/Setter for image height.
 * @param {number=} opt_value Image height .
 * @return {!acgraph.vector.Image|number} If opt_value defined then returns Image object else image height value.
 */
acgraph.vector.Image.prototype.height = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value != this.bounds_.height) {
      this.bounds_.height = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.bounds_.height;
};


/**
 * Getter/Setter for image source. Set null value for non-display image.
 * @param {string=} opt_value IRI for source of image.
 * @return {acgraph.vector.Image|string} If opt_value defined then returns Image object else IRI of source image.
 */
acgraph.vector.Image.prototype.src = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.src_) {
      this.src_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.src_;
};


/**
 * Getter/Setter for image opacity.
 * @param {number=} opt_value Image opacity.
 * @return {acgraph.vector.Image|number} If opt_value defined then returns Image object else Opacity of the image.
 */
acgraph.vector.Image.prototype.opacity = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.opacity_) {
      this.opacity_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.opacity_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Image.prototype.getBoundsWithoutTransform = function() {
  return this.bounds_.clone();
};


/** @inheritDoc */
acgraph.vector.Image.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform)
    return this.boundsCache.clone();
  else if (this.absoluteBoundsCache && isFullTransform)
    return this.absoluteBoundsCache.clone();
  else {
    /** @type {!goog.math.Rect} */
    var rect = acgraph.math.getBoundsOfRectWithTransform(this.bounds_.clone(), transform);
    if (isSelfTransform)
      this.boundsCache = rect.clone();
    if (isFullTransform)
      this.absoluteBoundsCache = rect.clone();
    return rect;
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Image.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createImageElement();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Image.prototype.renderInternal = function() {
  // If data unsynced - update
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    if (acgraph.getRenderer().needsReRenderOnParentTransformationChange())
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.renderData();
  }

  goog.base(this, 'renderInternal');
};


/** @inheritDoc */
acgraph.vector.Image.prototype.renderTransformation = function() {
  // Resolve transformation state
  acgraph.getRenderer().setImageTransformation(this);
  // Set flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


/**
 * Applied primitive properties to its DOM element.
 */
acgraph.vector.Image.prototype.renderData = function() {
  // Apply data to the DOM element
  acgraph.getRenderer().setImageProperties(this);
  // Set flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Image.prototype.deserialize = function(data) {
  var bounds = data['bounds'];
  this
      .x(bounds.left)
      .y(bounds.top)
      .width(bounds.width)
      .height(bounds.height)
      .src(data['src'])
      .align(data['align'])
      .fittingMode(data['fittingMode']);
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.Image.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['type'] = 'image';
  data['bounds'] = this.getBoundsWithoutTransform();
  data['src'] = this.src();
  data['align'] = this.align();
  data['fittingMode'] = this.fittingMode();
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Image.prototype.disposeInternal = function() {
  this.bounds_ = null;
  this.dropBoundsCache();

  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  goog.exportSymbol('acgraph.vector.Image', acgraph.vector.Image);
  var proto = acgraph.vector.Image.prototype;
  proto['fittingMode'] = proto.fittingMode;
  proto['align'] = proto.align;
  proto['x'] = proto.x;
  proto['y'] = proto.y;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['src'] = proto.src;
})();
