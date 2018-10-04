goog.provide('acgraph.vector.Shape');
goog.require('acgraph.utils');
goog.require('acgraph.vector.Element');
goog.require('goog.math.Rect');



/**
 <b>Base class</b> for all vector elements.<br/>
 <b>Never invoke constructor directly!</b>
 @name acgraph.vector.Shape
 @constructor
 @extends {acgraph.vector.Element}
 */
acgraph.vector.Shape = function() {
  /**
   * Fill settings object.
   * Null value means that fill will not be rendered.
   * @type {?acgraph.vector.Fill}
   * @private
   */
  this.fill_ = 'none';

  /**
   * Stroke settings object.
   * Null value means that fill will not be rendered.
   * @type {?acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = 'black';

  /**
   * If the fill or stroke needs update on DATA invalidation.
   * 0 - no need, 1 - fill needs to be update, 2 - stroke, 3 - both.
   * @type {number}
   * @private
   */
  this.boundsAffectedColors_ = 0;

  goog.base(this);
};
goog.inherits(acgraph.vector.Shape, acgraph.vector.Element);


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states mask. Inherited from base element
 * with fill and stroke added.
 * @type {number}
 */
acgraph.vector.Shape.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.FILL |
        acgraph.vector.Element.DirtyState.STROKE;


/**
 Sets fill as an object or a string.
 @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 @param {number=} opt_opacityOrAngleOrCx .
 @param {(number|boolean|!goog.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 @param {(number|!goog.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 @param {number=} opt_opacity .
 @param {number=} opt_fx .
 @param {number=} opt_fy .
 @return {(acgraph.vector.Fill|acgraph.vector.Shape|null)} .
 */
acgraph.vector.Shape.prototype.fill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode,
    opt_opacity, opt_fx, opt_fy) {
  // If first parameter is undefined - it is a getter
  if (!goog.isDef(opt_fillOrColorOrKeys))
    return this.fill_;

  /**
   * @type {!acgraph.vector.Fill}
   */
  var newFill = acgraph.vector.normalizeFill.apply(this, arguments);

  // TODO(Anton Saukh): comparison must be more complex here
  if (this.fill_ != newFill) {
    this.fill_ = newFill;
    this.boundsAffectedColors_ = (this.boundsAffectedColors_ & 2) | !!(newFill['mode'] || newFill['src']);
    this.setDirtyState(acgraph.vector.Element.DirtyState.FILL);
  }
  return this;
};


/**
  Set stroke.<br/>
  @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill .
  @param {number=} opt_thickness .
  @param {string=} opt_dashpattern .
  @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin .
  @param {acgraph.vector.StrokeLineCap=} opt_lineCap .
  @return {(acgraph.vector.Shape|acgraph.vector.Stroke|null)} .
 */
acgraph.vector.Shape.prototype.stroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (!goog.isDef(opt_strokeOrFill))
    return this.stroke_;

  var newStroke = acgraph.vector.normalizeStroke.apply(this, arguments);

  // TODO(Anton Saukh): comparison must be more complex here
  if (this.stroke_ != newStroke) {
    this.stroke_ = /** @type {acgraph.vector.Stroke} */(newStroke);
    this.boundsAffectedColors_ = (this.boundsAffectedColors_ & 1) | (newStroke['mode'] << 1);
    this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
  }
  return this;
};


/**
 * Adds possibility to nullify fill and stroke for alternative coloring
 * like text color since text becomes the shape (DVF-3872).
 * Null value prevents fill/stroke attribute rendering.
 *
 * DEV NOTE: Do not abuse this method because it sets no dirty state.
 */
acgraph.vector.Shape.prototype.setNullFillAndStroke = function() {
  this.fill_ = null;
  this.stroke_ = null;
};


/**
  Gets/sets stroke thickness.
  @param {number=} opt_value Thickness value.
  @return {(number|!acgraph.vector.Shape)} .
 */
acgraph.vector.Shape.prototype.strokeThickness = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (goog.isString(this.stroke_)) {
      this.stroke_ = /** @type {acgraph.vector.Stroke} */({
        'color': this.stroke_,
        'thickness': isNaN(opt_value) ? 1 : +opt_value
      });
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
    } else {
      this.stroke_['thickness'] = isNaN(opt_value) ? 1 : +opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
    }
    return this;
  } else if (goog.isString(this.stroke_)) {
    return 1;
  } else {
    return acgraph.vector.getThickness(this.stroke_);
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Shape.prototype.beforeRenderInternal = function() {
  if (this.boundsAffectedColors_ && this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA)) {
    if (!!(this.boundsAffectedColors_ & 1))
      this.setDirtyState(acgraph.vector.Element.DirtyState.FILL);
    if (!!(this.boundsAffectedColors_ & 2))
      this.setDirtyState(acgraph.vector.Element.DirtyState.STROKE);
  }
};


/** @inheritDoc */
acgraph.vector.Shape.prototype.renderInternal = function() {
  goog.base(this, 'renderInternal');

  // Apply stroke and fill settings if they were changed
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.FILL) ||
      this.hasDirtyState(acgraph.vector.Element.DirtyState.STROKE))
    this.renderFillAndStroke();
};


/**
 * Applies stroke and fill settings to the DOM element.
 * @protected
 * @return {undefined}
 */
acgraph.vector.Shape.prototype.renderFillAndStroke = function() {
  acgraph.getRenderer().applyFillAndStroke(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.FILL);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.STROKE);
};
//region --- Section Utility methods ---


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/**
 *  @param {Object} data Data.
 */
acgraph.vector.Shape.prototype.deserialize = function(data) {
  var type;
  if ('fill' in data) {
    var fillData = data['fill'];
    type = fillData['type'];
    var fill;
    if (type == 'pattern') {
      var bounds = fillData['bounds'];
      fill = acgraph.patternFill(new goog.math.Rect(bounds.left, bounds.top, bounds.width, bounds.height));
      fill.deserialize(fillData);
    } else if (type == 'hatchFill') {
      fill = acgraph.hatchFill(fillData['hatchType'], fillData['color'], fillData['thickness'],
          fillData['size']);
    } else {
      if (goog.isObject(fillData) && 'type' in fillData) delete fillData['type'];
      fill = fillData;
    }
    this.fill(fill);
  }
  if ('stroke' in data)
    this.stroke(data['stroke']);
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.Shape.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');

  if (this.fill_) {
    var fillData, tmpFill, tmpStroke;
    if (acgraph.utils.instanceOf(this.fill_, acgraph.vector.HatchFill)) {
      fillData = {
        'type': 'hatchFill',
        'hatchType': this.fill_.type,
        'color': this.fill_.color,
        'thickness': this.fill_.thickness,
        'size': this.fill_.size
      };
    } else if (acgraph.utils.instanceOf(this.fill_, acgraph.vector.PatternFill)) {
      fillData = this.fill_.serialize();
    } else if (goog.isObject(this.fill_) && ('keys' in this.fill_)) {
      if (('cx' in this.fill_) && ('cy' in this.fill_)) {
        tmpFill = acgraph.utils.recursiveClone(this.fill_);
        tmpFill['type'] = 'RadialGradientFill';
        fillData = tmpFill;
      } else {
        tmpFill = acgraph.utils.recursiveClone(this.fill_);
        tmpFill['type'] = 'LinearGradientFill';
        fillData = tmpFill;
      }
    } else {
      fillData = this.fill_;
    }
    if (fillData) data['fill'] = fillData;
  }
  if (this.stroke_) {
    data['stroke'] = this.stroke_;
  } else if (goog.isObject(this.stroke_) && ('keys' in this.stroke_)) {
    if (('cx' in this.stroke_) && ('cy' in this.stroke_)) {
      tmpStroke = acgraph.utils.recursiveClone(this.stroke_);
      tmpStroke['type'] = 'RadialGradientFill';
      data['stroke'] = tmpStroke;
    } else {
      tmpStroke = acgraph.utils.recursiveClone(this.stroke_);
      tmpStroke['type'] = 'LinearGradientFill';
      data['stroke'] = tmpStroke;
    }
  }
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Shape.prototype.disposeInternal = function() {
  delete this.fill_;
  delete this.stroke_;

  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.Shape.prototype;
  proto['stroke'] = proto.stroke;
  proto['strokeThickness'] = proto.strokeThickness;
  proto['fill'] = proto.fill;
  proto['attr'] = proto.attr;
})();
