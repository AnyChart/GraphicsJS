goog.provide('acgraph.vector.SimpleText');

goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Element');
goog.require('goog.math.Rect');



/**
 Text class.<br>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#text} or
 {@link acgraph.vector.Layer#text} to create layer or stage bound text.
 <br/> Use {@link acgraph.text} to create unbound text.
 @see acgraph.vector.Stage#text
 @see acgraph.vector.Layer#text
 @see acgraph.text
 @name acgraph.vector.SimpleText
 @constructor
 @extends {acgraph.vector.Element}
 */
acgraph.vector.SimpleText = function() {
  /**
   * Element bounds.
   * acgraph.vector.Element.DirtyState.DATA must be set with any changes.
   * @type {goog.math.Rect}
   * @protected
   */
  this.bounds = new goog.math.Rect(0, 0, 0, 0);

  goog.base(this);
};
goog.inherits(acgraph.vector.SimpleText, acgraph.vector.Element);


/**
 * Text.
 * @type {?string}
 * @private
 */
acgraph.vector.SimpleText.prototype.text_ = null;


/**
 * Supported states. Inherited from Element and text data added.
 * @type {number}
 */
acgraph.vector.SimpleText.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES |
    acgraph.vector.Element.DirtyState.DATA;


/** @inheritDoc */
acgraph.vector.SimpleText.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.SIMPLE_TEXT;
};


/** @inheritDoc */
acgraph.vector.SimpleText.prototype.getBoundsWithoutTransform = function() {
  return this.bounds.clone();
};


/** @inheritDoc */
acgraph.vector.SimpleText.prototype.getBoundsWithTransform = acgraph.vector.SimpleText.prototype.getBoundsWithoutTransform;


/**
 Get current text.
 @param {string=} opt_value .
 @return {string|acgraph.vector.SimpleText} .
 */
acgraph.vector.SimpleText.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.text_) {
      this.text_ = String(opt_value);
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) this.getStage().suspend();
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      if (!stageSuspended) this.getStage().resume();
    }
    return this;
  }
  return this.text_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.SimpleText.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createTextElement();
};


/** @inheritDoc */
acgraph.vector.SimpleText.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    acgraph.getRenderer().setTextData(this);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }

  goog.base(this, 'renderInternal');
};


/** @inheritDoc */
acgraph.vector.SimpleText.prototype.renderTransformation = function() {
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


//exports
(function() {
  var proto = acgraph.vector.SimpleText.prototype;
  proto['text'] = proto.text;
  goog.exportSymbol('acgraph.vector.SimpleText', acgraph.vector.SimpleText);
})();
