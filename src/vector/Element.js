goog.provide('acgraph.vector.Element');
goog.provide('acgraph.vector.Element.DirtyState');

goog.require('acgraph.error');
goog.require('acgraph.events');
goog.require('acgraph.events.Dragger');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector');
goog.require('goog.events.EventTarget');
goog.require('goog.events.Listenable');
goog.require('goog.math.AffineTransform');
goog.require('goog.math.Rect');



/**
 <b>Abstract</b> class for all vector elements, such as groups and primitives.
 Due to the fact that this class is a child of from goog.events.EventTarget
 all its childs can work with events.<br/>
 <b>Never call a constructor directly!</b>
 @name acgraph.vector.Element
 @constructor
 @extends {goog.events.EventTarget}
 @implements {goog.events.Listenable}
 */
acgraph.vector.Element = function() {
  goog.base(this);

  /**
   * Defines whether element can be moved (drag) or not.
   * If it is True or instance of goog.math.Rect - element can be moved (draggable), otherwise - not.
   * @type {boolean|goog.math.Rect}
   * @private
   */
  this.draggable_ = false;

  /**
   *
   * @type {boolean}
   * @private
   */
  this.disableStrokeScaling_ = false;

  /**
   * Title element. A subnode.
   * @type {?Element}
   */
  this.titleElement = null;

  /**
   * Text of title.
   * @type {?string}
   * @private
   */
  this.titleVal_ = null;

  /**
   * Desc element. A subnode.
   * @type {?Element}
   */
  this.descElement = null;

  /**
   * Text of desc.
   * @type {?string}
   * @private
   */
  this.descVal_ = null;

  /**
   * Attributes list to be set.
   * @type {Object.<string, *>}
   * @private
   */
  this.attributes_ = {};

  // Set all supported sync flags in the beginning.
  this.setDirtyState(acgraph.vector.Element.DirtyState.ALL);
};
goog.inherits(acgraph.vector.Element, goog.events.EventTarget);


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sync state list. It is supposed that each state unsync
 * can be resolved by the element itself using render() method.
 * @enum {number}
 */
acgraph.vector.Element.DirtyState = {
  /**
   * DOM is not created, need to create it.
   */
  DOM_MISSING: 1 << 0,
  /**
   * Visibility settings has changed.
   */
  VISIBILITY: 1 << 1,
  /**
   * Transformation state has changed.
   */
  TRANSFORMATION: 1 << 2,
  /**
   * Fill must be refreshed.
   */
  FILL: 1 << 3,
  /**
   * Stroke must be refreshed.
   */
  STROKE: 1 << 4,
  /**
   * Element data has changed (i.e. X, Y or size).
   */
  DATA: 1 << 5,
  /**
   * Child elements have changed, need to refresh them.
   */
  CHILDREN: 1 << 6,
  /**
   * Child set has changed (added, removed, moved).
   */
  CHILDREN_SET: 1 << 7,
  /**
   * Parent transformation state has changed.
   */
  PARENT_TRANSFORMATION: 1 << 8,
  /**
   * Clipping rectangle state has changed.
   */
  CLIP: 1 << 9,
  /**
   * Need to update style.
   */
  STYLE: 1 << 10,
  /**
   * Need to update id.
   */
  ID: 1 << 11,
  /**
   * Need to update cursor.
   */
  CURSOR: 1 << 12,
  /**
   * Need to update pointer events property.
   */
  POINTER_EVENTS: 1 << 13,
  /**
   * Need to update position.
   */
  POSITION: 1 << 14,
  /**
   * Need to update position.
   */
  STROKE_SCALING: 1 << 15,
  /**
   * Needs to update the title.
   */
  TITLE: 1 << 16,
  /**
   * Needs to update the desc.
   */
  DESC: 1 << 17,
  /**
   * Needs to update attribute.
   */
  ATTRIBUTE: 1 << 18,
  /**
   * Need to update everything.
   */
  ALL: 0xFFFFFFFF
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Flag shows whether element is in rendering state.
 * @type {boolean}
 * @private
 */
acgraph.vector.Element.prototype.isRendering_ = false;


/**
 * Cursor type for element.
 * @type {?acgraph.vector.Cursor}
 * @private
 */
acgraph.vector.Element.prototype.cursor_ = null;


/**
 * Cache of parent cursor type.
 * @type {?acgraph.vector.Cursor}
 * @protected
 */
acgraph.vector.Element.prototype.parentCursor = null;


/**
 * DOM element, created while rendering using
 * {@link acgraph.vector.Element#createDomElement} method.
 * @type {Element}
 * @private
 */
acgraph.vector.Element.prototype.domElement_ = null;


/**
 * Parent group, in which DOM element we add DOM element of the given object.
 * Events will affect it too.
 * @type {acgraph.vector.ILayer}
 * @private
 */
acgraph.vector.Element.prototype.parent_ = null;


/**
 * Previous parent. Use to notify groups about removal of DOM element from a previous
 * layer. Cleared when layer is rendered.
 * @type {acgraph.vector.ILayer}
 * @private
 */
acgraph.vector.Element.prototype.prevParent_ = null;


/**
 * Visibility flag.
 * @type {boolean}
 * @private
 */
acgraph.vector.Element.prototype.visible_ = true;


/**
 * Events handler.
 * @type {goog.events.EventHandler}
 * @private
 */
acgraph.vector.Element.prototype.handler_;


/**
 * Clipping rectangle or clip instance.
 * @type {acgraph.vector.Clip}
 * @private
 */
acgraph.vector.Element.prototype.clipElement_ = null;


/**
 * Pointer events property. Specifies under what circumstances a given graphics element can be the target
 * element for a pointer event.
 * @type {boolean}
 * @private
 */
acgraph.vector.Element.prototype.diablePointerEvents_ = false;


/**
 * Element transformation.
 * @type {goog.math.AffineTransform}
 * @protected
 */
acgraph.vector.Element.prototype.transformation = null;


/**
 * Inverse transformation cache.
 * @type {goog.math.AffineTransform}
 * @private
 */
acgraph.vector.Element.prototype.inverseTransform_ = null;


/**
 * Full transformation cache.
 * @type {goog.math.AffineTransform}
 * @private
 */
acgraph.vector.Element.prototype.fullTransform_ = null;


/**
 * Full inverse transformation cache.
 * @type {goog.math.AffineTransform}
 * @private
 */
acgraph.vector.Element.prototype.fullInverseTransform_ = null;


/**
 * Element id (DOM element id attribute value).
 * @type {string|undefined}
 * @private
 */
acgraph.vector.Element.prototype.id_ = undefined;


/**
 * Z index of the element.
 * @type {number}
 * @private
 */
acgraph.vector.Element.prototype.zIndex_ = 0;


/**
 * An object, assosiated with this element.
 * @type {*}
 */
acgraph.vector.Element.prototype.tag;


//----------------------------------------------------------------------------------------------------------------------
//  States
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states mask. Element can handle missing DOM element
 * and its visibility.
 * @type {number}
 */
acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.DirtyState.DOM_MISSING |
    acgraph.vector.Element.DirtyState.VISIBILITY |
    acgraph.vector.Element.DirtyState.CURSOR |
    acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION |
    acgraph.vector.Element.DirtyState.TRANSFORMATION |
    acgraph.vector.Element.DirtyState.CLIP |
    acgraph.vector.Element.DirtyState.ID |
    acgraph.vector.Element.DirtyState.POINTER_EVENTS |
    acgraph.vector.Element.DirtyState.STROKE_SCALING |
    acgraph.vector.Element.DirtyState.TITLE |
    acgraph.vector.Element.DirtyState.DESC |
    acgraph.vector.Element.DirtyState.ATTRIBUTE;


/**
 * Comibination of {@link acgraph.vector.Element.DirtyState} flags that shows which part of an element
 * must be synced with a DOM representation. If flag is set then then element syns its DOM representation
 * on the next render() call. All flags are set initially.
 * Unsupported flag can't be set.
 * @type {number}
 * @private
 */
acgraph.vector.Element.prototype.dirtyState_ = 0;


//----------------------------------------------------------------------------------------------------------------------
//
//  Common.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Gets element identifier. If it was not set, it will be generated and applied to the DOM.
 @param {string=} opt_value Custom id.
 @return {(!acgraph.vector.Element|string)} Returns element identifier.
 */
acgraph.vector.Element.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var id = opt_value || '';
    if (this.id_ !== id) {
      this.id_ = id;
      this.setDirtyState(acgraph.vector.Element.DirtyState.ID);
    }
    return this;
  }
  if (!goog.isDef(this.id_))
    this.id(acgraph.utils.IdGenerator.getInstance().generateId(this));
  return /** @type {string} */(this.id_);
};


/**
 * Returns elemt type prefix.
 * Prefix is used to generate unique id in {@link acgraph.utils.IdGenerator}
 * and is used to distinguish element type by its id.
 * @return {acgraph.utils.IdGenerator.ElementTypePrefix} Element type prefix.
 */
acgraph.vector.Element.prototype.getElementTypePrefix = goog.abstractMethod;


/**
 Stage object (to which the given element is bound).
 @return {acgraph.vector.Stage} Stage object.
 */
acgraph.vector.Element.prototype.getStage = function() {
  var parent = this.parent();
  return (!!parent) ? parent.getStage() : null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Returns DOM element if element is rendered.<br/>
 In case of Stage in Suspended state or unbound element – null is returned.
 @return {Element} DOM element.
 */
acgraph.vector.Element.prototype.domElement = function() {
  return this.domElement_;
};


/**
 Returns the parent layer.
 @param {acgraph.vector.ILayer=} opt_value .
 @return {(acgraph.vector.ILayer|acgraph.vector.Element)} .
 */
acgraph.vector.Element.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value) {
      var stage = this.getStage();
      var stageChanged = (stage != null && stage != opt_value.getStage());
      (/** @type {acgraph.vector.ILayer} */(opt_value)).addChild(this);
      if (stageChanged)
        this.propagateVisualStatesToChildren_();
    }
    else
      this.remove();
    return this;
  }
  return (/** @type {acgraph.vector.ILayer} */(this.parent_));
};


/**
 * Propagates dirty state recursively to children.
 * @private
 */
acgraph.vector.Element.prototype.propagateVisualStatesToChildren_ = function() {
  var numChildren;
  var clip = this.clip();
  if (clip)
    clip.id(null);

  if (this.numChildren && (numChildren = this.numChildren())) {
    for (var i = 0; i < numChildren; i++) {
      var child = this.getChildAt(i);
      child.propagateVisualStatesToChildren_();
    }
    // in case of layer had clip in previous stage
    this.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
  } else {
    this.setDirtyState(acgraph.vector.Element.DirtyState.FILL |
        acgraph.vector.Element.DirtyState.STROKE |
        acgraph.vector.Element.DirtyState.CLIP);
  }
};


/**
 Whether parent element is set.
 @return {boolean} Whether parent element is set.
 */
acgraph.vector.Element.prototype.hasParent = function() {
  return !!(this.parent_);
};


/**
 Current element removes itself from the parent layer.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.remove = function() {
  if (this.hasParent())
    this.parent_.removeChild(this);
  return this;
};


/**
 * Returns the number of children.
 * @return {number} The number of children.
 */
acgraph.vector.Element.prototype.getFullChildrenCount = function() {
  return 0;
};


/**
 * Gets/sets element's title value.
 * @param {?string=} opt_value - Value to be set.
 * @return {(string|null|acgraph.vector.Element|undefined)} - Current value or itself for method chaining.
 */
acgraph.vector.Element.prototype.title = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleVal_ != opt_value) {
      this.titleVal_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.TITLE);
    }
    return this;
  }
  return this.titleVal_;
};


/**
 * Gets/sets element's desc value.
 * @param {?string=} opt_value - Value to be set.
 * @return {(string|null|acgraph.vector.Element|undefined)} - Current value or itself for method chaining.
 */
acgraph.vector.Element.prototype.desc = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.descVal_ != opt_value) {
      this.descVal_ = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.DESC);
    }
    return this;
  }
  return this.descVal_;
};


/**
 * Gets/sets attribute.
 * @param {string} key - Name of attribute.
 * @param {*=} opt_value - Value of attribute.
 * @return {acgraph.vector.Element|*} - Attribute value or itself for method chaining.
 */
acgraph.vector.Element.prototype.attr = function(key, opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.attributes_[key] !== opt_value) {
      this.attributes_[key] = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.ATTRIBUTE);
    }
    return this;
  }

  if (key in this.attributes_)
    return this.attributes_[key];
  else
    return acgraph.getRenderer().getAttribute(this.domElement_, key);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Cursor
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Getter for cursor type.
 @param {?acgraph.vector.Cursor=} opt_value .
 @return {(!acgraph.vector.Element|acgraph.vector.Cursor|null)} .
 */
acgraph.vector.Element.prototype.cursor = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.cursor_ = opt_value;
    this.cursorChanged();
    return this;
  }
  return this.cursor_;
};


/**
 * Notifies itself that its own cursor has been changed.
 */
acgraph.vector.Element.prototype.cursorChanged = function() {
  this.setDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};


/**
 * Notifies itself that parent cursor has been changed.
 */
acgraph.vector.Element.prototype.parentCursorChanged = function() {
  this.setDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Dirty state.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Checks if there is any unsync state.
 * @return {boolean} If there is any unsync state.
 */
acgraph.vector.Element.prototype.isDirty = function() {
  return !!this.dirtyState_;
};


/**
 * Checks if an element has the given sync state.
 * @param {acgraph.vector.Element.DirtyState} state State to be checked.
 * @return {boolean} If the element has the given sync state.
 */
acgraph.vector.Element.prototype.hasDirtyState = function(state) {
  return !!(this.dirtyState_ & state);
};


/**
 * Sets given combination of sync states to an element
 * {@link acgraph.vector.Element.DirtyState}. If element supports
 * at least one, it passes it to update all children.
 * @param {number} value States to be set.
 */
acgraph.vector.Element.prototype.setDirtyState = function(value) {
  value &= this.SUPPORTED_DIRTY_STATES;
  if (!!value/* && !!(this.dirtyState_ & value)*/) {
    this.dirtyState_ |= value;
    if (this.parent_)
      this.parent_.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
    var stage = this.getStage();
    if (stage && !stage.isSuspended() && !stage.isRendering() && !this.isRendering())
      this.render();
  }
};


/**
 * Clears the sync state.
 * @param {number} value State to clear.
 */
acgraph.vector.Element.prototype.clearDirtyState = function(value) {
  this.dirtyState_ &= ~value;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Internal DOM workflow.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Sets parent element.
 * @param {acgraph.vector.ILayer} value Parent group.
 * @return {!acgraph.vector.Element} Returns self for method chaining.
 */
acgraph.vector.Element.prototype.setParent = function(value) {
  if (!this.parent_ || this.parent_ != value) {
    if (this == value) {
      throw acgraph.error.getErrorMessage(acgraph.error.Code.PARENT_UNABLE_TO_BE_SET);
    }

    if (!this.prevParent_)
      this.prevParent_ = this.parent_;
    else if (this.prevParent_ == value)
      this.prevParent_ = null;

    this.parent_ = value;
    this.setParentEventTarget(/** @type {goog.events.EventTarget} */(value));
  }

  return this;
};


/**
 * Notifies previous parent about DOM removal (if there was a previous parent).
 * @param {boolean} doCry True, if the element should tell the previous parent to seek and remove itself from DOM cache.
 * @return {!acgraph.vector.Element} Self.
 */
acgraph.vector.Element.prototype.notifyPrevParent = function(doCry) {
  if (this.prevParent_) {
    if (doCry)
      this.prevParent_.notifyRemoved(this);
    this.prevParent_ = null;
  }
  if (this.isDisposed())
    this.finalizeDisposing();
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Transformations
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Invoked before applying a transformation.
 */
acgraph.vector.Element.prototype.beforeTransformationChanged = goog.nullFunction;


/**
 * Notifies itself that transformation state has changed. Can reset bounds cache in descendents.
 * @protected
 */
acgraph.vector.Element.prototype.transformationChanged = function() {
  this.inverseTransform_ = null;
  this.fullTransform_ = null;
  this.inverseFullTransform_ = null;
  this.dropBoundsCache();
  this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  if (acgraph.getRenderer().needsReClipOnBoundsChange()) {
    if (this.clipElement_)
      this.clipChanged();
    else if (this.parent_)
      this.parent_.childClipChanged();
  }
};


/**
 * Notifies itself that parent transformation state may be changed.
 * Can reset bounds cache in descendents.
 */
acgraph.vector.Element.prototype.parentTransformationChanged = function() {
  this.fullTransform_ = null;
  this.dropBoundsCache();
  if (acgraph.getRenderer().needsReRenderOnParentTransformationChange())
    this.setDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
  if (acgraph.getRenderer().needsReClipOnBoundsChange()) {
    if (this.clipElement_)
      this.clipChanged();
    else if (this.parent_)
      this.parent_.childClipChanged();
  }
};


/**
 * Returns inverted transformation.
 * @return {goog.math.AffineTransform} Transformation inversion.
 * @protected
 */
acgraph.vector.Element.prototype.getInverseTransform = function() {
  if (!this.inverseTransform_)
    this.inverseTransform_ = this.transformation ? this.transformation.createInverse() : null;
  return this.inverseTransform_;
};


/**
 * Returns self element transformation.
 * @return {goog.math.AffineTransform} Element transformation.
 */
acgraph.vector.Element.prototype.getSelfTransformation = function() {
  return this.transformation;
};


/**
 * Returns full transformation (self and parent transformations combined).
 * @return {goog.math.AffineTransform} Full transformation.
 */
acgraph.vector.Element.prototype.getFullTransformation = function() {
  if (!this.fullTransform_) {
    var parentFullTransformation = this.parent_ ?
        this.parent_.getFullTransformation() : null;
    this.fullTransform_ = acgraph.math.concatMatrixes(parentFullTransformation, this.transformation);
  }
  return this.fullTransform_;
};


/**
 * Returns inverted full transformation (self and parent transformations combined).
 * @return {goog.math.AffineTransform} Full transformation.
 */
acgraph.vector.Element.prototype.getInverseFullTransformation = function() {
  if (!this.inverseFullTransform_) {
    var tx = this.getFullTransformation();
    this.inverseFullTransform_ = tx ? tx.createInverse() : null;
  }
  return this.inverseFullTransform_;
};


/**
 Rotates a shape around the given rotation point.
 @param {number} degrees Rotation angle in degrees.
 @param {number=} opt_cx Rotation point X.
 @param {number=} opt_cy Rotation point Y.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.rotate = function(degrees, opt_cx, opt_cy) {
  this.beforeTransformationChanged();
  var rotation = goog.math.AffineTransform.getRotateInstance(goog.math.toRadians(degrees), opt_cx || 0, opt_cy || 0);
  if (this.transformation) {
    this.transformation.preConcatenate(rotation);
  } else
    this.transformation = rotation;
  this.transformationChanged();
  return this;
};


/**
 Rotates a shape around the given anchor.
 @param {number} degrees Rotation angle in degress.
 @param {(acgraph.vector.Anchor|string)=} opt_anchor Rotation anchor.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.rotateByAnchor = function(degrees, opt_anchor) {
  /** @type {Array.<number>} */
  var point = acgraph.vector.getCoordinateByAnchor(this.getBounds(),
      opt_anchor || acgraph.vector.Anchor.CENTER);
  return this.rotate(degrees, point[0], point[1]);
};


/**
 Rotates a shape around the given point.<br/>
 <b>Note:</b> See illustration at {@link acgraph.vector.Element#rotate}, the only difference
 between {@link acgraph.vector.Element#rotate} and this method is the fact
 that this method resets the current transformation, and {@link acgraph.vector.Element#rotate} adds rotation
 to the existing transformation.
 @param {number} degrees Rotation angle in degrees.
 @param {number=} opt_cx Rotation point X.
 @param {number=} opt_cy Rotation point Y.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.setRotation = function(degrees, opt_cx, opt_cy) {
  return this.rotate(degrees - this.getRotationAngle(), opt_cx, opt_cy);
};


/**
 Rotates a shape around the given anchor.<br/>
 <b>Note:</b> See illustration at {@link acgraph.vector.Element#rotateByAnchor}, the only difference
 between {@link acgraph.vector.Element#rotateByAnchor} and this method is the fact
 that this method resets the current transformation, and  and {@link acgraph.vector.Element#rotate} adds rotation
 to the existing transformation.
 @param {number} degrees Rotation angle in degrees.
 @param {(acgraph.vector.Anchor|string)=} opt_anchor Rotation anchor.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.setRotationByAnchor = function(degrees, opt_anchor) {
  return this.rotateByAnchor(degrees - this.getRotationAngle(), opt_anchor);
};


/**
 Moves a shape taking an account the current transformation.
 Movement happens in a shape coordinate system (not the coordinate system of the parent).
 @param {number} tx X movement amount.
 @param {number} ty Y movement amount.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.translate = function(tx, ty) {
  this.beforeTransformationChanged();
  if (this.transformation)
    this.transformation.translate(tx, ty);
  else
    this.transformation = goog.math.AffineTransform.getTranslateInstance(tx, ty);

  this.transformationChanged();
  return this;
};


/**
 Sets top left corner of a shape (transformation taken into account) in the coordinate system of the parent.<br/>
 <b>Note:</b> See illustration at {@link acgraph.vector.Element#translate}, the only difference
 between {@link acgraph.vector.Element#translate} and this method is the fact that
 that this method resets the current transformation, and  and {@link acgraph.vector.Element#translate} adds movement
 to the existing transformation.
 @param {number} x X coordinate.
 @param {number} y Y coordinate.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.setPosition = function(x, y) {
  var arr = [x, y, this.getX(), this.getY()];
  if (this.transformation)
    this.getInverseTransform().transform(arr, 0, arr, 0, 2);
  return this.translate(arr[0] - arr[2], arr[1] - arr[3]);
};


/**
 * Sets movement vector. Used when we need to set layer movement
 * and then populate it with other elements.
 * Temporary method for AnyChart v6 only. Must be refactored with all other transformation API.
 * @deprecated only for AnyChartHTML5.
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.setTranslation = function(x, y) {
  this.beforeTransformationChanged();
  if (this.transformation) {
    var oldX = this.transformation.getTranslateX();
    var oldY = this.transformation.getTranslateY();
    if (x == oldX && y == oldY)
      return this;
    this.transformation.preTranslate(x - oldX, y - oldY);
  } else
    this.transformation = goog.math.AffineTransform.getTranslateInstance(x, y);
  this.transformationChanged();
  return this;
};


/**
 Scales a shape. Scaling center is set in the coordinate system of the parent.
 @param {number} sx X scaling factor.
 @param {number} sy Y scaling factor.
 @param {number=} opt_cx Scaling point X.
 @param {number=} opt_cy Scaling point Y.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.scale = function(sx, sy, opt_cx, opt_cy) {
  this.beforeTransformationChanged();
  if (!this.transformation)
    this.transformation = new goog.math.AffineTransform();
  this.transformation.preScale(sx, sy);
  this.transformation.preTranslate((opt_cx || 0) * (1 - sx), (opt_cy || 0) * (1 - sy));
  this.transformationChanged();
  return this;
};


/**
 Scales a shape. Scaling center is set as an anchor.
 @param {number} sx X scaling factor.
 @param {number} sy Y scaling factor.
 @param {(acgraph.vector.Anchor|string)=} opt_anchor Scaling anchor point.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.scaleByAnchor = function(sx, sy, opt_anchor) {
  var point = acgraph.vector.getCoordinateByAnchor(this.getBounds(),
      opt_anchor || acgraph.vector.Anchor.CENTER);
  return this.scale(sx, sy, point[0], point[1]);
};


/**
 Combines the current transformation with the given transformation matrix.
 Combination is done via matrix multiplication (multiplication to the right).
 @param {number} m00 Scale X.
 @param {number} m10 Shear Y.
 @param {number} m01 Shear X.
 @param {number} m11 Scale Y.
 @param {number} m02 Translate X.
 @param {number} m12 Translate Y.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.appendTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.beforeTransformationChanged();
  if (this.transformation)
    this.transformation.concatenate(new goog.math.AffineTransform(m00, m10, m01, m11, m02, m12));
  else
    this.transformation = new goog.math.AffineTransform(m00, m10, m01, m11, m02, m12);
  this.transformationChanged();
  return this;
};


/**
 Sets transformation matrix.<br/>
 <b>Note:</b> See illustration at {@link acgraph.vector.Element#appendTransformationMatrix},
 the difference between {@link acgraph.vector.Element#appendTransformationMatrix} and this method
 is that {@link acgraph.vector.Element#appendTransformationMatrix} combined transformation with
 the current, and this method resets the current.
 @param {number} m00 Scale X.
 @param {number} m10 Shear Y.
 @param {number} m01 Shear X.
 @param {number} m11 Scale Y.
 @param {number} m02 Translate X.
 @param {number} m12 Translate Y.
 @return {!acgraph.vector.Element} {@link acgraph.vector.Element} instance for method chaining.
 */
acgraph.vector.Element.prototype.setTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.beforeTransformationChanged();
  if (this.transformation)
    this.transformation.setTransform(m00, m10, m01, m11, m02, m12);
  else
    this.transformation = new goog.math.AffineTransform(m00, m10, m01, m11, m02, m12);
  this.transformationChanged();
  return this;
};


/**
 Returns the current rotation angle in degrees.
 @return {number} Rotation angle.
 */
acgraph.vector.Element.prototype.getRotationAngle = function() {
  return acgraph.math.getRotationAngle(this.transformation);
};


/**
 Returns the current transformation matrix as an array of six elements:<br>
 [<br>
 &nbsp;&nbsp;{number} m00 Scale X.<br>
 &nbsp;&nbsp;{number} m10 Shear Y.<br>
 &nbsp;&nbsp;{number} m01 Shear X.<br>
 &nbsp;&nbsp;{number} m11 Scale Y.<br>
 &nbsp;&nbsp;{number} m02 Translate X.<br>
 &nbsp;&nbsp;{number} m12 Translate Y.<br>
 ]
 @return {Array.<number>} Transformation matrix array.
 */
acgraph.vector.Element.prototype.getTransformationMatrix = function() {
  if (this.transformation)
    return [
      this.transformation.getScaleX(),
      this.transformation.getShearY(),
      this.transformation.getShearX(),
      this.transformation.getScaleY(),
      this.transformation.getTranslateX(),
      this.transformation.getTranslateY()
    ];
  else
    return [1, 0, 0, 1, 0, 0];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Asks for DOM change, calls {@link acgraph.vector.Element#createDomInternal} to create
 * DOM element and sets it to {@link acgraph.vector.Element#domElement}.
 * This method must be overloaded if you need more than one DOM operation to creat a DOM element.
 * Even if you only want to define which DOM must be used - you need to overload.
 * {@link acgraph.vector.Element#createDomInternal}.
 * @param {boolean=} opt_force .
 * @protected
 */
acgraph.vector.Element.prototype.createDom = function(opt_force) {
  var stage = this.getStage();
  if (stage && stage.acquireDomChange(acgraph.vector.Stage.DomChangeType.ELEMENT_CREATE) || opt_force) {
    this.domElement_ = this.createDomInternal();
    acgraph.register(this);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING);
  }
};


/**
 * Creates a DOM and returns it.
 * This method must be overloaded if any real DOM element must be created for a descendant (which means
 * for all descendants except a logical group).
 * @return {Element} DOM element.
 * @protected
 */
acgraph.vector.Element.prototype.createDomInternal = function() {
  return null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Checks element rendering status.
 * @return {boolean} rendering status.
 */
acgraph.vector.Element.prototype.isRendering = function() {
  return this.isRendering_;
};


/**
 * Renders and element, resolving all DirtyState conflicts.
 * Recurring calls might be needed to finish rendering (if process hits
 * DOM operations limit), but method must resolve and clear all states.
 * @return {!acgraph.vector.Element} Returns self for method chaining.
 */
acgraph.vector.Element.prototype.render = function() {
  this.isRendering_ = true;
  if (this.isDisposed()) return this;
  // Check if we have a reference to a stage. If this fails - stop rendering and exit.
  var stage = this.getStage();
  if (!stage)
    return this;
  // Check if the DOM element is created
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING)) {
    // try to create, if there is no element
    this.createDom();
    // if we can't do this - exit
    if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING))
      return this;

    if (this.draggable_)
      this.drag(this.draggable_);
  }

  this.renderInternal();

  this.isRendering_ = false;
  return this;
};


/**
 * Renders element properties supposing DOM is created.
 * @protected
 */
acgraph.vector.Element.prototype.renderInternal = function() {
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.ATTRIBUTE))
    this.renderAttributes();

  // We suppose that Stage already exists.
  // If visibility has changed - update it
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.VISIBILITY))
    this.renderVisibility();
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CURSOR))
    this.renderCursor();
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.POINTER_EVENTS))
    this.renderPointerEvents();
  // If transformation has changed - update it
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION) ||
      this.hasDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION)) {
    this.renderTransformation();
  }
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CLIP))
    this.renderClip();

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.STROKE_SCALING)) {
    acgraph.getRenderer().setDisableStrokeScaling(this, this.disableStrokeScaling_);
    this.clearDirtyState(acgraph.vector.Element.DirtyState.STROKE_SCALING);
  }

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TITLE))
    this.renderTitle();

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DESC))
    this.renderDesc();

  // Set element id
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.ID)) {
    this.renderId();
  }
};


/**
 * Renders Id.
 * @protected
 */
acgraph.vector.Element.prototype.renderId = function() {
  acgraph.getRenderer().setId(this, this.id_ || '');
  this.clearDirtyState(acgraph.vector.Element.DirtyState.ID);
};


/**
 * Applies visibility to the DOM element.
 * @protected
 */
acgraph.vector.Element.prototype.renderVisibility = function() {
  // Resolve visibility state
  acgraph.getRenderer().setVisible(this);
  // Set sync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.VISIBILITY);
};


/**
 * Applies transformation to the DOM element.
 * @protected
 */
acgraph.vector.Element.prototype.renderTransformation = function() {
  // Resolve transformation state
  acgraph.getRenderer().setTransformation(this);

  // Set sync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


/**
 * Applies pointer events property to the DOM element.
 */
acgraph.vector.Element.prototype.renderPointerEvents = function() {
  // Resolve events state
  acgraph.getRenderer().setPointerEvents(this);
  // Set sync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.POINTER_EVENTS);
};


/**
 * Applies clipping to the DOM element.
 * @protected
 */
acgraph.vector.Element.prototype.renderClip = function() {
  acgraph.getRenderer().setClip(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CLIP);
};


/**
 * Applies cursor setting to the DOM element.
 * @protected
 */
acgraph.vector.Element.prototype.renderCursor = function() {
  acgraph.getRenderer().setCursorProperties(this, this.cursor_ || this.parentCursor);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};


/**
 * Applies title value.
 * @protected
 */
acgraph.vector.Element.prototype.renderTitle = function() {
  acgraph.getRenderer().setTitle(this, this.titleVal_);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TITLE);
};


/**
 * Applies desc value.
 * @protected
 */
acgraph.vector.Element.prototype.renderDesc = function() {
  acgraph.getRenderer().setDesc(this, this.descVal_);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DESC);
};


/**
 * Applies attributes.
 * @protected
 */
acgraph.vector.Element.prototype.renderAttributes = function() {
  acgraph.getRenderer().setAttributes(this, this.attributes_);
  this.attributes_ = {};
  this.clearDirtyState(acgraph.vector.Element.DirtyState.ATTRIBUTE);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Events handling
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Overloads {@link goog.events.EventTarget#setParentEventTarget} so it throw exception
 * if value is not a parent.
 * @param {goog.events.EventTarget} value Parent element.
 */
acgraph.vector.Element.prototype.setParentEventTarget = function(value) {
  if (this.parent_ && /** @type {Object} */(this.parent_) !== /** @type {Object} */(value)) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.PARENT_UNABLE_TO_BE_SET);
  }

  goog.base(this, 'setParentEventTarget', value);
};


/**
 * Specifies under what circumstances a given graphics element can be a target element for a pointer event.
 * @param {boolean=} opt_value Pointer events property value.
 * @return {acgraph.vector.Element|boolean} If opt_value defined then returns Element object for chaining else
 * returns property value.
 */
acgraph.vector.Element.prototype.disablePointerEvents = function(opt_value) {
  if (!goog.isDef(opt_value)) return this.diablePointerEvents_;
  this.diablePointerEvents_ = !!(opt_value);
  this.setDirtyState(acgraph.vector.Element.DirtyState.POINTER_EVENTS);
  return this;
};


/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
acgraph.vector.Element.prototype.dispatchEvent = function(e) {
  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = e.toLowerCase();
  } else if ('type' in e) {
    e.type = String(e.type).toLowerCase();
  }
  return goog.base(this, 'dispatchEvent', e);
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
acgraph.vector.Element.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return /** @type {!goog.events.ListenableKey} */(goog.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
acgraph.vector.Element.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return /** @type {!goog.events.ListenableKey} */(goog.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
acgraph.vector.Element.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
acgraph.vector.Element.prototype.unlistenByKey;


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
acgraph.vector.Element.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return goog.base(this, 'removeAllListeners', opt_type);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  zIndex
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Gets and sets element's zIndex.
 * @param {number=} opt_value Z index to set.
 * @return {number|acgraph.vector.Element} Z index or itself for chaining.
 */
acgraph.vector.Element.prototype.zIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = +opt_value || 0;
    if (this.zIndex_ != val) {
      this.zIndex_ = val;
      if (this.parent_) // element can't change its own zIndex - parent children set changes.
        this.parent_.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
    }
    return this;
  }
  return this.zIndex_ || 0;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Visibility
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Gets/sets the current visibility flag.
 @param {boolean=} opt_isVisible .
 @return {!acgraph.vector.Element|boolean} .
 */
acgraph.vector.Element.prototype.visible = function(opt_isVisible) {
  if (arguments.length == 0) return this.visible_;
  if (this.visible_ != opt_isVisible) {
    this.visible_ = goog.isDefAndNotNull(opt_isVisible) ? opt_isVisible : true;
    // If visibility has changed - set sync flag
    this.setDirtyState(acgraph.vector.Element.DirtyState.VISIBILITY);
  }
  return this;
};


/**
 * Gets and sets element's vector effect property.
 * @param {boolean=} opt_value Vector effect property to set.
 * @return {boolean|acgraph.vector.Element} Vector effect property or itself for chaining.
 */
acgraph.vector.Element.prototype.disableStrokeScaling = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = !!opt_value;
    if (this.disableStrokeScaling_ != opt_value) {
      this.disableStrokeScaling_ = goog.isDefAndNotNull(opt_value) ? opt_value : true;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE_SCALING);
    }
    return this;
  }
  return this.disableStrokeScaling_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Clipping
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Gets/sets clipping rectangle.
 @param {(acgraph.vector.Shape|goog.math.Rect|acgraph.vector.Clip|string)=} opt_value .
 @return {acgraph.vector.Element|acgraph.vector.Clip} .
 */
acgraph.vector.Element.prototype.clip = function(opt_value) {
  if (arguments.length == 0) return this.clipElement_;
  var clipShape = /** @type {acgraph.vector.Shape|goog.math.Rect|acgraph.vector.Clip} */ (opt_value == 'none' ? null : opt_value);
  if ((!this.clipElement_ && !clipShape) || (this.clipElement_ && this.clipElement_ === clipShape))
    return this;

  if (clipShape && !(clipShape instanceof acgraph.vector.Clip)) {
    if (clipShape instanceof acgraph.vector.Shape && clipShape.hasParent() && clipShape.parent() instanceof acgraph.vector.Clip) {
      if (this.clipElement_ && !this.clipElement_.isDisposed())
        this.clipElement_.removeElement(this);

      this.clipElement_ = /** @type {acgraph.vector.Clip} */(clipShape.parent());
      this.clipElement_.addElement(this);
    } else {
      if (this.clipElement_) {
        this.clipElement_.shape(clipShape);
      } else {
        this.clipElement_ = acgraph.clip(clipShape);
        this.clipElement_.addElement(this);
      }
    }
  } else {
    this.clipElement_ = clipShape || null;
  }

  this.clipChanged();
  return this;
};


/**
 * Notifies that clipping rectangle has changed.
 * @protected
 */
acgraph.vector.Element.prototype.clipChanged = function() {
  if (this.parent_) this.parent_.childClipChanged();
  this.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Bounds cache with transformation taken into account. Resets when shape changes.
 * @type {goog.math.Rect}
 * @protected
 */
acgraph.vector.Element.prototype.boundsCache = null;


/**
 Returns X in the coordinate system of the parent.
 @return {number} X in the coordinate system of the parent.
 */
acgraph.vector.Element.prototype.getX = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.boundsCache || this.getBounds();
  return bounds.left;
};


/**
 Returns Y in the coordinate system of the parent.
 @return {number} Y in the coordinate system of the parent.
 */
acgraph.vector.Element.prototype.getY = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.boundsCache || this.getBounds();
  return bounds.top;
};


/**
 Returns  width.
 @return {number} Width.
 */
acgraph.vector.Element.prototype.getWidth = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.boundsCache || this.getBounds();
  return bounds.width;
};


/**
 Returns height.
 @return {number} Height.
 */
acgraph.vector.Element.prototype.getHeight = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.boundsCache || this.getBounds();
  return bounds.height;
};


/**
 Returns bounds.
 @return {!goog.math.Rect} Bounds.
 */
acgraph.vector.Element.prototype.getBounds = function() {
  return this.getBoundsWithTransform(this.getSelfTransformation());
};


/**
 * Bounds cache with transformation taken into account. Resets when shape changes.
 * @type {goog.math.Rect}
 * @protected
 */
acgraph.vector.Element.prototype.absoluteBoundsCache = null;


/**
 Returns an absolute X (root element coordinate system).
 @return {number} Absolute X.
 */
acgraph.vector.Element.prototype.getAbsoluteX = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.left;
};


/**
 Returns an absolute Y (root element coordinate system).
 @return {number} Absolute Y.
 */
acgraph.vector.Element.prototype.getAbsoluteY = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.top;
};


/**
 Returns width within root bounds.
 @return {number} Width.
 */
acgraph.vector.Element.prototype.getAbsoluteWidth = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.width;
};


/**
 Returns height within root bounds.
 @return {number} Height.
 */
acgraph.vector.Element.prototype.getAbsoluteHeight = function() {
  /** @type {!goog.math.Rect} */
  var bounds = this.absoluteBoundsCache || this.getAbsoluteBounds();
  return bounds.height;
};


/**
 Gets element bounds in absolute coordinates (root element coordinate system).
 @return {!goog.math.Rect} Absolute element bounds.
 */
acgraph.vector.Element.prototype.getAbsoluteBounds = function() {
  return this.getBoundsWithTransform(this.getFullTransformation());
};


/**
 * Returns element bounds with a given transformation. Current transformation IS NOT TAKEN INTO ACCOUNT.
 * This method is used to check bounds after the transformation.
 * @param {goog.math.AffineTransform} transform Transformation.
 * @return {!goog.math.Rect} Bounds.
 */
acgraph.vector.Element.prototype.getBoundsWithTransform = goog.abstractMethod;


/**
 * Bounds of an element without the current transformation.
 * @return {!goog.math.Rect} Bounds.
 */
acgraph.vector.Element.prototype.getBoundsWithoutTransform = function() {
  return this.getBoundsWithTransform(null);
};


/**
 * Drops bounds and absolute bounds caches.
 * @protected
 */
acgraph.vector.Element.prototype.dropBoundsCache = function() {
  this.boundsCache = null;
  this.absoluteBoundsCache = null;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Drag
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Returns current state flag.
 @param {(boolean|goog.math.Rect)=} opt_value .
 @return {boolean|goog.math.Rect|acgraph.vector.Element} .
 */
acgraph.vector.Element.prototype.drag = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.draggable_ = opt_value;
    if (opt_value && !this.hasDirtyState(acgraph.vector.Element.DirtyState.DOM_MISSING)) {
      var isLimited = opt_value instanceof goog.math.Rect;
      var limit = isLimited ? this.draggable_ : null;
      if (!this.dragger_)
        this.dragger_ = new acgraph.events.Dragger(this);
      this.dragger_.setEnabled(true);
      this.dragger_.setLimits(limit);
    } else if (this.dragger_)
      this.dragger_.setEnabled(false);
    return this;
  }
  return this.draggable_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Deserialize JSON data to Element object.
 * @param {Object} data Data for deserialization.
 */
acgraph.vector.Element.prototype.deserialize = function(data) {
  if ('id' in data)
    this.id(data['id']);
  if ('clip' in data) {

    var clip = acgraph.clip();
    clip.deserialize(data['clip']);
    this.clip(clip);
  }
  if ('drag' in data) {
    var drag = data['drag'];
    this.drag(goog.isBoolean(drag) ? drag : new goog.math.Rect(drag.left, drag.top, drag.width, drag.height));
  }
  if ('cursor' in data) this.cursor(data['cursor']);
  if ('transformation' in data) {
    var tx = data['transformation'];
    this.setTransformationMatrix.apply(this, tx);
  }
};


/**
 * Serialize Element object to JSONdata.
 * @return {Object} Serialized element. JSON data.
 */
acgraph.vector.Element.prototype.serialize = function() {
  var data = {};
  if (this.id_) data['id'] = this.id_;

  var clip = this.clip();
  if (clip) {
    data['clip'] = clip.serialize();
  }

  var cursor = this.cursor();
  if (cursor) data['cursor'] = cursor;
  var drag = this.drag();
  if (drag) data['drag'] = drag;

  var tx = this.getSelfTransformation();
  if (tx) data['transformation'] = [tx.getScaleX(), tx.getShearY(), tx.getShearX(), tx.getScaleX(), tx.getTranslateX(), tx.getTranslateY()];
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Disposes element completelt. Removes it from the parent layer, sets links to null,
 removes it from DOM.
 */
acgraph.vector.Element.prototype.dispose = function() {
  goog.base(this, 'dispose');
};


/** @inheritDoc */
acgraph.vector.Element.prototype.disposeInternal = function() {
  if (this.hasParent())
    this.remove();
  else
    this.finalizeDisposing();

  goog.base(this, 'disposeInternal');
};


/**
 * Finalizes object removal. If object is in DOM, must be called finilizing any
 * operations with an element.
 * @protected
 */
acgraph.vector.Element.prototype.finalizeDisposing = function() {
  goog.dispose(this.handler_);
  this.handler_ = null;

  this.setParent(null);

  acgraph.unregister(this);
  this.domElement_ = null;
  this.skew = null;
  this.clipElement_ = null;

  this.transformation = null;
  this.logicalTransformation = null;
  this.inverseTransform_ = null;
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = acgraph.vector.Element.prototype;
  proto['id'] = proto.id;
  proto['visible'] = proto.visible;
  proto['disableStrokeScaling'] = proto.disableStrokeScaling;
  proto['domElement'] = proto.domElement;
  proto['parent'] = proto.parent;
  proto['hasParent'] = proto.hasParent;
  proto['remove'] = proto.remove;
  proto['attr'] = proto.attr;
  proto['title'] = proto.title;
  proto['desc'] = proto.desc;
  proto['getStage'] = proto.getStage;
  proto['cursor'] = proto.cursor;
  proto['disablePointerEvents'] = proto.disablePointerEvents;
  proto['rotate'] = proto.rotate;
  proto['rotateByAnchor'] = proto.rotateByAnchor;
  proto['setRotation'] = proto.setRotation;
  proto['setRotationByAnchor'] = proto.setRotationByAnchor;
  proto['translate'] = proto.translate;
  proto['setTranslation'] = proto.setTranslation;
  proto['setPosition'] = proto.setPosition;
  proto['scale'] = proto.scale;
  proto['scaleByAnchor'] = proto.scaleByAnchor;
  proto['appendTransformationMatrix'] = proto.appendTransformationMatrix;
  proto['setTransformationMatrix'] = proto.setTransformationMatrix;
  proto['getRotationAngle'] = proto.getRotationAngle;
  proto['getTransformationMatrix'] = proto.getTransformationMatrix;
  proto['clip'] = proto.clip;
  proto['zIndex'] = proto.zIndex;
  proto['getX'] = proto.getX;
  proto['getY'] = proto.getY;
  proto['getWidth'] = proto.getWidth;
  proto['getHeight'] = proto.getHeight;
  proto['getBounds'] = proto.getBounds;
  proto['getAbsoluteX'] = proto.getAbsoluteX;
  proto['getAbsoluteY'] = proto.getAbsoluteY;
  proto['getAbsoluteWidth'] = proto.getAbsoluteWidth;
  proto['getAbsoluteHeight'] = proto.getAbsoluteHeight;
  proto['getAbsoluteBounds'] = proto.getAbsoluteBounds;
  proto['listen'] = proto.listen;
  proto['listenOnce'] = proto.listenOnce;
  proto['unlisten'] = proto.unlisten;
  proto['unlistenByKey'] = proto.unlistenByKey;
  proto['removeAllListeners'] = proto.removeAllListeners;
  proto['drag'] = proto.drag;
  proto['dispose'] = proto.dispose;
})();
