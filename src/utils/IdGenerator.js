goog.provide('acgraph.utils.IdGenerator');



/**
 * Unique ID generator.
 * @constructor
 */
acgraph.utils.IdGenerator = function() {
};
goog.addSingletonGetter(acgraph.utils.IdGenerator);

//----------------------------------------------------------------------------------------------------------------------
//
//  Enums
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Element types enum.
 * @enum {string}
 */
acgraph.utils.IdGenerator.ElementTypePrefix = {
  STAGE: 'stage',
  FILL: 'fill',
  FILL_PATTERN: 'fillPattern',
  HATCH_FILL: 'hatchFill',
  IMAGE_FILL: 'imageFill',
  STROKE: 'stroke',
  LAYER: 'layer',
  UNMANAGEABLE_LAYER: 'unmanageablelayer',
  RECT: 'rect',
  CIRCLE: 'circle',
  ELLIPSE: 'ellipse',
  PATH: 'path',
  GRADIENT_KEY: 'gKey',
  LINEAR_GRADIENT: 'linearGradient',
  RADIAL_GRADIENT: 'radialGradient',
  TEXT: 'text',
  SIMPLE_TEXT: 'simpleText',
  TEXT_SEGMENT: 'tSegment',
  IMAGE: 'image',
  CLIP: 'clip',
  SHAPE_TYPE: 'shapeType'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Counter for uniqueness of each next ID. When a new ID is generated, the counter is increased by 1.
 * @type {number}
 * @private
 */
acgraph.utils.IdGenerator.prototype.nextId_ = 0;


/**
 * Prefix for IDs.
 * @type {string}
 * @private
 */
acgraph.utils.IdGenerator.prototype.prefix_ = 'ac';


/**
 * A name for an ID field. It is needed to avoid conflicts with other components.
 * @type {string}
 * @private
 */
acgraph.utils.IdGenerator.prototype.uid_property_ = 'ac_uid_' + ((Math.random() * 1e9) >>> 0);


//----------------------------------------------------------------------------------------------------------------------
//
//  ID Generation
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Returns the unique ID of an object. The identifier of an element cannot be changed.
 * @param {Object} obj The given object.
 * @param {string=} opt_prefix A custom prefix that overrides obj.getElementTypePrefix.
 * @return {string} The unique identifier.
 */
acgraph.utils.IdGenerator.prototype.identify = function(obj, opt_prefix) {
  return obj[this.uid_property_] || (obj[this.uid_property_] = this.generateId(obj, opt_prefix));
};


/**
 * Creates a unique ID for an object. If the object has a type prefix, the ID will be generated according to
 * this prefix.
 * @param {Object} obj The object for which an ID is generated.
 * @param {string=} opt_prefix A custom prefix that overrides obj.getElementTypePrefix.
 * @return {string} The unique ID.
 */
acgraph.utils.IdGenerator.prototype.generateId = function(obj, opt_prefix) {
  var typePrefix = goog.isDef(opt_prefix) ? opt_prefix : (obj.getElementTypePrefix ? obj.getElementTypePrefix() : '');
  return [this.prefix_, typePrefix, (this.nextId_++).toString(36)].join('_');
};
