goog.provide('acgraph.vector.vml.ShapeType');
goog.require('acgraph.utils.IdGenerator');
goog.require('goog.Disposable');



/**
 * This class is a wrapper for the VML ShapeType element. In VML the ShapeType element is used to describe
 * other elements and is of a reusable type. For more information see
 * <a href='http://www.w3.org/TR/NOTE-VML#_Toc416858387'>ShapeType</a>.
 *
 * <h4>Function of the class</h4>
 * <p>
 * The ShapeType element is used to reduce the number of DOM elements in VML graphics.
 * In the current state each VML DOM primitive has the fill and stroke elements. If ShapeType is not used, it means that
 * each DOM element of the primitive must have two nodes: fill and stroke. If ShapeType is used, there are 3 DOM
 * elements: the ShapeType node, and the fill and stroke nodes. But elements with the identical style will share the ShapeType,
 * so in this case the number of DOM elements will be less (2 * 2 > 3).
 * </p>
 * @param {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient)} fill A fill for a shape.
 * @param {!acgraph.vector.Stroke} stroke An outline of a shape.
 * @constructor
 * @extends {goog.Disposable}
 */
acgraph.vector.vml.ShapeType = function(fill, stroke) {
  goog.base(this);

  /**
   * A fill for a shape.
   * @type {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient)}
   * @private
   */
  this.fill_ = fill;
  /**
   * An outline of a shape.
   * @type {acgraph.vector.Stroke}
   * @private
   */
  this.stroke_ = stroke;
};
goog.inherits(acgraph.vector.vml.ShapeType, goog.Disposable);


/**
 * Returns the ShapeType fill.
 * @return {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient)} Fill.
 */
acgraph.vector.vml.ShapeType.prototype.getFill = function() {
  return this.fill_;
};


/**
 * Returns ShapeType value.
 * @param {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient)} value .
 */
acgraph.vector.vml.ShapeType.prototype.setFill = function(value) {
  this.fill_ = value;
};


/**
 * Removes the fill from the DOM and the Objects structure.
 */
acgraph.vector.vml.ShapeType.prototype.removeFill = function() {
  delete this.fill_;
  goog.dom.removeNode(this.fillDomElement);
  this.fillDomElement = null;
};


/**
 * The DOM element for the VML stroke element.
 * @type {Element}
 */
acgraph.vector.vml.ShapeType.prototype.fillDomElement = null;


/**
 * The DOM element for the VML stroke element..
 * @type {Element}
 */
acgraph.vector.vml.ShapeType.prototype.strokeDomElement = null;


/**
 * A parameter, defining the state of an element: whether it was added to the DOM or not.
 * @type {boolean}
 */
acgraph.vector.vml.ShapeType.prototype.rendered = false;


/**
 * Returns a prefix indicating the type of element.
 * This prefix is used for generating a unique identifier in {@link acgraph.utils.IdGenerator}.
 * It is used to find the type of element to which the identifier belongs.
 * @return {acgraph.utils.IdGenerator.ElementTypePrefix} The prefix indicating the type of element.
 */
acgraph.vector.vml.ShapeType.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.SHAPE_TYPE;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.vml.ShapeType.prototype.disposeInternal = function() {
  delete this.fill_;
  delete this.stroke_;

  goog.dom.removeNode(this.fillDomElement);
  this.fillDomElement = null;

  goog.dom.removeNode(this.strokeDomElement);
  this.strokeDomElement = null;
};
