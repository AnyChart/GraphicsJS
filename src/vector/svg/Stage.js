goog.provide('acgraph.vector.svg.Stage');
goog.require('acgraph.vector.Stage');
goog.require('acgraph.vector.svg.Defs');



/**
* @param {(Element|string)=} opt_container A container where all graphics will be drawn.
* It can be defined later, for example while rendering.
* @param {(number|string)=} opt_width The width of a Stage object in pixels.
* @param {(number|string)=} opt_height The height of a Stage object in pixels.
 * @constructor
 * @extends {acgraph.vector.Stage}
 */
acgraph.vector.svg.Stage = function(opt_container, opt_width, opt_height) {
  goog.base(this, opt_container, opt_width, opt_height);
};
goog.inherits(acgraph.vector.svg.Stage, acgraph.vector.Stage);


/** @inheritDoc */
acgraph.vector.svg.Stage.prototype.createDefs = function() {
  return new acgraph.vector.svg.Defs(this);
};
