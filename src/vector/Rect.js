goog.provide('acgraph.vector.Rect');

goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.PathBase');
goog.require('goog.math.Rect');



/**
 Rectangle class<br>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#rect} or
 {@link acgraph.vector.Layer#rect} to create stage or layer bound rectangle.
 <br/> If you need unbound rectangle - use {@link acgraph.rect}.
 @see acgraph.vector.Stage#rect
 @see acgraph.vector.Layer#rect
 @see acgraph.rect
 @name acgraph.vector.Rect
 @param {number=} opt_x X (Left) of top-left corner of rectangle.
 @param {number=} opt_y Y (Top) of top-left corner of rectangle.
 @param {number=} opt_width Width.
 @param {number=} opt_height Height.
 @constructor
 @extends {acgraph.vector.PathBase}
 */
acgraph.vector.Rect = function(opt_x, opt_y, opt_width, opt_height) {
  /**
   * Bounds.
   * acgraph.vector.Element.DirtyState.DATA must be set whenevr data is changed.
   * @type {goog.math.Rect}
   * @private
   */
  this.rect_ = new goog.math.Rect(opt_x || 0, opt_y || 0, opt_width || 0, opt_height || 0);


  /**
   *
   * @type {Array.<(acgraph.vector.Rect.CornerType|undefined)>}
   * @private
   */
  this.cornerTypes_ = [];


  /**
   *
   * @type {Array.<(number)>}
   * @private
   */
  this.cornerSizes_ = [0, 0, 0, 0];

  goog.base(this);
  this.drawRect_();
};
goog.inherits(acgraph.vector.Rect, acgraph.vector.PathBase);


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states. Inherited from Shape and Rectangle data.
 * @type {number}
 */
acgraph.vector.Rect.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.DATA;


/** @inheritDoc */
acgraph.vector.Rect.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.RECT;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Geometry
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Sets X in parent container.
 @param {number} value X in parent container.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.setX = function(value) {
  if (value != this.rect_.left) {
    this.rect_.left = value;
    this.drawRect_();
  }
  return this;
};


/**
 Sets Y in parent container.
 @param {number} value Y in parent container.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.setY = function(value) {
  if (value != this.rect_.top) {
    this.rect_.top = value;
    this.drawRect_();
  }
  return this;
};


/**
 Sets width.
 @param {number} value Width.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.setWidth = function(value) {
  if (this.rect_.width != value) {
    this.rect_.width = value;
    this.drawRect_();
  }
  return this;
};


/**
 Sets height.
 @param {number} value Height.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.setHeight = function(value) {
  if (this.rect_.height != value) {
    this.rect_.height = value;
    this.drawRect_();
  }
  return this;
};


/**
 Sets bounds.
 @param {goog.math.Rect} value Bounds.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.setBounds = function(value) {
  if (!goog.math.Rect.equals(this.rect_, value)) {
    // clone is not used to avoid extra object creation
    this.rect_.left = value.left;
    this.rect_.top = value.top;
    this.rect_.width = value.width;
    this.rect_.height = value.height;
    this.drawRect_();
  }
  return this;
};


/**
 * Corner types.
 * @enum {string}
 */
acgraph.vector.Rect.CornerType = {
  ROUND: 'round',
  CUT: 'cut',
  ROUND_INNER: 'round-inner'
};


/**
 * Sets corner type and radius.
 * @param {acgraph.vector.Rect.CornerType} type Corner type.
 * @param {...(number|string)} var_args Set of radii. Can be set with one value,
 * four values, or string with four numbers. If radius is zero - corner looks usual.
 * @private
 */
acgraph.vector.Rect.prototype.setCornerSettings_ = function(type, var_args) {
  var topLeft, topRight, bottomRight, bottomLeft, radiusArr;
  var args = goog.array.slice(arguments, 1);
  var arg1 = args[0];

  if (goog.isString(arg1)) radiusArr = goog.string.splitLimit(arg1, ' ', 4);
  else radiusArr = args;

  if (radiusArr.length < 4) {
    bottomLeft = bottomRight = topRight = topLeft = parseFloat(radiusArr[0]);
  } else {
    topLeft = parseFloat(radiusArr[0]);
    topRight = parseFloat(radiusArr[1]);
    bottomRight = parseFloat(radiusArr[2]);
    bottomLeft = parseFloat(radiusArr[3]);
  }

  this.cornerSizes_[0] = topLeft ? topLeft : 0;
  this.cornerTypes_[0] = topLeft ? type : undefined;

  this.cornerSizes_[1] = topRight ? topRight : 0;
  this.cornerTypes_[1] = topRight ? type : undefined;

  this.cornerSizes_[2] = bottomRight ? bottomRight : 0;
  this.cornerTypes_[2] = bottomRight ? type : undefined;

  this.cornerSizes_[3] = bottomLeft ? bottomLeft : 0;
  this.cornerTypes_[3] = bottomLeft ? type : undefined;
};


/**
 * Draws rectangle with modified corners.
 * @private
 */
acgraph.vector.Rect.prototype.drawRect_ = function() {
  var stageSuspended = !this.getStage() || this.getStage().isSuspended();
  if (!stageSuspended) this.getStage().suspend();

  this.clearInternal();

  var size = this.cornerSizes_[0];
  this.moveToInternal(this.rect_.left + size, this.rect_.top);

  size = this.cornerSizes_[1];
  this.lineToInternal(this.rect_.left + this.rect_.width - this.cornerSizes_[1], this.rect_.top);
  if (this.cornerTypes_[1]) {
    switch (this.cornerTypes_[1]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width, this.rect_.top + size, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width, this.rect_.top + size, size, size, false, false);
        break;
      case acgraph.vector.Rect.CornerType.CUT:
        this.lineToInternal(this.rect_.left + this.rect_.width, this.rect_.top + size);
        break;
    }
  }

  size = this.cornerSizes_[2];
  this.lineToInternal(this.rect_.left + this.rect_.width, this.rect_.top + this.rect_.height - size);
  if (this.cornerTypes_[2]) {
    switch (this.cornerTypes_[2]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width - size, this.rect_.top + this.rect_.height, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left + this.rect_.width - size, this.rect_.top + this.rect_.height, size, size, false, false);
        break;
      case acgraph.vector.Rect.CornerType.CUT:
        this.lineToInternal(this.rect_.left + this.rect_.width - size, this.rect_.top + this.rect_.height);
        break;
    }
  }

  size = this.cornerSizes_[3];
  this.lineToInternal(this.rect_.left + size, this.rect_.top + this.rect_.height);
  if (this.cornerTypes_[3]) {
    switch (this.cornerTypes_[3]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left, this.rect_.top + this.rect_.height - size, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left, this.rect_.top + this.rect_.height - size, size, size, false, false);
        break;
      case acgraph.vector.Rect.CornerType.CUT:
        this.lineToInternal(this.rect_.left, this.rect_.top + this.rect_.height - size);
        break;
    }
  }

  size = this.cornerSizes_[0];
  this.lineToInternal(this.rect_.left, this.rect_.top + size);
  if (this.cornerTypes_[0]) {
    switch (this.cornerTypes_[0]) {
      case acgraph.vector.Rect.CornerType.ROUND:
        this.arcToByEndPointInternal(this.rect_.left + size, this.rect_.top, size, size, false, true);
        break;
      case acgraph.vector.Rect.CornerType.ROUND_INNER:
        this.arcToByEndPointInternal(this.rect_.left + size, this.rect_.top, size, size, false, false);
        break;
    }
  }
  this.closeInternal();

  if (!stageSuspended) this.getStage().resume();
};


/**
 Sets corners rounding.
 @param {string|number} radiusAllOrLeftTop Radius for all corners if only one value is provided,
 top-left corner if other values are set. Four values should be in
 <b>topLeft, topRight, bottomRight, bottomLeft</b> order.
 @param {number=} opt_radiusRightTop Top-right corner radius.
 @param {number=} opt_radiusRightBottom Bottom-right corner radius.
 @param {number=} opt_radiusLeftBottom Bottom-left corner radius.
 @return {acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.round = function(radiusAllOrLeftTop, opt_radiusRightTop, opt_radiusRightBottom, opt_radiusLeftBottom) {
  goog.array.splice(arguments, 0, 0, acgraph.vector.Rect.CornerType.ROUND);
  this.setCornerSettings_.apply(this, arguments);
  this.drawRect_();
  return this;
};


/**
 Sets corners inner rounding.
 @param {string|number} radiusAllOrLeftTop Radius for all corners if only one value is provided,
 top-left corner if other values are set. Four values should be in
 <b>topLeft, topRight, bottomRight, bottomLeft</b> order.
 @param {number=} opt_radiusRightTop Top-right corner radius.
 @param {number=} opt_radiusRightBottom Bottom-right corner radius.
 @param {number=} opt_radiusLeftBottom Bottom-left corner radius.
 @return {acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.roundInner = function(radiusAllOrLeftTop, opt_radiusRightTop, opt_radiusRightBottom, opt_radiusLeftBottom) {
  goog.array.splice(arguments, 0, 0, acgraph.vector.Rect.CornerType.ROUND_INNER);
  this.setCornerSettings_.apply(this, arguments);
  this.drawRect_();
  return this;
};


/**
 Sets cut corners.
 @param {string|number} radiusAllOrLeftTop Radius for all corners if only one value is provided,
 top-left corner if other values are set. Four values should be in
 <b>topLeft, topRight, bottomRight, bottomLeft</b> order.
 @param {number=} opt_radiusRightTop Top-right corner radius.
 @param {number=} opt_radiusRightBottom Bottom-right corner radius.
 @param {number=} opt_radiusLeftBottom Bottom-left corner radius.
 @return {acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 */
acgraph.vector.Rect.prototype.cut = function(radiusAllOrLeftTop, opt_radiusRightTop, opt_radiusRightBottom, opt_radiusLeftBottom) {
  goog.array.splice(arguments, 0, 0, acgraph.vector.Rect.CornerType.CUT);
  this.setCornerSettings_.apply(this, arguments);
  this.drawRect_();
  return this;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Rect.prototype.deserialize = function(data) {
  goog.base(this, 'deserialize', data);

  this.setX(data['x']).setY(data['y']).setWidth(data['width']).setHeight(data['height']);

  if (data['cornerTypes']) {
    this.cornerTypes_ = /** @type {Array.<(acgraph.vector.Rect.CornerType)>} */ (goog.string.splitLimit(data['cornerTypes'], ' ', 4));
    var sizes = goog.string.splitLimit(data['cornerSizes'], ' ', 4);
    goog.array.forEach(sizes, function(value, i, arr) {
      arr[i] = parseFloat(value);
    });
    this.cornerSizes_ = /** @type {Array.<number>} */ (sizes);
    this.drawRect_();
  }
};


/** @inheritDoc */
acgraph.vector.Rect.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['type'] = 'rect';
  data['x'] = this.rect_.left;
  data['y'] = this.rect_.top;
  data['width'] = this.rect_.width;
  data['height'] = this.rect_.height;
  data['cornerTypes'] = this.cornerTypes_.join(' ');
  data['cornerSizes'] = this.cornerSizes_.join(' ');
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Rect.prototype.disposeInternal = function() {
  this.cornerSizes_ = null;
  this.cornerTypes_ = null;
  this.rect_ = null;
  this.dropBoundsCache();

  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.Rect.prototype;
  goog.exportSymbol('acgraph.vector.Rect', acgraph.vector.Rect);
  proto['setX'] = proto.setX;
  proto['setY'] = proto.setY;
  proto['setWidth'] = proto.setWidth;
  proto['setHeight'] = proto.setHeight;
  proto['setBounds'] = proto.setBounds;
  proto['cut'] = proto.cut;
  proto['round'] = proto.round;
  proto['roundInner'] = proto.roundInner;
})();
