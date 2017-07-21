goog.provide('acgraph.events.MouseWheelHandler');

goog.require('goog.events.MouseWheelHandler');



/**
 * This event handler allows you to catch mouse wheel events in a consistent
 * manner.
 * @param {Element|Document} element The element to listen to the mouse wheel
 *     event on.
 * @param {boolean=} opt_capture Whether to handle the mouse wheel event in
 *     capture phase.
 * @param {Function=} opt_isPreventDefault Whether prevent default.
 * @constructor
 * @extends {goog.events.MouseWheelHandler}
 */
acgraph.events.MouseWheelHandler = function(element, opt_capture, opt_isPreventDefault) {
  goog.base(this, element, opt_capture);

  /**
   * Map.
   * @type {Function}
   * @private
   */
  this.isPreventDefault_ = opt_isPreventDefault || /** @return {boolean} */(function() { return true; });
};
goog.inherits(acgraph.events.MouseWheelHandler, goog.events.MouseWheelHandler);


/** @inheritDoc */
acgraph.events.MouseWheelHandler.prototype.handleEvent = function(e) {
  if (this.isPreventDefault_(e)) {
    e.preventDefault();
    goog.base(this, 'handleEvent', e);
  }
};


/** @inheritDoc */
acgraph.events.MouseWheelHandler.prototype.disposeInternal = function() {
  acgraph.events.MouseWheelHandler.base(this, 'disposeInternal');

  this.isPreventDefault_ = null;
};
