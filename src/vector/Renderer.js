goog.provide('acgraph.vector.Renderer');
goog.require('goog.dom');
goog.require('goog.math.Rect');
goog.require('goog.net.ImageLoader');



/**
 * Renderer base class (SVG, VML).
 * This class defines common properties of SVG and VML renderers.
 * @constructor
 */
acgraph.vector.Renderer = function() {
  /** @type {Object.<string, Object.<string, goog.math.Rect>>} **/
  this.textBoundsCache = {};

  /** @type {Array.<string>} */
  this.settingsAffectingSize = ['fontStyle', 'fontVariant', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'decoration'];
};
goog.addSingletonGetter(acgraph.vector.Renderer);


//region --- Section Utils ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Utils.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {Object} style The style of text.
 * @return {goog.math.Rect} The width of space.
 */
acgraph.vector.Renderer.prototype.getSpaceBounds = function(style) {
  var bounds;
  if (this.isInBoundsCache(' ', style)) {
    bounds = this.textBounds(' ', style);
  } else {
    var boundsStringWithSpace = this.measure('a a', style);
    var boundsStringWithoutSpace = this.measure('aa', style);
    var width = boundsStringWithSpace.width - boundsStringWithoutSpace.width;
    bounds = new goog.math.Rect(0, boundsStringWithSpace.top, width, boundsStringWithSpace.height);
    this.textBounds(' ', style, bounds);
  }

  return bounds;
};


/**
 * @param {Object} style The style of text.
 * @return {goog.math.Rect} The width of space.
 */
acgraph.vector.Renderer.prototype.getEmptyStringBounds = function(style) {
  var bounds;
  if (this.isInBoundsCache('', style)) {
    bounds = this.textBounds('', style);
  } else {
    var boundsStringWithSpace = this.measure('a', style);
    bounds = new goog.math.Rect(0, boundsStringWithSpace.top, 0, boundsStringWithSpace.height);
    this.textBounds('', style, bounds);
  }

  return bounds;
};


/**
 * Returns simple hash of a passed style object.
 * @param {Object} value Style object.
 * @return {string} Hash of a style object.
 */
acgraph.vector.Renderer.prototype.getStyleHash = function(value) {
  var hash = '';
  for (var j = 0, l = this.settingsAffectingSize.length; j < l; j++) {
    var prop = value[this.settingsAffectingSize[j]];
    if (goog.isDef(prop)) hash += prop + '|';
  }

  return hash;
};


/**
 * Getter/lazy setter for text bounds. All bounds cached.
 * If opt_bounds defined then if cache doesn't contain bounds for passed text, opt_bounds will be set. Otherwise
 * nothing will be done and will be returned bounds from cache.
 * @param {string} text Text for getting bounds.
 * @param {Object} style Text style object.
 * @param {goog.math.Rect=} opt_bounds Text bounds.
 * @return {goog.math.Rect}
 */
acgraph.vector.Renderer.prototype.textBounds = function(text, style, opt_bounds) {
  var boundsCache = this.textBoundsCache;
  var styleHash = this.getStyleHash(style);
  var styleCache = boundsCache[styleHash];
  if (!styleCache) styleCache = boundsCache[styleHash] = {};
  var textBoundsCache = styleCache[text];

  return textBoundsCache ?
      textBoundsCache :
      styleCache[text] = opt_bounds ? opt_bounds : this.measure(text, style);
};


/**
 * Measure DOM text element.
 * @param {Element} element .
 * @param {string} text .
 * @param {Object} style .
 * @return {goog.math.Rect} .
 */
acgraph.vector.Renderer.prototype.getBBox = function(element, text, style) {
  return this.textBounds(text, style);
};


/**
 * Whether the cache contains bounds of passed text and style.
 * @param {string} text .
 * @param {Object} style .
 * @return {boolean} .
 */
acgraph.vector.Renderer.prototype.isInBoundsCache = function(text, style) {
  var boundsCache = this.textBoundsCache;
  var styleHash = this.getStyleHash(style);
  var styleCache = boundsCache[styleHash];

  return !!(styleCache && styleCache[text]);
};


/**
 * In this mode the result angle will visually correspond the original setting, non regarding browser scaling
 * duplication (so, for objects that do not have 1:1 proportion with the original figure, the gradient angle
 * will correspond to the initial value due to internal calculations).
 * @param {number} sourceAngle Source angle in degrees.
 * @param {!goog.math.Rect} bounds Bounds.
 * @return {number} Calculated angle in degrees.
 */
acgraph.vector.Renderer.prototype.saveGradientAngle = function(sourceAngle, bounds) {
  /** @type {number} */
  var largeSide;
  /** @type {number} */
  var smallerSide;
  /** @type {number} */
  var sideRatio;

  sourceAngle = goog.math.standardAngle(sourceAngle);

  // define proportions
  if (bounds.height == bounds.width) {
    return sourceAngle;
  } else if (bounds.height < bounds.width) {
    largeSide = bounds.width;
    smallerSide = bounds.height;
    sideRatio = smallerSide / largeSide;
  } else {
    largeSide = bounds.height;
    smallerSide = bounds.width;
    sideRatio = largeSide / smallerSide;
  }

  /**
   * Imagine a square, gradient line goes throigh the center (crossing of diagonal lines),
   * drop a perpendicular from the center to one of the sides, so this perpendicular line
   * and gradient line have an acute angle between them, so there is a right triangle.
   * We know the sourceAngle in this triangle and adjacent cathetus - b, we need to find opposite cathetus - a.
   * @type {number}
   */
  var b = largeSide / 2;
  /** @type {number} */
  var a = Math.tan(goog.math.toRadians(sourceAngle)) * b;

  /**
   * After we find the distance between the crossing of gradient line and side of a square and
   * the crossing of perpendicular and this side (greater side of the initial rectangle)
   * we extend the cathetus (multiply by sideRatio). In other words:
   * if in an initial rectangle the width is lesser than height, we need to extend b cathetus,
   * otherwise - a cathetus. And then we find the angle in a new triangle (with the extended side).
   * @type {number}
   */
  var targetAngle = goog.math.toDegrees(Math.atan(a / b * sideRatio));

  // transform angle depending on a quarter
  if ((sourceAngle > 90) && (sourceAngle <= 270)) { // 2 and 3 quarter
    targetAngle = 180 + targetAngle;
  } else if ((sourceAngle > 270) && (sourceAngle <= 360)) { // 4 quarter
    targetAngle = 360 + targetAngle;
  }

  return targetAngle % 360;
};


/**
 * Sets ID to DOM element.
 * @param {(!acgraph.vector.Element|!acgraph.vector.Stage)} element - Element.
 * @param {string} id - ID.
 */
acgraph.vector.Renderer.prototype.setId = goog.abstractMethod;


/**
 * Sets vector effect to DOM element.
 * @param {!acgraph.vector.Element} element - Element.
 * @param {boolean} disabled - isDisabled.
 */
acgraph.vector.Renderer.prototype.setDisableStrokeScaling = goog.abstractMethod;


/**
 * Sets visibility to DOM element.
 * @param {!acgraph.vector.Element} element Element.
 */
acgraph.vector.Renderer.prototype.setVisible = goog.abstractMethod;


/**
 * Sets title to DOM element.
 * @param {(!acgraph.vector.Element|!acgraph.vector.Stage)} element - Element.
 * @param {?string} title - Title value.
 */
acgraph.vector.Renderer.prototype.setTitle = goog.abstractMethod;


/**
 * Sets title to DOM element.
 * @param {(!acgraph.vector.Element|!acgraph.vector.Stage)} element - Element.
 * @param {?string} title - Title value.
 */
acgraph.vector.Renderer.prototype.setDesc = goog.abstractMethod;


/**
 * Sets attr to DOM element.
 * @param {!acgraph.vector.Element} element - Element.
 * @param {Object} value - Attributes key-value map. If value is null, attribute will be removed.
 */
acgraph.vector.Renderer.prototype.setAttributes = goog.abstractMethod;


/**
 * Gets attr from DOM element.
 * @param {?Element} element - Element or null. If null, must return undefined.
 * @param {string} key - Name of attribute.
 */
acgraph.vector.Renderer.prototype.getAttribute = goog.abstractMethod;


//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  Root DOM element for vector stage.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Create root DOM element for stage.
 * @return {Element} svg/vml element.
 */
acgraph.vector.Renderer.prototype.createStageElement = goog.abstractMethod;


/**
 * Sets DOM element size for stage. TODO:Params will be changed.
 * @param {Element} el DOM element.
 * @param {number|string} width Width.
 * @param {number|string} height Height.
 */
acgraph.vector.Renderer.prototype.setStageSize = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Defs.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates DOM element for Defs.
 * @return {Element} Defs.
 */
acgraph.vector.Renderer.prototype.createDefsElement = goog.abstractMethod;


/**
 * Creates DOM element of linear gradient.
 * @return {Element} DOM element.
 */
acgraph.vector.Renderer.prototype.createLinearGradientElement = goog.abstractMethod;


/**
 * Creates DOM element of radial gradient.
 * @return {Element} DOM element.
 */
acgraph.vector.Renderer.prototype.createRadialGradientElement = goog.abstractMethod;


//region --- Section Working with children ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Working with children
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Adds a child to a parent.
 * @param {Element} parent Parent.
 * @param {Element} child Child.
 */
acgraph.vector.Renderer.prototype.appendChild = function(parent, child) {
  goog.dom.appendChild(parent, child);
};


/**
 * Adds a child to a parent by index.
 * @param {Element} parent Parent.
 * @param {Element} child Child.
 * @param {number} index Index.
 */
acgraph.vector.Renderer.prototype.insertChildAt = function(parent, child, index) {
  goog.dom.insertChildAt(parent, child, index);
};


/**
 * Gets parent.
 * @param {Element} node Element.
 * @return {Element} Parent.
 */
acgraph.vector.Renderer.prototype.getParent = function(node) {
  return goog.dom.getParentElement(node);
};


/**
 * Removes a child from a parent.
 * @param {Element} element Element.
 */
acgraph.vector.Renderer.prototype.removeNode = function(element) {
  goog.dom.removeNode(element);
};
//endregion


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM elements for primitives.
//
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//  Layer.
//----------------------------------------------------------------------------------------------------------------------


/**
 * Creates DOM element of a layer.
 * @return {Element} Layer.
 */
acgraph.vector.Renderer.prototype.createLayerElement = goog.abstractMethod;


/**
 * Sets size to VML layer. Take layer values and calculate layer size
 * and position in parent.
 * @param {!acgraph.vector.Layer} layer Layer.
 */
acgraph.vector.Renderer.prototype.setLayerSize = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//  Rect.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates and returns DOM rectangle.
 * @return {Element} DOM rectangle.
 */
acgraph.vector.Renderer.prototype.createRectElement = goog.abstractMethod;


/**
 * Sets DOM rectangle parameters.
 * @param {!acgraph.vector.Rect} rect Rectangle.
 */
acgraph.vector.Renderer.prototype.setRectProperties = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------could
//  Circle.
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates and returns DOM circle.
 * @return {Element} DOM circle.
 */
acgraph.vector.Renderer.prototype.createCircleElement = goog.abstractMethod;


/**
 * Sets DOM circle parameters.
 * @param {!acgraph.vector.Circle} circle Circle.
 */
acgraph.vector.Renderer.prototype.setCircleProperties = goog.abstractMethod;


/**
 * Creates svg element - pattern.
 * @return {Element} Pattern.
 */
acgraph.vector.Renderer.prototype.createFillPatternElement = goog.abstractMethod;


/**
 * Set properties for element of fill pattern.
 * @param {!acgraph.vector.PatternFill} fill Fill.
 */
acgraph.vector.Renderer.prototype.setFillPatternProperties = goog.abstractMethod;


/**
 * Creates DOM image.
 * @return {Element} Image.
 */
acgraph.vector.Renderer.prototype.createImageElement = goog.abstractMethod;


/**
 * Set properties for the image DOM element.
 * @param {!acgraph.vector.Image} image Image object.
 */
acgraph.vector.Renderer.prototype.setImageProperties = goog.abstractMethod;


/**
 * Creates and returns DOM element for Text.
 * @return {Element} DOM Element.
 */
acgraph.vector.Renderer.prototype.createTextElement = goog.abstractMethod;


/**
 * Creates and returns DOM element for Text Segment.
 * @return {Element} Test Segment DOM Element.
 */
acgraph.vector.Renderer.prototype.createTextSegmentElement = goog.abstractMethod;


/**
 * Creates and returns additional DOM element for the text segment. It contains the text directly.
 * @param {string} text Text.
 * @return {Element|Text} Text Node DOM Element.
 */
acgraph.vector.Renderer.prototype.createTextNode = goog.abstractMethod;


/**
 * Set text position.
 * @param {!acgraph.vector.Text}  element Text element.
 */
acgraph.vector.Renderer.prototype.setTextPosition = goog.abstractMethod;


/**
 * Set the properties of the text.
 * @param {!acgraph.vector.Text} element Text element.
 */
acgraph.vector.Renderer.prototype.setTextProperties = goog.abstractMethod;


/**
 * Set text segment position.
 * @param {!acgraph.vector.TextSegment}  element Text element.
 */
acgraph.vector.Renderer.prototype.setTextSegmentPosition = goog.abstractMethod;


/**
 * Set the properties of the text segment.
 * @param {!acgraph.vector.TextSegment} textSegment Text segment element.
 */
acgraph.vector.Renderer.prototype.setTextSegmentProperties = goog.abstractMethod;


/**
 * Sets the cursor properties to the primitive DOM element. If cursor is null - cursor properties will be removed from
 * dom element style.
 * @param {!acgraph.vector.Element} element - Element.
 * @param {?acgraph.vector.Cursor} cursor - Cursor type.
 */
acgraph.vector.Renderer.prototype.setCursorProperties = goog.abstractMethod;


/**
 * For VML texts needs some another approach for calc text segments position. It's be notify that need or not
 * use another logic.
 * @return {boolean} to be or not to be.
 */
acgraph.vector.Renderer.prototype.needsAnotherBehaviourForCalcText = function() {
  return false;
};


/**
 * Creates and returns DOM path.
 * @return {Element} Path.
 */
acgraph.vector.Renderer.prototype.createPathElement = goog.abstractMethod;


/**
 * Applies Path properties to DOM path.
 * @param {!acgraph.vector.PathBase} path Path.
 */
acgraph.vector.Renderer.prototype.setPathProperties = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//  Ellipse
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates and returns DOM ellipse.
 * @return {Element} Ellipse.
 */
acgraph.vector.Renderer.prototype.createEllipseElement = goog.abstractMethod;


/**
 * Sets parameter to DOM ellipse.
 * @param {!acgraph.vector.Ellipse} ellipse Ellipse.
 */
acgraph.vector.Renderer.prototype.setEllipseProperties = goog.abstractMethod;


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets fill setting to DOM element.
 * @param {!acgraph.vector.Shape} element Element.
 */
acgraph.vector.Renderer.prototype.applyFill = goog.abstractMethod;


/**
 * Sets stroke settings to DOM element.
 * @param {!acgraph.vector.Shape} element Element.
 */
acgraph.vector.Renderer.prototype.applyStroke = goog.abstractMethod;


/**
 * Sets fill and stroke to DOM element.
 * @param {!acgraph.vector.Shape} element Element.
 */
acgraph.vector.Renderer.prototype.applyFillAndStroke = goog.abstractMethod;


/**
 * Load image state getter.
 * @return {boolean} .
 */
acgraph.vector.Renderer.prototype.isImageLoading = function() {
  return false;
};


/**
 * Image loader getter.
 * @return {goog.net.ImageLoader} .
 */
acgraph.vector.Renderer.prototype.getImageLoader = function() {
  if (!this.imageLoader_)
    this.imageLoader_ = new goog.net.ImageLoader(/** @type {Element} */(goog.global['document']['body']));
  return this.imageLoader_;
};


//region --- Section Transformations ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Transformations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets transformation to DOM element.
 * @param {!acgraph.vector.Element} element Element.
 */
acgraph.vector.Renderer.prototype.setTransformation = goog.abstractMethod;


/**
 * Sets transofrmatin to DOM path.
 * @param {!acgraph.vector.PathBase} element Element.
 */
acgraph.vector.Renderer.prototype.setPathTransformation = goog.abstractMethod;


/**
 * Sets transformation to DOM image.
 * @param {!acgraph.vector.Image} element Element.
 */
acgraph.vector.Renderer.prototype.setImageTransformation = goog.abstractMethod;


/**
 * Sets transformation to DOM Rect.
 * @param {!acgraph.vector.Rect} element Element.
 */
acgraph.vector.Renderer.prototype.setRectTransformation = goog.abstractMethod;


/**
 * Sets transformation to DOM Ellipse.
 * @param {!acgraph.vector.Ellipse} element Element.
 */
acgraph.vector.Renderer.prototype.setEllipseTransformation = goog.abstractMethod;


/**
 * Sets transformation to DOM Layer.
 * @param {!acgraph.vector.Layer} element Element.
 */
acgraph.vector.Renderer.prototype.setLayerTransformation = goog.abstractMethod;


/**
 * Sets transformation to DOM Text.
 * @param {!acgraph.vector.Text} element Element.
 */
acgraph.vector.Renderer.prototype.setTextTransformation = goog.abstractMethod;


/**
 * Sets transformation to DOM pattern fill.
 * @param {!acgraph.vector.PatternFill} element Element.
 */
acgraph.vector.Renderer.prototype.setPatternTransformation = goog.abstractMethod;


/**
 * Tells element if it needs to rerender transformation if parent transformation has changed.
 * @return {boolean} Rerender or not.
 */
acgraph.vector.Renderer.prototype.needsReRenderOnParentTransformationChange = function() {
  return false;
};


//endregion
//region --- Section Clip ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Clip
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates clipping rectangle DOM, if it is applicable for this renderer.
 * @return {!Element} Clip element.
 */
acgraph.vector.Renderer.prototype.createClipElement = goog.abstractMethod;


/**
 * Sets the pointer events property to element.
 * @param {!acgraph.vector.Element} element Primitive.
 */
acgraph.vector.Renderer.prototype.setPointerEvents = goog.abstractMethod;


/**
 * Sets clipping to element.
 * @param {!acgraph.vector.Element} element Element.
 */
acgraph.vector.Renderer.prototype.setClip = goog.abstractMethod;


/**
 * Sets layer clipping.
 * @param {!acgraph.vector.Element} element Element.
 */
acgraph.vector.Renderer.prototype.setLayerClip = goog.abstractMethod;


/**
 * Tells element if it needs to rerender clipping if parent bounds has changed.
 * @return {boolean} Rerender or not.
 */
acgraph.vector.Renderer.prototype.needsReClipOnBoundsChange = function() {
  return false;
};
//endregion
