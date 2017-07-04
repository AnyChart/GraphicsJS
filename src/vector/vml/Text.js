goog.provide('acgraph.vector.vml.Text');
goog.require('acgraph.vector.Text');
goog.require('goog.math.Rect');



/**
 * A class for text formatting. Processes plain text and HTML text.
 * Plain text is set using the <b>setText</b> method {@link acgraph.vector.Text#text}.
 * HTML text is set using the <b>setHtml</b> method {@link acgraph.vector.Text#htmlText}.
 * A text style is set using the <b>setStyle</b> method {@link acgraph.vector.Text#style}.
 * @param {number=} opt_x The X-coordinate (left) of the top-left corner of the text bounds.
 * @param {number=} opt_y The Y-coordinate (top) of the top-left corner of the text bounds.
 * @constructor
 * @extends {acgraph.vector.Text}
 */
acgraph.vector.vml.Text = function(opt_x, opt_y) {
  goog.base(this, opt_x, opt_y);

  /**
   * If text is simple (does not have the <b>transformation</b> or <b>text overflow</b> properties), it will be used for text rendering.
   * A carriage return character is replaced with a corresponding HTML tag.
   * @type {?string}
   * @private
   */
  this.simpleText_ = null;

  /**
   * Defines text complexity. A text is complex if it has the <b>transformation</b> or the <b>text overflow</b> property.
   * @type {boolean}
   * @private
   */
  this.isComplex_ = false;

  /**
   * Transformation cache.
   * @type {goog.math.AffineTransform}
   */
  this.transformationCache = null;
};
goog.inherits(acgraph.vector.vml.Text, acgraph.vector.Text);


/**
 * Used only to transform text in VML
 * @type {Element}
 */
acgraph.vector.Element.prototype.skew;


/**
 * Returns simple text.
 * @return {?string} Simple text.
 */
acgraph.vector.vml.Text.prototype.getSimpleText = function() {
  return this.simpleText_;
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.textOverflow = function(opt_value) {
  if (opt_value) this.isComplex_ = true;
  return goog.base(this, 'textOverflow', opt_value);
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.opacity = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value !== this.style()['opacity']) {
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) this.getStage().suspend();
      this.style()['opacity'] = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.transformAfterChange();
      if (!stageSuspended) this.getStage().resume();
    }
    return this;
  }
  return this.style()['opacity'];
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.color = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (opt_value !== this.style()['color']) {
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) this.getStage().suspend();
      this.style()['color'] = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.transformAfterChange();
      if (!stageSuspended) this.getStage().resume();
    }
    return this;
  }
  return this.style()['color'];
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.transformAfterChange = function() {
  if (acgraph.getRenderer().needsReRenderOnParentTransformationChange()) {
    var tx = this.getFullTransformation();
    if (tx && !tx.isIdentity()) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
      this.transformationCache = null;
    }
  }
};


/**
 * If the Scale and Shear components of a transformation correspond with the values of this components in a unitary matrix,
 * for VML text it is a "simple" transformation. In other words, if there is only Translate in a matrix, this matrix is "simple"
 * for a VML text (because in VML Translate is carried out without a matrix,
 * but with the <b>left<b> and <b>top<b> style parameters).
 * @private
 * @return {boolean} Indicates whether the text is simple or not.
 */
acgraph.vector.vml.Text.prototype.isSimpleTransformation_ = function() {
  var tx = this.getFullTransformation();
  return !tx || (!!tx && tx.getScaleX() == 1 && tx.getShearX() == 0 && tx.getShearY() == 0 && tx.getScaleY() == 1);
};


/**
 * Checks text complexity.
 * @return {boolean} Indicates whether the text is simple or not.
 */
acgraph.vector.vml.Text.prototype.isComplex = function() {
  return !this.isSimpleTransformation_() || !!this.textOverflow();
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.getBoundsWithTransform = function(transform) {
  this.isComplex_ = this.isComplex();
  return goog.base(this, 'getBoundsWithTransform', transform);
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.render = function() {
  goog.base(this, 'render');
  if (this.isScaleOrShearChanged() || this.textOverflow()) acgraph.getRenderer().textEarsFeint(this);
  return this;
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.renderTextPath = function() {
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.renderPosition = function() {
  if (this.isComplex_) {
    goog.base(this, 'renderPosition');
  } else {
    acgraph.getRenderer().setTextPosition(this);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.POSITION);
  }
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.renderData = function() {
  if (this.isComplex_) {
    goog.base(this, 'renderData');
  } else {
    this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.textDefragmentation = function() {
  if (this.isComplex_) {
    goog.base(this, 'textDefragmentation');
  } else {
    if (goog.isDefAndNotNull(this.direction()))
      this.rtl = this.direction() == acgraph.vector.Text.Direction.RTL;
    var text = /** @type {string} */ (this.text());
    if (!this.isHtml() && this.text() != null) this.simpleText_ = goog.string.newLineToBr(text);
    else this.simpleText_ = text;
    this.bounds = this.getTextBounds(/** @type {string} */ (this.simpleText_), {});
  }
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.getTextBounds = function(text, segmentStyle) {
  if (this.isComplex_) {
    return goog.base(this, 'getTextBounds', text, segmentStyle);
  } else {
    var bounds = acgraph.getRenderer().measuringSimpleText(text, segmentStyle, this.style());
    bounds.left = this.x();
    bounds.top = this.y();
    this.realHeight = bounds.height;
    if (this.height()) bounds.height = this.height();
    return bounds;
  }
};


/**
 * Checks whether the Scale and Shear components of a transformation are changed. If not, returns "false".
 * If one of these components are changed, it is necessary to redefine the values of skew nodes for each shape in the text,
 * which is quite performance demanding.
 * @return {boolean} Indicates whether the Scale or Shear component are changed or not.
 */
acgraph.vector.vml.Text.prototype.isScaleOrShearChanged = function() {
  var changed;
  var txCache = this.transformationCache;
  var tx = this.getFullTransformation();

  if (goog.isNull(txCache) && goog.isNull(tx)) changed = false;
  else if (goog.isNull(txCache) || goog.isNull(tx)) changed = true;
  else changed = !(tx.getScaleX() == txCache.getScaleX() &&
        tx.getShearX() == txCache.getShearX() &&
        tx.getShearY() == txCache.getShearY() &&
        tx.getScaleY() == txCache.getScaleY());

  return changed;
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.beforeTransformationChanged = function() {
  var tx = this.getFullTransformation();
  if (tx && !(this.hasDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION) ||
      this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION)))
    this.transformationCache = tx.clone();
};


/**
 *
 * @private
 */
acgraph.vector.vml.Text.prototype.transformationChanged_ = function() {
  var complexityCache = this.isComplex_;
  this.isComplex_ = this.isComplex();
  var switchToComplexity = !complexityCache && this.isComplex_;
  var switchToSimple = complexityCache && !this.isComplex_;

  var stageSuspended = !this.getStage() || this.getStage().isSuspended();
  if (!stageSuspended) this.getStage().suspend();
  if (switchToComplexity) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.bounds = new goog.math.Rect(/** @type {number} */ (this.x()), /** @type {number} */ (this.y()), this.width_, this.height_);
  } else if (switchToSimple) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.bounds = this.getTextBounds(/** @type {string} */ (this.simpleText_), {});
  }
  if (!stageSuspended) this.getStage().resume();
  //acgraph.getRenderer().textEarsFeint(this);
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.parentTransformationChanged = function() {
  goog.base(this, 'parentTransformationChanged');
  this.transformationChanged_();
};


/** @inheritDoc */
acgraph.vector.vml.Text.prototype.transformationChanged = function() {
  goog.base(this, 'transformationChanged');
  this.transformationChanged_();

  //this mess needs to be refactored
  if (acgraph.vector.vml.Renderer.IE8_MODE && this.isScaleOrShearChanged()) {
    var stageSuspended = !this.getStage() || this.getStage().isSuspended();
    if (!stageSuspended) this.getStage().suspend();
    this.defragmented = false;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.transformAfterChange();
    if (!stageSuspended) this.getStage().resume();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.vml.Text.prototype.disposeInternal = function() {
  delete this.transformationCache;
  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.vml.Text.prototype;
  proto['color'] = proto.color;
  proto['opacity'] = proto.opacity;
  proto['textOverflow'] = proto.textOverflow;
})();
