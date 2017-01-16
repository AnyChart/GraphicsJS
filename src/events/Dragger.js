goog.provide('acgraph.events.DragEvent');
goog.provide('acgraph.events.Dragger');

goog.require('acgraph.math');
goog.require('goog.fx.DragEvent');
goog.require('goog.fx.Dragger');
goog.require('goog.math.Rect');



/**
 * A class that allows mouse or touch-based dragging (moving) of an element
 *
 * @param {acgraph.vector.Element} target The element that will be dragged.
 *
 * @extends {goog.fx.Dragger}
 * @constructor
 */
acgraph.events.Dragger = function(target) {
  acgraph.events.Dragger.base(this, 'constructor', target.domElement());
  /**
   * Target acgraph element.
   * @type {acgraph.vector.Element}
   * @private
   */
  this.targetElement_ = target;

  /**
   * We cannot resolve limitX and limitY separately, so we calculate it in limitX
   * and store limited values in this array, and return the latter in limitY.
   * @type {Array.<number>}
   * @private
   */
  this.limitedDeltas_ = [NaN, NaN];

  this.listen(goog.fx.Dragger.EventType.EARLY_CANCEL, this.redispatchEarlyCancel, false, this);
  this.listen(goog.fx.Dragger.EventType.START, this.redispatch, false, this);
  this.listen(goog.fx.Dragger.EventType.BEFOREDRAG, this.redispatch, false, this);
  this.listen(goog.fx.Dragger.EventType.DRAG, this.redispatch, false, this);
  this.listen(goog.fx.Dragger.EventType.END, this.redispatch, false, this);
};
goog.inherits(acgraph.events.Dragger, goog.fx.Dragger);


/**
 * Redispatches goog.fx.Dragger.EventType.EARLY_CANCEL.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 */
acgraph.events.Dragger.prototype.redispatchEarlyCancel = function(e) {
  return this.targetElement_.dispatchEvent(acgraph.events.EventType.DRAG_EARLY_CANCEL);
};


/**
 * Redispatches goog.fx.DragEvent.
 * @param {goog.fx.DragEvent} e
 * @return {boolean}
 */
acgraph.events.Dragger.prototype.redispatch = function(e) {
  return this.targetElement_.dispatchEvent(new goog.fx.DragEvent(
      e.type, this, e.clientX, e.clientY, e.browserEvent, e.left, e.top, e.dragCanceled));
};


/** @inheritDoc */
acgraph.events.Dragger.prototype.setLimits = function(limits) {
  this.limits = limits || new goog.math.Rect(NaN, NaN, NaN, NaN);
};


/** @inheritDoc */
acgraph.events.Dragger.prototype.computeInitialPosition = function() {
  this.deltaX = this.targetElement_.getAbsoluteX();
  this.deltaY = this.targetElement_.getAbsoluteY();
};


/** @inheritDoc */
acgraph.events.Dragger.prototype.limitX = function(value) {
  this.limitedDeltas_[0] = this.deltaX;
  this.limitedDeltas_[1] = this.deltaY;
  if (!isNaN(this.limits.left) || !isNaN(this.limits.top)) {
    var tx = this.targetElement_.parent().getFullTransformation();
    if (tx) {
      var inv = this.targetElement_.parent().getInverseFullTransformation();
      inv.transform(this.limitedDeltas_, 0, this.limitedDeltas_, 0, 1);
    }
    var rect = this.limits;
    var left = !isNaN(rect.left) ? rect.left : null;
    var width = !isNaN(rect.width) ? rect.width : 0;
    var top = !isNaN(rect.top) ? rect.top : null;
    var height = !isNaN(rect.height) ? rect.height : 0;
    width -= this.targetElement_.getWidth();
    height -= this.targetElement_.getHeight();
    var maxX = left != null ? left + width : Infinity;
    var minX = left != null ? left : -Infinity;
    var maxY = top != null ? top + height : Infinity;
    var minY = top != null ? top : -Infinity;
    this.limitedDeltas_[0] = Math.min(maxX, Math.max(minX, this.limitedDeltas_[0]));
    this.limitedDeltas_[1] = Math.min(maxY, Math.max(minY, this.limitedDeltas_[1]));
    if (tx) {
      tx.transform(this.limitedDeltas_, 0, this.limitedDeltas_, 0, 1);
    }
  }
  return this.limitedDeltas_[0];
};


/** @inheritDoc */
acgraph.events.Dragger.prototype.limitY = function(value) {
  return this.limitedDeltas_[1];
};


/** @inheritDoc */
acgraph.events.Dragger.prototype.defaultAction = function(x, y) {
  var tx = this.targetElement_.parent().getInverseFullTransformation();
  if (tx) {
    var arr = [x, y];
    tx.transform(arr, 0, arr, 0, 1);
    x = arr[0];
    y = arr[1];
  }
  this.targetElement_.setPosition(x, y);
};
