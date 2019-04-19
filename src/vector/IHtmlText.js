goog.provide('acgraph.vector.IHtmlText');



//region -- IHtmlText interface.
/**
 * Interface to represent an entity that implements special HTML-parsing API.
 * Represented API is used by HTMLParser.
 * @interface
 */
acgraph.vector.IHtmlText = function() {};


/**
 * Adds text segment with the constant style.
 * Source HTML-text like '<b>First segment <i>Second segment</i></b>' will be
 * separated with addSegment() method like
 *  - 'First segment', style is 'bold'.
 *  - 'Second segment', style is 'bold, italic'.
 *
 * @param {string} text - The text of segment without tags and EOLs.
 * @param {?acgraph.vector.TextSegmentStyle=} opt_style - Segment style.
 * @param {boolean=} opt_break - Whether is break. In current implementation it is
 *  implied that this parameter can be actually used in addBreak() method to add
 *  break as text segment with following parameters:
 *    {code}
 *      this.addSegment('', null, true);
 *    {code}
 */
acgraph.vector.IHtmlText.prototype.addSegment = function(text, opt_style, opt_break) {};


/**
 * Adds break.
 * Actually is an analogue of '\n' in HTML markup:
 * parsing the 'line1<br/>line2' will call addBreak() on '<br/>'.
 */
acgraph.vector.IHtmlText.prototype.addBreak = function() {};


/**
 * Finalizes text line.
 * Performs additional actions on text parsing complete.
 */
acgraph.vector.IHtmlText.prototype.finalizeTextLine = function() {};


/**
 * Getter/setter for IHtmlText text value.
 * @param {string=} opt_value - HTML string value.
 * @return {string|acgraph.vector.IHtmlText} - Current value or itself for chaining.
 */
acgraph.vector.IHtmlText.prototype.text = function(opt_value) {};


//endregion
