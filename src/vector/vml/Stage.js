goog.provide('acgraph.vector.vml.Stage');
goog.require('acgraph.vector.Stage');
goog.require('acgraph.vector.vml.Clip');
goog.require('acgraph.vector.vml.Defs');



/**
 * A Stage class for VML graphics.
 * It is used to implement a different functionality than that of SVG Stage because of the difference between
 * the SVG and VML standarts.
 * @param {(Element|string)=} opt_container A container where all graphics will be drawn.
 * It can be defined later, for example while rendering.
 * @param {(number|string)=} opt_width The width of a Stage object in pixels.
 * @param {(number|string)=} opt_height The height of a Stage object in pixels.
 * @constructor
 * @extends {acgraph.vector.Stage}
 */
acgraph.vector.vml.Stage = function(opt_container, opt_width, opt_height) {
  goog.base(this, opt_container, opt_width, opt_height);
};
goog.inherits(acgraph.vector.vml.Stage, acgraph.vector.Stage);


/** @inheritDoc */
acgraph.vector.vml.Stage.prototype.createDefs = function() {
  return new acgraph.vector.vml.Defs(this);
};


/** @inheritDoc */
acgraph.vector.vml.Stage.prototype.createClip = function(opt_leftOrRect, opt_top, opt_width, opt_height) {
  return new acgraph.vector.vml.Clip(this, opt_leftOrRect, opt_top, opt_width, opt_height);
};


//};// TODO (Anton Saukh): needs review
///** @inheritDoc */
//acgraph.vector.vml.Stage.prototype.acquireDomChange = function() {
//  // In VML all changes will be considered as DOM changes because both a fill and a line are subnodes, not attributes.
//  return this.acquireDomChanges(1) > 0;
//};

//exports
goog.exportSymbol('acgraph.vml.Stage', acgraph.vector.vml.Stage);
