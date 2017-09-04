goog.provide('acgraph.vector.PatternFill');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Layer');



/**
 Pattern fill class.<br/>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.patternFill}.
 @param {goog.math.Rect} bounds Bounds of the pattern. Defines size and offset of the pattern.
 @see acgraph.patternFill
 @name acgraph.vector.PatternFill
 @constructor
 @extends {acgraph.vector.Layer}
 */
acgraph.vector.PatternFill = function(bounds) {
  /**
   * Bounds of pattern. Defines size and offset of pattern.
   * @type {goog.math.Rect}
   * @protected
   */
  this.bounds = bounds;

  /**
   * Defines has been rendered fill pattern or not.
   * @type {boolean}
   */
  this.rendered = false;

  goog.base(this);
};
goog.inherits(acgraph.vector.PatternFill, acgraph.vector.Layer);


/**
 * Supported dirty states.
 * @type {number}
 */
acgraph.vector.PatternFill.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.DirtyState.DOM_MISSING |
        acgraph.vector.Element.DirtyState.TRANSFORMATION |
        acgraph.vector.Element.DirtyState.ID |
        acgraph.vector.Element.DirtyState.CHILDREN |
        acgraph.vector.Element.DirtyState.CHILDREN_SET |
        acgraph.vector.Element.DirtyState.DATA;


//----------------------------------------------------------------------------------------------------------------------
//
//  Type prefix
//
//----------------------------------------------------------------------------------------------------------------------


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.FILL_PATTERN;
};


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value)
      this.setParent(opt_value);
    else
      this.remove();
    return this;
  }
  return goog.base(this, 'parent');
};


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.getBoundsWithoutTransform = function() {
  return this.bounds.clone();
};


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createFillPatternElement();
};


/**
 * Applies fill pattern properties to own element DOM.
 * @protected
 */
acgraph.vector.PatternFill.prototype.renderData = function() {
  // Set attributes to DOM element
  acgraph.getRenderer().setFillPatternProperties(this);
  // Clear DATA flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.renderInternal = function() {
  if (!this.rendered)
    goog.dom.appendChild(this.getStage().getDefs().domElement(), this.domElement());

  this.rendered = true;

  goog.base(this, 'renderInternal');
};


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.renderTransformation = function() {
  // Resolve transformation unsync
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION))
    acgraph.getRenderer().setPatternTransformation(this);
  // Remove unsync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.PatternFill.prototype.deserialize = function(data) {
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.PatternFill.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');

  var bounds = this.getBoundsWithoutTransform();
  data['type'] = 'pattern';
  data['bounds'] = bounds;

  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.PatternFill.prototype.disposeInternal = function() {
  goog.dom.removeNode(this.domElement());
  this.bounds_ = null;
  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.PatternFill.prototype;
  goog.exportSymbol('acgraph.vector.PatternFill', acgraph.vector.PatternFill);
  proto['addChild'] = proto.addChild;
  proto['dispose'] = proto.dispose;
})();
