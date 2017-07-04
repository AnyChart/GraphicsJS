goog.provide('acgraph.vector.TextSegment');

goog.require('acgraph.utils.IdGenerator');
goog.require('goog.Disposable');



/**
 * Text Segment. The part of the text that have own style and params of position relative other text segments.
 * TextSegment used for parsing text. Text {@link acgraph.vector.Text} is parsed on text segments.
 * Cause creation of text segments maybe various - text don't fit in the defined size of text block or part of the text
 * have some another style different from the rest.
 * @name acgraph.vector.TextSegment
 * @param {string} text Text.
 * @param {acgraph.vector.TextSegmentStyle} style Style.
 * @constructor
 * @extends {goog.Disposable}
 *
 */
acgraph.vector.TextSegment = function(text, style) {
  goog.base(this);

  /**
   * Segment style.
   * @type {acgraph.vector.TextSegmentStyle}
   * @private
   */
  this.style_ = style || {};

  /**
   * Segment text.
   * @type {string}
   */
  this.text = text;

  /**
   * Is first text segment in line.
   * @type {boolean}
   */
  this.firstInLine = false;

  /**
   * Distance between the top of the segment and its baseline.
   * @type {number}
   */
  this.baseLine = 0;

  /**
   * Segment width.
   * @type {number}
   */
  this.width = 0;

  /**
   * Segment height.
   * @type {number}
   */
  this.height = 0;

  /**
   * Segment X offset.
   * @type {number}
   */
  this.dx = 0;

  /**
   * Segment Y offset.
   * @type {number}
   */
  this.dy = 0;

  /**
   * Coordinate X in parent coordinate system.
   * @type {number}
   */
  this.x = 0;

  /**
   * Coordinate Y in parent coordinate system.
   * @type {number}
   */
  this.y = 0;
};
goog.inherits(acgraph.vector.TextSegment, goog.Disposable);


/**
 * DOM element.
 * @private
 * @type {Element}
 */
acgraph.vector.TextSegment.prototype.domElement_ = null;


/**
 * Parent container. For the text segment of parent is text element.
 * @type {acgraph.vector.Text}
 * @private
 */
acgraph.vector.TextSegment.prototype.parent_ = null;


/**
 * If opt_value is passed and is not null, adds the TextSegment to a passed Text as a child and returns itself.
 * If null passed - removes the TextSegment from current Text and returns itself.
 * If nothing passed - returns current parent Text.
 * @param {acgraph.vector.Text=} opt_value Parent - text element.
 * @return {(acgraph.vector.TextSegment|acgraph.vector.Text)} Returns parent text or itself depending on
 *      opt_value presence.
 */
acgraph.vector.TextSegment.prototype.parent = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.parent_ = opt_value;
    return this;
  } else
    return this.parent_;
};


/**
 * Returns DOM element.
 * @return {Element} DOM Element.
 */
acgraph.vector.TextSegment.prototype.domElement = function() {
  return this.domElement_;
};


/**
 * Returns type prefix.
 * @return {acgraph.utils.IdGenerator.ElementTypePrefix} Type prfix.
 */
acgraph.vector.TextSegment.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.TEXT_SEGMENT;
};


/**
 * Returns segment style.
 * @return {acgraph.vector.TextSegmentStyle} Style.
 */
acgraph.vector.TextSegment.prototype.getStyle = function() {
  return this.style_;
};


/**
 * Sets segment style.
 * @param {acgraph.vector.TextSegmentStyle} value Style.
 */
acgraph.vector.TextSegment.prototype.setStyle = function(value) {
  this.style_ = value;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Set position for text segment.
 */
acgraph.vector.TextSegment.prototype.setTextSegmentPosition = function() {
  if (this.domElement_) acgraph.getRenderer().setTextSegmentPosition(this);
};


/**
 * Set style, events and others properties for text segment.
 */
acgraph.vector.TextSegment.prototype.setTextSegmentProperties = function() {
  if (this.domElement_) acgraph.getRenderer().setTextSegmentProperties(this);
};


/**
 * Set text for text segment.
 */
acgraph.vector.TextSegment.prototype.renderData = function() {
  if (this.text == '') return;
  this.domElement_ = acgraph.getRenderer().createTextSegmentElement();
  this.setTextSegmentProperties();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.TextSegment.prototype.disposeInternal = function() {
  acgraph.getRenderer().removeNode(this.domElement_);
  this.domElement_ = null;

  goog.base(this, 'disposeInternal');
};
