goog.provide('acgraph.vector.Clip');
goog.require('acgraph.vector.ILayer');
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.math.Rect');



/**
 * Class representing independent clip, that can be applied to any element.
 * Used to set one clip to many elements, and updates only clip.
 * @param {acgraph.vector.Stage} stage Stage where clip is creating.
 * @param {(number|Array.<number>|acgraph.vector.Shape|goog.math.Rect|Object|null)=} opt_leftOrShape Left coordinate of bounds
 * or rect or array or object representing bounds.
 * @param {number=} opt_top Top coordinate.
 * @param {number=} opt_width Width of the rect.
 * @param {number=} opt_height Height of the rect.
 * @constructor
 * @extends {goog.Disposable}
 * @implements {acgraph.vector.ILayer}
 */
acgraph.vector.Clip = function(stage, opt_leftOrShape, opt_top, opt_width, opt_height) {
  acgraph.vector.Clip.base(this, 'constructor');

  /**
   * Stage.
   * @type {acgraph.vector.Stage}
   * @private
   */
  this.stage_ = stage;

  /**
   * Flag shows that clip should be rendered on render phase.
   * @type {boolean}
   * @private
   */
  this.dirty_ = false;

  /**
   * Array of elements that are clipped by this clip.
   * @type {Array.<!acgraph.vector.Element>}
   * @protected
   */
  this.elements = [];

  /**
   * Id of clip-path element.
   * Also shows if clip was rendered and exists in DOM structure.
   * @type {?string}
   * @private
   */
  this.id_ = null;

  /**
   * Clip shape.
   * @type {acgraph.vector.Shape}
   * @private
   */
  this.shape_ = null;

  this.shape.apply(this, goog.array.slice(arguments, 1));
};
goog.inherits(acgraph.vector.Clip, goog.Disposable);


/**
 * Set stage.
 * @param {acgraph.vector.Stage=} opt_value
 * @return {acgraph.vector.Stage|acgraph.vector.Clip}
 */
acgraph.vector.Clip.prototype.stage = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.stage_ = opt_value;
    if (this.dirty_) this.stage_.addClipForRender(this);
    return this;
  }
  return this.stage_;
};


/**
 * Supported shape types.
 * @type {Object<string, Function>}
 * @private
 */
acgraph.vector.Clip.shapesHelper_ = {
  'rect': acgraph.vector.Rect,
  'circle': acgraph.vector.Circle,
  'ellipse': acgraph.vector.Ellipse,
  'path': acgraph.vector.Path
};


/**
 * Shape to clip.
 * @param {(number|Array.<number>|acgraph.vector.Shape|goog.math.Rect|Object|null)=} opt_leftOrShape Left coordinate of bounds
 * or rect or vector shape or array or object representing bounds.
 * @param {number=} opt_top Top coordinate.
 * @param {number=} opt_width Width of the rect.
 * @param {number=} opt_height Height of the rect.
 * @return {acgraph.vector.Clip|acgraph.vector.Shape}
 */
acgraph.vector.Clip.prototype.shape = function(opt_leftOrShape, opt_top, opt_width, opt_height) {
  if (arguments.length) {
    if (opt_leftOrShape instanceof acgraph.vector.Shape) {
      if (this.shape_) {
        var sameType = false;
        for (var i in acgraph.vector.Clip.shapesHelper_) {
          var t = acgraph.vector.Clip.shapesHelper_[i];
          if (this.shape_ instanceof t && opt_leftOrShape instanceof t) {
            sameType = true;
            break;
          }
        }

        if (sameType) {
          this.shape_.deserialize(opt_leftOrShape.serialize());
        } else {
          this.shape_.parent(null);
          this.shape_ = opt_leftOrShape;
          this.shape_.parent(this);
        }
      } else {
        this.shape_ = opt_leftOrShape;
        this.shape_.parent(this);
      }
    } else {
      var left, top, width, height;
      if (opt_leftOrShape instanceof goog.math.Rect) {
        left = opt_leftOrShape.left;
        top = opt_leftOrShape.top;
        width = opt_leftOrShape.width;
        height = opt_leftOrShape.height;
      } else if (goog.isArray(opt_leftOrShape)) {
        left = goog.isDefAndNotNull(opt_leftOrShape[0]) ? opt_leftOrShape[0] : 0;
        top = goog.isDefAndNotNull(opt_leftOrShape[1]) ? opt_leftOrShape[1] : 0;
        width = goog.isDefAndNotNull(opt_leftOrShape[2]) ? opt_leftOrShape[2] : 0;
        height = goog.isDefAndNotNull(opt_leftOrShape[3]) ? opt_leftOrShape[3] : 0;
      } else if (goog.isObject(opt_leftOrShape)) {
        left = goog.isDefAndNotNull(opt_leftOrShape['left']) ? opt_leftOrShape['left'] : 0;
        top = goog.isDefAndNotNull(opt_leftOrShape['top']) ? opt_leftOrShape['top'] : 0;
        width = goog.isDefAndNotNull(opt_leftOrShape['width']) ? opt_leftOrShape['width'] : 0;
        height = goog.isDefAndNotNull(opt_leftOrShape['height']) ? opt_leftOrShape['height'] : 0;
      } else {
        left = goog.isDefAndNotNull(opt_leftOrShape) ? opt_leftOrShape : 0;
        top = goog.isDefAndNotNull(opt_top) ? opt_top : 0;
        width = goog.isDefAndNotNull(opt_width) ? opt_width : 0;
        height = goog.isDefAndNotNull(opt_height) ? opt_height : 0;
      }
      if (this.shape_) {
        if (this.shape_ instanceof acgraph.vector.Rect) {
          this.shape_.setX(left).setY(top).setWidth(width).setHeight(height);
        } else {
          this.shape_.parent(null);
          this.shape_ = acgraph.rect(left, top, width, height);
          this.shape_.parent(this);
        }
      } else {
        this.shape_ = acgraph.rect(left, top, width, height);
        this.shape_.parent(this);
      }
    }

    return this;
  }

  return this.shape_;
};


/**
 * Shows if clip need be rendered.
 * @return {boolean} Whether clip need to be rendered.
 */
acgraph.vector.Clip.prototype.isDirty = function() {
  return this.dirty_;
};


/**
 * Tells stage that clip should be updated on render.
 * @private
 */
acgraph.vector.Clip.prototype.needUpdateClip_ = function() {
  if (!this.dirty_) {
    this.dirty_ = true;
    if (this.stage_) this.stage_.addClipForRender(this);
  }
};


/**
 * Getter/setter for clip id setting.
 * @param {?string=} opt_value Id to set.
 * @return {string|acgraph.vector.Clip} Clip id or self for chaining.
 */
acgraph.vector.Clip.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.id_ = opt_value;
    return this;
  }
  return this.id_;
};


/**
 * Updates clip path for elements.
 */
acgraph.vector.Clip.prototype.render = function() {
  this.dirty_ = false;

  if (!this.id_)
    return;
  acgraph.getRenderer().updateClip(this);
};


/**
 * Adds element to managing by this clip.
 * @param {acgraph.vector.Element} element
 */
acgraph.vector.Clip.prototype.addElement = function(element) {
  goog.array.insert(this.elements, element);
};


/**
 * Removes element from managing by current clip.
 * @param {!acgraph.vector.Element} element
 */
acgraph.vector.Clip.prototype.removeElement = function(element) {
  goog.array.remove(this.elements, element);
};


/**
 * Getter for elements.
 * @return {Array.<!acgraph.vector.Element>} Elements.
 */
acgraph.vector.Clip.prototype.getElements = function() {
  return this.elements;
};


/**
 * Serialize Clip object to JSON data.
 * @return {Object} Serialized Clip. JSON data.
 */
acgraph.vector.Clip.prototype.serialize = function() {
  return this.shape_.serialize();
};


/**
 * Deserialize JSON data to Element object.
 * @param {Object} data Data for deserialization.
 */
acgraph.vector.Clip.prototype.deserialize = function(data) {
  var type = acgraph.vector.Clip.shapesHelper_[data['type']];
  if (type) {
    var primitive = new type();
    primitive.deserialize(data);
    this.shape(primitive);
  }
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
acgraph.vector.Clip.prototype.addChild = function(child) {
  child.remove();
  child.setParent(this);
  this.needUpdateClip_();
  return this;
};


/**
 * @param {acgraph.vector.Element} element Element to be removed.
 * @return {acgraph.vector.Element} Removed element or null.
 */
acgraph.vector.Clip.prototype.removeChild = function(element) {
  element.setParent(null);
  var dom = element.domElement();
  if (dom)
    goog.dom.removeNode(dom);
  this.needUpdateClip_();
  return element;
};


/**
 * Returns full transformation (self and parent transformations combined).
 * @return {goog.math.AffineTransform} Full transformation.
 */
acgraph.vector.Clip.prototype.getFullTransformation = function() {
  return null;
};


/**
 * @param {acgraph.vector.Element} child .
 */
acgraph.vector.Clip.prototype.notifyRemoved = function(child) {

};


/**
 * @return {acgraph.vector.Stage} Stage (may be null).
 */
acgraph.vector.Clip.prototype.getStage = function() {
  return /** @type {acgraph.vector.Stage} */(this.stage());
};


/**
 * Sets dirty state.
 * @param {number} value States to be set.
 */
acgraph.vector.Clip.prototype.setDirtyState = function(value) {
  this.needUpdateClip_();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Disposes clip. Removes it and his children from defs, clears clip for managed elements.
 */
acgraph.vector.Clip.prototype.dispose = function() {
  acgraph.vector.Clip.base(this, 'dispose');
};


/** @inheritDoc */
acgraph.vector.Clip.prototype.disposeInternal = function() {
  if (this.stage_) this.stage_.removeClipFromRender(this);
  acgraph.getRenderer().disposeClip(this);

  this.shape_.dispose();

  delete this.stage_;
  delete this.id_;
  delete this.elements;
  delete this.dirty_;
  delete this.shape_;

  acgraph.vector.Clip.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.Clip.prototype;
  proto['shape'] = proto.shape;
  proto['dispose'] = proto.dispose;
})();
