goog.provide('acgraph.vector.vml.Clip');
goog.require('acgraph.vector.Clip');



/**
 * Class for VML clip.
 * @param {acgraph.vector.Stage} stage Stage where clip is creating.
 * @param {(number|Array.<number>|goog.math.Rect|Object|null)=} opt_leftOrRect Left coordinate of bounds
 * or rect or array or object representing bounds.
 * @param {number=} opt_top Top coordinate.
 * @param {number=} opt_width Width of the rect.
 * @param {number=} opt_height Height of the rect.
 * @constructor
 * @extends {acgraph.vector.Clip}
 */
acgraph.vector.vml.Clip = function(stage, opt_leftOrRect, opt_top, opt_width, opt_height) {
  goog.base(this, stage, opt_leftOrRect, opt_top, opt_width, opt_height);
};
goog.inherits(acgraph.vector.vml.Clip, acgraph.vector.Clip);


/** @inheritDoc */
acgraph.vector.vml.Clip.prototype.render = function() {
  var stage = this.stage();
  var manualSuspend = stage && !stage.isSuspended();

  if (manualSuspend) stage.suspend();

  goog.array.forEach(this.elements, function(element) {
    element.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
  }, this);

  if (manualSuspend) stage.resume();
};


goog.exportSymbol('acgraph.vml.Clip', acgraph.vector.vml.Clip);
