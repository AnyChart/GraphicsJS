goog.provide('acgraph.vector.Circle');

goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Ellipse');



/**
 Circle Class. Inherited from Ellipse. <br>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#circle} or
 {@link acgraph.vector.Layer#circle} methods, if you want to create an instance of primitive bound to a stage or a layer.
 <br/> In case you need an unbound primitive – use {@link acgraph.circle}.
 @see acgraph.vector.Stage#circle
 @see acgraph.vector.Layer#circle
 @see acgraph.circle
 @name acgraph.vector.Circle
 @param {number=} opt_centerX X coordinate of the center in pixels.
 @param {number=} opt_centerY Y coordinate of the center in pixels.
 @param {number=} opt_radius Circle radius in pixels.
 @constructor
 @extends {acgraph.vector.Ellipse}
 */
acgraph.vector.Circle = function(opt_centerX, opt_centerY, opt_radius) {
  acgraph.vector.Circle.base(this, 'constructor', opt_centerX, opt_centerY, opt_radius, opt_radius);
};
goog.inherits(acgraph.vector.Circle, acgraph.vector.Ellipse);


/** @inheritDoc */
acgraph.vector.Circle.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.CIRCLE;
};


/**
 Setter for circle radius.
 @param {number=} opt_value Circle radius.
 @return {!acgraph.vector.Circle|number} .
 */
acgraph.vector.Circle.prototype.radius = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.radiusX(opt_value);
    this.radiusY(opt_value);
    return this;
  }
  return /** @type {number} */ (this.radiusX());
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Circle.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createCircleElement();
};


/**
 * Applies all circle settings to its DOM element.
 * @protected
 */
acgraph.vector.Circle.prototype.renderData = function() {
  // Set circle parameters
  acgraph.getRenderer().setCircleProperties(this);
  // Reset flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Circle.prototype.deserialize = function(data) {
  this.radiusX(data['radius']);
  acgraph.vector.Circle.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.Circle.prototype.serialize = function() {
  var data = acgraph.vector.Circle.base(this, 'serialize');
  data['type'] = 'circle';
  delete data['rx'];
  delete data['ry'];
  data['radius'] = this.radiusX();
  return data;
};


//exports
goog.exportSymbol('acgraph.vector.Circle', acgraph.vector.Circle);
(function() {
  var proto = acgraph.vector.Circle.prototype;
  proto['radius'] = proto.radius;
})();
