goog.provide('acgraph.vector.Defs');
goog.require('acgraph.vector.HatchFill');
goog.require('acgraph.vector.ILayer');
goog.require('acgraph.vector.LinearGradient');
goog.require('acgraph.vector.PatternFill');
goog.require('acgraph.vector.RadialGradient');
goog.require('goog.Disposable');
goog.require('goog.math.Rect');



/**
 * Reusable elements container for SVG.
 * <a href='http://www.w3.org/TR/SVG/struct.html#DefsElement'>SVG Defs Element</a>
 * @constructor
 * @param {!acgraph.vector.Stage} stage Renderer.
 * @extends {goog.Disposable}
 * @implements {acgraph.vector.ILayer}
 */
acgraph.vector.Defs = function(stage) {
  goog.base(this);

  /**
   * Existing linear gradients.
   * @type {Object.<string, !acgraph.vector.LinearGradient>}
   * @private
   */
  this.linearGradients_ = {};
  /**
   * Existing radial gradients.
   * @type {Object.<string, !acgraph.vector.RadialGradient>}
   * @private
   */
  this.radialGradients_ = {};
  /**
   * Existing hatch fills.
   * @type {Object.<string, !acgraph.vector.HatchFill>}
   * @private
   */
  this.hatchFills_ = {};
  /**
   * Existing image fills.
   * @type {Object.<string, ?acgraph.vector.PatternFill>}
   * @private
   */
  this.imageFills_ = {};
  /**
   * Stage.
   * @type {!acgraph.vector.Stage}
   * @protected
   */
  this.stage = stage;
};
goog.inherits(acgraph.vector.Defs, goog.Disposable);


//----------------------------------------------------------------------------------------------------------------------
//
//  Working with DOM element
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * DOM element.
 * @private
 * @type {Element}
 */
acgraph.vector.Defs.prototype.domElement_ = null;


/**
 * Returns DOM Element for defs.
 * @return {Element} DOM Element.
 */
acgraph.vector.Defs.prototype.domElement = function() {
  return this.domElement_;
};


/**
 * Creating DOM element.
 */
acgraph.vector.Defs.prototype.createDom = function() {
  this.domElement_ = acgraph.getRenderer().createDefsElement();
};


/**
 * Clear all children of defs.
 */
acgraph.vector.Defs.prototype.clear = function() {
  goog.object.clear(this.linearGradients_);
  goog.object.clear(this.radialGradients_);
  goog.object.clear(this.hatchFills_);
  goog.object.clear(this.imageFills_);
  goog.dom.removeChildren(this.domElement_);
};


/**
 * Returns array of existing linear gradients.
 * @return {Object.<string, !acgraph.vector.LinearGradient>} Array of linear gradients.
 * @protected
 */
acgraph.vector.Defs.prototype.getLinearGradients = function() {
  return this.linearGradients_;
};


/**
 * Returns fill as an image. If a fill with the given parameters already exists - returns an existing object.
 * @param {string} src Image src.
 * @param {goog.math.Rect} bounds Bounds.
 * @param {acgraph.vector.ImageFillMode=} opt_mode Mode.
 * @param {number=} opt_opacity Image opacity.
 * @param {Function=} opt_callback If mode is acgraph.vector.ImageFillMode.TILE, the result is passed to a
 * callback function.
 * @return {?acgraph.vector.PatternFill} Pattern fill object with an image.
 */
acgraph.vector.Defs.prototype.getImageFill = function(src, bounds, opt_mode, opt_opacity, opt_callback) {
  opt_opacity = goog.isDef(opt_opacity) ? opt_opacity : 1;
  var mode = goog.isDefAndNotNull(opt_mode) ? opt_mode : acgraph.vector.ImageFillMode.STRETCH;
  var id = [src, bounds.left, bounds.top, bounds.width, bounds.height, mode, opt_opacity].join(',');
  var pattern = null;

  var callback = goog.nullFunction;
  if (mode == acgraph.vector.ImageFillMode.TILE) {
    var ths = this;
    callback = function(imageWidth, imageHeight) {
      var pattern;
      if (goog.object.containsKey(ths.imageFills_, id))
        pattern = ths.imageFills_[id];
      else {
        pattern = new acgraph.vector.PatternFill(
            new goog.math.Rect(bounds.left, bounds.top, imageWidth, imageHeight));

        pattern.image()
            .src(src)
            .opacity(opt_opacity)
            .width(imageWidth)
            .height(imageHeight);
        ths.imageFills_[id] = pattern;
      }
      if (opt_callback) opt_callback.call(this, pattern);
    };
  } else {
    if (goog.object.containsKey(this.imageFills_, id)) return this.imageFills_[id];
    pattern = new acgraph.vector.PatternFill(bounds);
    switch (mode) {
      case acgraph.vector.ImageFillMode.STRETCH:
        pattern.image()
            .src(src)
            .opacity(opt_opacity)
            .width(bounds.width)
            .height(bounds.height);
        break;
      case acgraph.vector.ImageFillMode.FIT_MAX:
        pattern.image()
            .src(src)
            .opacity(opt_opacity)
            .width(bounds.width)
            .height(bounds.height)
            .align(acgraph.vector.Image.Align.X_MID_Y_MID)
            .fittingMode(acgraph.vector.Image.Fitting.SLICE);
        break;
      case acgraph.vector.ImageFillMode.FIT:
        pattern.image()
            .src(src)
            .opacity(opt_opacity)
            .width(bounds.width)
            .height(bounds.height)
            .align(acgraph.vector.Image.Align.X_MID_Y_MID);
        break;
    }
    this.imageFills_[id] = pattern;
  }
  acgraph.getRenderer().measuringImage(src, callback);
  callback = null;
  return this.imageFills_[id];
};


/**
 * Returns hatch fill object. If a hatch fill with the given parameters already exists - returns an existing object.
 * @param {acgraph.vector.HatchFill.HatchFillType=} opt_type Hatch fill type.
 * @param {string=} opt_color Hatch fill color combined with opacity.
 * @param {number=} opt_thickness Hatch fill thickness.
 * @param {number=} opt_size Hatch fill size.
 * @return {!acgraph.vector.HatchFill} Hatch fill object.
 */
acgraph.vector.Defs.prototype.getHatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  var type = goog.isDefAndNotNull(opt_type) ? opt_type : acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL;
  var color = goog.isDefAndNotNull(opt_color) ? opt_color : 'black';
  var thickness = goog.isDefAndNotNull(opt_thickness) ? opt_thickness : 1;
  var size = goog.isDefAndNotNull(opt_size) ? opt_size : 10;

  var id = acgraph.vector.HatchFill.serialize(type, color, thickness, size);
  if (goog.object.containsKey(this.hatchFills_, id)) return this.hatchFills_[id];
  return this.hatchFills_[id] = new acgraph.vector.HatchFill(type, color, thickness, size);
};


/**
 * Remove hatch fill form defs and DOM.
 * @param {!acgraph.vector.HatchFill} element Hatch fill object.
 */
acgraph.vector.Defs.prototype.removeHatchFill = function(element) {
  var id = acgraph.vector.HatchFill.serialize(element.type, element.color, element.thickness, element.size);
  if (goog.object.containsKey(this.hatchFills_, id)) goog.object.remove(this.hatchFills_, id);
  var hatchFillDomElement = goog.dom.getElement(/** @type {string} */(element.id()));
  goog.dom.removeNode(hatchFillDomElement);
};


/**
 * Check if gradient exists in defs. Input params are gradient params,
 * method checks whether there a gradient with such params already exists.
 * If found - a link is returned, if not - new gradient is created,
 * cached and returned.
 * @param {!Array.<acgraph.vector.GradientKey>} keys Gradient keys.
 * @param {number=} opt_opacity Gradient opacity.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|goog.math.Rect)=} opt_mode Gradient mode. More about mode
 * in {@see acgraph.vector.LinearGradient...number}.
 * @param {goog.math.AffineTransform=} opt_transform Gradient transform.
 * @return {!acgraph.vector.LinearGradient} Linear gradient object.
 */
acgraph.vector.Defs.prototype.getLinearGradient = function(keys, opt_opacity, opt_angle, opt_mode, opt_transform) {
  // TODO(Anton Saukh): in theory this normalization is done in shape.fill(), so we don't do it here
  //  goog.array.forEach(keys, function(a) {
  //    a.offset = goog.isDefAndNotNull(a['offset']) ? goog.math.clamp(a['offset'], 0, 1) : 1;
  //    a.color = goog.isDefAndNotNull(a['color']) ? a['color'] : '';
  //    a.opacity = goog.isDefAndNotNull(a['opacity']) ? goog.math.clamp(a['opacity'], 0, 1) : null;
  //  });
  //  goog.array.sortObjectsByKey(keys, 'offset');

  var id = acgraph.vector.LinearGradient.serialize(keys, opt_opacity, opt_angle, opt_mode, opt_transform);

  if (goog.object.containsKey(this.linearGradients_, id)) return this.linearGradients_[id];

  return this.linearGradients_[id] = new acgraph.vector.LinearGradient(keys, opt_opacity, opt_angle, opt_mode, opt_transform);
};


/**
 * Remove linear gradient form defs and DOM.
 * @param {!acgraph.vector.LinearGradient} element Linear gradient to remove.
 */
acgraph.vector.Defs.prototype.removeLinearGradient = function(element) {
  var id = acgraph.vector.LinearGradient.serialize(element.keys, element.opacity, element.angle, element.mode, element.transform);
  if (goog.object.containsKey(this.linearGradients_, id)) goog.object.remove(this.linearGradients_, id);
  var linearGradientDomElement = goog.dom.getElement(element.id());
  goog.dom.removeNode(linearGradientDomElement);
};


/**
 * Returns radial gradient. If a radial gradient  with the given parameters already exists - returns an existing object.
 * @param {!Array.<acgraph.vector.GradientKey>} keys Gradient keys.
 * @param {number} cx X coordinate of the gradient center.
 * @param {number} cy Y coordinate of the gradient center.
 * @param {number} fx X coordinate of the gradient focal point.
 * @param {number} fy Y coordinate of the gradient focal point.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {goog.math.Rect=} opt_mode If defined then userSpaceOnUse mode else objectBoundingBox.
 * @param {goog.math.AffineTransform=} opt_transform Gradient transform.
 * @return {!acgraph.vector.RadialGradient} Radial gradient object.
 */
acgraph.vector.Defs.prototype.getRadialGradient = function(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform) {
  // TODO(Anton Saukh): in theory this normalization is done in shape.fill(), so we don't do it here
  //  goog.array.forEach(keys, function(a) {
  //    a.offset = goog.isDefAndNotNull(a['offset']) ? goog.math.clamp(a['offset'], 0, 1) : 1;
  //    a.color = goog.isDefAndNotNull(a['color']) ? a['color'] : '';
  //    a.opacity = goog.isDefAndNotNull(a['opacity']) ? goog.math.clamp(a['opacity'], 0, 1) : null;
  //  });
  //  goog.array.sortObjectsByKey(keys, 'offset');

  var id = acgraph.vector.RadialGradient.serialize(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform);

  if (goog.object.containsKey(this.radialGradients_, id)) return this.radialGradients_[id];

  return this.radialGradients_[id] = new acgraph.vector.RadialGradient(keys, cx, cy, fx, fy, opt_opacity, opt_mode, opt_transform);
};


/**
 * Remove radial gradient form defs and DOM.
 * @param {!acgraph.vector.RadialGradient} element Linear gradient to remove.
 */
acgraph.vector.Defs.prototype.removeRadialGradient = function(element) {
  var id = acgraph.vector.RadialGradient.serialize(
      element.keys, element.cx, element.cy, element.fx, element.fy, element.opacity, element.bounds, element.transform);
  if (goog.object.containsKey(this.radialGradients_, id)) goog.object.remove(this.radialGradients_, id);
  var radialGradientDomElement = goog.dom.getElement(element.id());
  goog.dom.removeNode(radialGradientDomElement);
};


/**
 * Render.
 */
acgraph.vector.Defs.prototype.render = function() {
  this.createDom();
  goog.dom.appendChild(this.stage.domElement(), this.domElement());
};


//----------------------------------------------------------------------------------------------------------------------
//
//  ILayer members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {!acgraph.vector.Element} child .
 * @return {!acgraph.vector.ILayer} .
 */
acgraph.vector.Defs.prototype.addChild = function(child) {
  child.remove();
  child.setParent(this);
  return this;
};


/**
 * @param {acgraph.vector.Element} element Element to be removed.
 * @return {acgraph.vector.Element} Removed element or null.
 */
acgraph.vector.Defs.prototype.removeChild = function(element) {
  element.setParent(null);
  goog.dom.removeNode(element.domElement());
  return element;
};


/**
 * Returns full transformation (self and parent transformations combined).
 * @return {goog.math.AffineTransform} Full transformation.
 */
acgraph.vector.Defs.prototype.getFullTransformation = function() {
  return null;
};


/**
 * @param {acgraph.vector.Element} child .
 */
acgraph.vector.Defs.prototype.notifyRemoved = goog.nullFunction;


/**
 * @return {acgraph.vector.Stage} Stage (may be null).
 */
acgraph.vector.Defs.prototype.getStage = function() {
  return /** @type {acgraph.vector.Stage} */(this.stage);
};


/**
 * Sets dirty state.
 * @param {number} value States to be set.
 */
acgraph.vector.Defs.prototype.setDirtyState = goog.nullFunction;


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Defs.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.domElement_);
  this.domElement_ = null;

  goog.disposeAll(this.linearGradients_);
  goog.disposeAll(this.radialGradients_);
  goog.disposeAll(this.imageFills_);
  // goog.disposeAll(this.hatchFills_);

  delete this.stage;
};
