goog.provide('acgraph.vector.UnmanagedLayer');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Element');



/**
 @constructor
 @param {string|Element=} opt_content Layer content.
 @extends {acgraph.vector.Element}
 */
acgraph.vector.UnmanagedLayer = function(opt_content) {
  goog.base(this);

  /**
   * @type {string|Element}
   * @private
   */
  this.content_ = goog.isDef(opt_content) ? opt_content : '';
};
goog.inherits(acgraph.vector.UnmanagedLayer, acgraph.vector.Element);


/** @inheritDoc */
acgraph.vector.UnmanagedLayer.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.UNMANAGEABLE_LAYER;
};


//----------------------------------------------------------------------------------------------------------------------
//  States
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states mask. Element can handle missing DOM element
 * and its visibility.
 * @type {number}
 */
acgraph.vector.UnmanagedLayer.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES |
    acgraph.vector.Element.DirtyState.DATA;


/**
 * Inner content.
 * @param {string|Element=} opt_value
 * @return {acgraph.vector.UnmanagedLayer|Element|string}
 */
acgraph.vector.UnmanagedLayer.prototype.content = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.content_) {
      this.content_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    }
    return this;
  }
  return this.content_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//---------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.UnmanagedLayer.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createLayerElement();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.UnmanagedLayer.prototype.renderInternal = function() {
  goog.base(this, 'renderInternal');

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    var domelement = this.domElement();
    goog.dom.removeChildren(domelement);
    if (goog.isString(this.content_)) {
      domelement.innerHTML = this.content_;
    } else {
      goog.dom.appendChild(domelement, this.content_);
    }

    this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
  }
};


/** @inheritDoc */
acgraph.vector.UnmanagedLayer.prototype.getBoundsWithoutTransform = function() {
  return acgraph.getRenderer().measureElement(this.content_);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.UnmanagedLayer.prototype.deserialize = function(data) {
  if ('content' in data)
    this.content(data['content']);

  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.UnmanagedLayer.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');

  data['content'] = goog.isString(this.content_) ? this.content_ : this.content_.outerHTML;

  return data;
};


//exports
(function() {
  var proto = acgraph.vector.UnmanagedLayer.prototype;
  proto['content'] = proto.content;
})();


