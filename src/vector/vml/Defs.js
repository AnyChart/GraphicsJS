goog.provide('acgraph.vector.vml.Defs');
goog.require('acgraph.vector.Defs');
goog.require('acgraph.vector.vml.RadialGradient');
goog.require('acgraph.vector.vml.ShapeType');



/**
 * VML Defs is a class for caching settings of VML objects and increasing the reusability of VML DOM elements. It takes VML
 * as well as its execution environment (IE<10) quite a long time to process DOM elements, so for VML minimizing DOM elements
 * is a critical task. The class palys the role of an element manager: elements can be
 * assigned to other VML elements (using a reference to their IDs), which will inherit their properties. In VML
 * ShapeType elements are used for that. They are hidden by default, but if a ShapeType element is
 * assigned using a reference to, for example, a Shape element, the latter inherits the ShapeType propeties and applies them to the shape. In a ShapeType
 * you can also define subnodes, such as fill, stroke, skew, textpath, and so on. A Shape element to which such a ShapeType
 * will be applied will inherit all its properties and will be painted with the given fill and stroke. Let us suppose there are 1000 Shape elements
 * with the same fill and stroke (that require DOM elements). Without a ShapeType, one would have to assign fill and stroke as DOM elements
 * for each object, which woul lead to the creation of 3000 DOM elements. When a ShapeType is used,
 * the fill and stroke DOM elements are added to it as subnodes, and in the type field of all the shapes the id of the ShapeType element is indicated,
 * so, as a result, 1003 DOM elements are created.
 * It is the VML renderer that decides whether to use ShapeType or not.
 * @see {acgraph.vector.vml.Renderer#applyFillAndStroke}
 * @param {!acgraph.vector.Stage} stage Stage.
 * @extends {acgraph.vector.Defs}
 * @constructor
 */
acgraph.vector.vml.Defs = function(stage) {
  goog.base(this, stage);
  /**
   * An object for caching ShapeType elements.
   * @type {Object.<string, !acgraph.vector.vml.ShapeType>}
   * @private
   */
  this.shapeTypes_ = {};
  /**
   * Radial gradients that are already created.
   * @type {Object.<string, !acgraph.vector.vml.RadialGradient>}
   * @private
   */
  this.radialVMLGradients_ = {};
};
goog.inherits(acgraph.vector.vml.Defs, acgraph.vector.Defs);


/** @inheritDoc */
acgraph.vector.vml.Defs.prototype.clear = function() {
  goog.object.clear(this.shapeTypes_);
  goog.object.clear(this.radialVMLGradients_);

  goog.base(this, 'clear');
};


/**
 * Returns a ShapeType element for a set of fill and stroke elements. If a ShapeType element with such set of fill and stroke elements already exists,
 * its object is returned, otherwise a new object is created, cached, and returned.
 * @param {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient)} fill A fill of a shape.
 * @param {!acgraph.vector.Stroke} stroke An outline of a shape.
 * @return {!acgraph.vector.vml.ShapeType} A pattern for a shape.
 */
acgraph.vector.vml.Defs.prototype.getShapeType = function(fill, stroke) {
  /** @type {!string} */
  var shapeTypeId = '' + this.serializeFill(fill) + this.serializeStroke(stroke);
  if (goog.object.containsKey(this.shapeTypes_, shapeTypeId)) return this.shapeTypes_[shapeTypeId];
  /** @type {!acgraph.vector.vml.ShapeType} */
  var shapeType = new acgraph.vector.vml.ShapeType(fill, stroke);
  this.shapeTypes_[shapeTypeId] = shapeType;
  return shapeType;
};


/**
 * Returns the fill parameters as a string.
 * @param {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.RadialGradient)} fill The object
 * of the fill.
 * @return {!string} The string representation.
 */
acgraph.vector.vml.Defs.prototype.serializeFill = function(fill) {
  var stringParam = '';
  if (goog.isString(fill)) {
    stringParam += fill + '1';
  } else if (acgraph.utils.instanceOf(fill, acgraph.vector.RadialGradient)) {
    /** @type {acgraph.vector.vml.RadialGradient} */
    var rg = /** @type {acgraph.vector.vml.RadialGradient} */(fill);
    stringParam = acgraph.vector.vml.RadialGradient.serialize(rg.keys, rg.cx, rg.cy, rg.size_x, rg.size_y, rg.opacity, rg.bounds);
  } else if (acgraph.utils.instanceOf(fill, acgraph.vector.LinearGradient)) {
    /** @type {acgraph.vector.LinearGradient} */
    var lg = /** @type {acgraph.vector.LinearGradient} */(fill);
    stringParam = acgraph.vector.LinearGradient.serialize(lg.keys, lg.opacity, lg.angle, lg.mode);
  } else {
    stringParam += fill['color'] + fill['opacity'];
  }
  return stringParam;
};


/**
 * Returns a radial gradient. If a radial gradient with such param already exists, then its object
 * is returned. Otherwise a new instance is created and returned.
 * @param {!Array.<acgraph.vector.GradientKey>} keys Color-stop gradient keys.
 * @param {number} cx The X-coordinate of the center of the gradient.
 * @param {number} cy The Y-coordinate of the center of the gradient.
 * @param {number} size_x The size of the radial gradient along the X-axis.
 * @param {number} size_y The size of the radial gradient along the Y-axis.
 * @param {number} opacity The opacity of the gradient.
 * @param {goog.math.Rect=} opt_mode If defined, then the userSpaceOnUse mode is used, otherwise objectBoundingBox is used.
 * @return {!acgraph.vector.vml.RadialGradient} The object of the radial gradient.
 */
acgraph.vector.vml.Defs.prototype.getVMLRadialGradient = function(keys, cx, cy, size_x, size_y, opacity, opt_mode) {
  //  goog.array.forEach(keys, function(a) {
  //    a.offset = goog.isDefAndNotNull(a['offset']) ? goog.math.clamp(a['offset'], 0, 1) : 1;
  //    a.color = goog.isDefAndNotNull(a['color']) ? a['color'] : '';
  //    a.opacity = goog.isDefAndNotNull(a['opacity']) ? goog.math.clamp(a['opacity'], 0, 1) : null;
  //  });
  //  goog.array.sortObjectsByKey(keys, 'offset');

  var bounds = goog.isDefAndNotNull(opt_mode) ? opt_mode : null;

  var id = acgraph.vector.vml.RadialGradient.serialize(keys, cx, cy, size_x, size_y, opacity, bounds);

  if (goog.object.containsKey(this.radialVMLGradients_, id)) return this.radialVMLGradients_[id];

  return this.radialVMLGradients_[id] = new acgraph.vector.vml.RadialGradient(keys, cx, cy, size_x, size_y, opacity, bounds);
};


/**
 * Removes a radial gradient form defs and DOM.
 * @param {!acgraph.vector.RadialGradient} element The radial gradient to remove.
 */
acgraph.vector.vml.Defs.prototype.removeRadialGradient = function(element) {
  var id = acgraph.vector.RadialGradient.serialize(
      element.keys, element.cx, element.cy, element.size_x, element.size_y, element.opacity, element.bounds);
  var shapeTypes = /** @type {Array.<acgraph.vector.vml.ShapeType>} */ (goog.object.getValues(this.shapeTypes_));
  for (var i = 0, len = shapeTypes.length; i < len; i++) {
    var shapeType = shapeTypes[i];
    if (shapeType.getFill() == element) shapeType.removeFill();
  }
  if (goog.object.containsKey(this.radialVMLGradients_, id)) goog.object.remove(this.radialVMLGradients_, id);
};


/**
 * Removes a linear gradient form defs and DOM.
 * @param {!acgraph.vector.LinearGradient} element The linear gradient to remove.
 */
acgraph.vector.vml.Defs.prototype.removeLinearGradient = function(element) {
  var id = acgraph.vector.LinearGradient.serialize(element.keys, element.opacity, element.angle, element.mode);
  var shapeTypes = /** @type {Array.<acgraph.vector.vml.ShapeType>} */ (goog.object.getValues(this.shapeTypes_));
  for (var i = 0, len = shapeTypes.length; i < len; i++) {
    var shapeType = shapeTypes[i];
    if (shapeType.getFill() == element) shapeType.removeFill();
  }

  var linearGradients = this.getLinearGradients();
  if (goog.object.containsKey(linearGradients, id)) goog.object.remove(linearGradients, id);
};


/**
 * Returns the parameters of a stroke as a string.
 * @param {!acgraph.vector.Stroke} value The stroke object.
 * @return {!string} The string representation.
 */
acgraph.vector.vml.Defs.prototype.serializeStroke = function(value) {
  var strokeColor;
  if (goog.isString(value))
    strokeColor = /** @type {string} */(value);
  else if ('keys' in value) {// A gradient stroke is not supported in VML, so it is colored with the color of the first gradient key.
    var obj = (value['keys'].length != 0) ? value['keys'][0] : value;
    strokeColor = obj['color'] || 'black';
    strokeColor += 'opacity' in obj ? obj['opacity'] : 1;
  } else {
    strokeColor = value['color'];
    strokeColor += 'opacity' in value ? value['opacity'] : 1;
  }
  return '' + value['thickness'] + strokeColor + value['lineJoin'] + value['lineCap'] + value['dash'];
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.vml.Defs.prototype.disposeInternal = function() {
  for (var i in this.shapeTypes_)
    goog.dispose(this.shapeTypes_[i]);
  this.shapeTypes_ = null;

  goog.base(this, 'disposeInternal');
};
