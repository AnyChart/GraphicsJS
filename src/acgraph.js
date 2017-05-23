/**
 * @fileoverview acgraph namespace file.
 * @suppress {extraRequire}
 */

goog.provide('acgraph');
goog.require('acgraph.compatibility');
goog.require('acgraph.vector');
goog.require('acgraph.vector.Circle');
goog.require('acgraph.vector.Clip');
goog.require('acgraph.vector.Ellipse');
goog.require('acgraph.vector.HatchFill');
goog.require('acgraph.vector.Image');
goog.require('acgraph.vector.Layer');
goog.require('acgraph.vector.Path');
goog.require('acgraph.vector.PatternFill');
goog.require('acgraph.vector.Rect');
goog.require('acgraph.vector.Renderer');
goog.require('acgraph.vector.SimpleText');
goog.require('acgraph.vector.Text');
goog.require('acgraph.vector.UnmanagedLayer');
goog.require('acgraph.vector.primitives');
goog.require('acgraph.vector.svg');
goog.require('acgraph.vector.vml');
goog.require('goog.dom');
goog.require('goog.net.IframeIo');
goog.require('goog.userAgent');


/**
 * Wrapper identifier attribute name.
 * @type {string}
 * @private
 */
acgraph.WRAPPER_ID_PROP_NAME_ = 'data-ac-wrapper-id';


/**
 * Wrappers map.
 * @type {Object.<string, acgraph.vector.Element|acgraph.vector.Stage>}
 * @private
 */
acgraph.wrappers_ = {};


/**
 * Registers wrapper to allow it to handle browser events.
 * @param {acgraph.vector.Element|acgraph.vector.Stage} wrapper
 */
acgraph.register = function(wrapper) {
  var node = wrapper.domElement();
  if (node) {
    var id = String(goog.getUid(wrapper));
    acgraph.wrappers_[id] = wrapper;
    node.setAttribute(acgraph.WRAPPER_ID_PROP_NAME_, id);
  }
};


/**
 * Deregisters the wrapper.
 * @param {acgraph.vector.Element|acgraph.vector.Stage} wrapper
 */
acgraph.unregister = function(wrapper) {
  delete acgraph.wrappers_[String(goog.getUid(wrapper))];
  var node = wrapper.domElement();
  if (node)
    node.removeAttribute(acgraph.WRAPPER_ID_PROP_NAME_);
};


/**
 * Fetches wrapper element by DOM node.
 * @param {Element} node
 * @param {acgraph.vector.Stage} stage
 * @return {acgraph.vector.Element|acgraph.vector.Stage}
 */
acgraph.getWrapperForDOM = function(node, stage) {
  var uid;
  var domRoot = stage.domElement().parentNode;
  while (node && node != domRoot) {
    uid = node.getAttribute && node.getAttribute(acgraph.WRAPPER_ID_PROP_NAME_) || null;
    if (goog.isDefAndNotNull(uid))
      break;
    node = /** @type {Element} */(node.parentNode);
  }
  var res = acgraph.wrappers_[uid || ''] || null;
  return (res && res.domElement() == node) ? res : null;
};


/**
 * A namespace of all functions, objects, and classes provided by AnyChart Stage.
 * @namespace
 * @name acgraph
 *
 */
//----------------------------------------------------------------------------------------------------------------------
//
//  Enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Stage types supported by AnyChart Data Visualization Toolkit.
 @enum {string}
 */
acgraph.StageType = {
  /**
   A vector drawing technology compatible with the majority of modern browsers (both desktop and mobile).
   It is used as the main drawing technology.<br/>
   See more at <a href="http://en.wikipedia.org/wiki/Scalable_Vector_Graphics" target="_blank">Wiki Page</a>
   */
  SVG: 'svg',

  /**
   A vector drawing technology compatible only with  Microsoft Internet Explorer (versions 6-8).
   It is used as an alternative for SVG because SVG is not supported by IE.<br/>
   See more at <a href="http://en.wikipedia.org/wiki/Vector_Markup_Language" target="_blank">Wiki Page</a>
   */
  VML: 'vml'
};


//----------------------------------------------------------------------------------------------------------------------
//
// Instantiate stage
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported Stage Type Cache.
 * @type {?acgraph.StageType}
 * @private
 */
acgraph.type_ = null;


if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) {
  acgraph.type_ = acgraph.StageType.VML;
} else {
  acgraph.type_ = acgraph.StageType.SVG;
}


/**
 Returns the Stage type recommended for the current browser (identified by a name and version), which is selected from
 the supported Stage types.
 @return {acgraph.StageType} A Stage type supported by the current browser.
 */
acgraph.type = function() {
  return /** @type {acgraph.StageType} */(acgraph.type_);
};


/**
 * @type {!acgraph.vector.Renderer}
 * @private
 */
acgraph.renderer_ = (acgraph.type_ == acgraph.StageType.VML) ?
    acgraph.vector.vml.Renderer.getInstance() :
    acgraph.vector.svg.Renderer.getInstance();


/**
 * Returns renderer object.
 * @return {!acgraph.vector.Renderer} Renderer.
 */
acgraph.getRenderer = function() {
  return acgraph.renderer_;
};


/**
 * Creates and returns a Stage object providing instruments for cross-browser drawing with a commnon interface
 * for <u>all</u> supported technologies.
 * @see acgraph.StageType
 * @param {(Element|string)=} opt_container A container where all graphics will be drawn.
 * It can be defined later, for example while rendering.
 * @param {(string|number)=} opt_width The width of a Stage object in pixels.
 * @param {(string|number)=} opt_height The height of a Stage object in pixels.
 * @return {!acgraph.vector.Stage} A Stage object for cross-browser drawing with a common interface for
 * all supported technologies.
 */
acgraph.create = function(opt_container, opt_width, opt_height) {
  return (acgraph.type_ == acgraph.StageType.VML) ?
      new acgraph.vector.vml.Stage(opt_container, opt_width, opt_height) :
      new acgraph.vector.svg.Stage(opt_container, opt_width, opt_height);
};


//----------------------------------------------------------------------------------------------------------------------
//
//                  Export server.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Export server address including port.
 * @type {string}
 */
acgraph.exportServer = '//export.anychart.com';


/**
 Sets and returns an address export server script, which is used to export to an image
 or PDF.
 @see acgraph.vector.Stage#saveAsPdf
 @see acgraph.vector.Stage#saveAsPng
 @see acgraph.vector.Stage#saveAsJpg
 @see acgraph.vector.Stage#saveAsSvg
 @param {string=} opt_address Export server script URL.
 @return {string} Export server script URL.
 */
acgraph.server = function(opt_address) {
  if (goog.isDef(opt_address)) {
    acgraph.exportServer = opt_address;
  }
  return acgraph.exportServer;
};


/**
 * Send form POST request on passed url with passed request params.
 * @param {string} url .
 * @param {Object.<string, *>=} opt_arguments .
 */
acgraph.sendRequestToExportServer = function(url, opt_arguments) {
  goog.net.IframeIo.send(url, undefined, 'POST', false, opt_arguments);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  CSS
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Embeds default anychart style node.
 * @param {string} css - CSS string to be embedded.
 * @param {Document=} opt_doc Optional element to insert in.
 * @return {?Element} Inserted Style element.
 */
acgraph.embedCss = function(css, opt_doc) {
  var styleElement = null;
  if (css) {
    styleElement = goog.dom.createDom(goog.dom.TagName.STYLE);
    styleElement.type = 'text/css';

    if (styleElement.styleSheet)
      styleElement['styleSheet']['cssText'] = css;
    else
      goog.dom.appendChild(styleElement, goog.dom.createTextNode(css));

    goog.dom.insertChildAt(goog.dom.getElementsByTagNameAndClass('head', undefined, opt_doc)[0], styleElement, 0);
  }
  return styleElement;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Default font settings
//
//----------------------------------------------------------------------------------------------------------------------
goog.global['acgraph'] = goog.global['acgraph'] || {};


/**
 * Default value for size of font.
 * @type {string}
 *
 */
goog.global['acgraph']['fontSize'] = '10px';


/**
 * Default value for color of font
 * @type {string}
 *
 */
goog.global['acgraph']['fontColor'] = '#000';


/**
 * Default value for direction of text. Text direction may be left-to-right or right-to-left.
 * @type {string}
 *
 */
goog.global['acgraph']['textDirection'] = acgraph.vector.Text.Direction.LTR;


/**
 * Default value for style of font.
 * @type {string}
 *
 */
goog.global['acgraph']['fontFamily'] = 'Verdana';
//endregion


/**
 Creates an instance ot the {@link acgraph.vector.Rect} class.<br/>
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 @param {number=} opt_x The X-coordinate (left) of the top-left corner of the rectangle.
 @param {number=} opt_y The Y-coordinate (left) of the top-left corner of the rectangle.
 @param {number=} opt_width The width of the rectangle.
 @param {number=} opt_height The height of the rectangel.
 @return {!acgraph.vector.Rect} The instance of the {@link acgraph.vector.Rect} class.
 */
acgraph.rect = function(opt_x, opt_y, opt_width, opt_height) {
  return new acgraph.vector.Rect(opt_x, opt_y, opt_width, opt_height);
};


/**
 Creates an instance of the {@link acgraph.vector.Circle} class <br/>
 To learn more about working with circles, see: {@link acgraph.vector.Circle}
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 @param {number=} opt_cx The X-coordinate of the center of the circle in pixels.
 @param {number=} opt_cy The Y-coordinate of the center of the circle in pixels.
 @param {number=} opt_radius The radius of the circle in pixels.
 @return {!acgraph.vector.Circle} An instance of the {@link acgraph.vector.Circle} class.
 */
acgraph.circle = function(opt_cx, opt_cy, opt_radius) {
  return new acgraph.vector.Circle(opt_cx, opt_cy, opt_radius);
};


/**
 Creates an instance of the {@link acgraph.vector.Layer} class.<br/>
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 @return {!acgraph.vector.Layer} The instance of the{@link acgraph.vector.Layer} class.
 */
acgraph.layer = function() {
  return new acgraph.vector.Layer();
};


/**
 Creates an instance of the {@link acgraph.vector.Ellipse} class.<br/>
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 To learn more about working with ellipses, see: {@link acgraph.vector.Ellipse}
 @param {number=} opt_cx The X-coordinate of the center of the ellipse in pixels.
 @param {number=} opt_cy The Y-coordinate of the center of the ellipse in pixels.
 @param {number=} opt_rx The X-axis radius of the ellipse in pixels.
 @param {number=} opt_ry The Y-axis radius of the ellipse in pixels.
 @return {!acgraph.vector.Ellipse} The instance of the {@link acgraph.vector.Ellipse} class.
 */
acgraph.ellipse = function(opt_cx, opt_cy, opt_rx, opt_ry) {
  return new acgraph.vector.Ellipse(opt_cx, opt_cy, opt_rx, opt_ry);
};


/**
 Creates an instance of the {@link acgraph.vector.Path} class.<br/>
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 To learn more about working with Path, see: {@link acgraph.vector.Path}
 @return {!acgraph.vector.Path} The instance of the {@link acgraph.vector.Path} class.
 */
acgraph.path = function() {
  return new acgraph.vector.Path();
};


/**
 Creates an instance of the {@link acgraph.vector.Image} class.<br/>
 <strong>Important:</strong> acgraph.vector.Stage does not delete the object you have
 created . You should remove the object after using it.
 @param {string=} opt_src The IRI (Internationalized Resource Identifier) of the image source.
 @param {number=} opt_x The X-coordinate of the left-top corner of the image.
 @param {number=} opt_y The Y-coordinate of the left-top corner of the image.
 @param {number=} opt_width The width of the image bounds.
 @param {number=} opt_height The height of the image bounds.
 @return {acgraph.vector.Image} The instance of the {@link acgraph.vector.Image} class.
 */
acgraph.image = function(opt_src, opt_x, opt_y, opt_width, opt_height) {
  return new acgraph.vector.Image(opt_src, opt_x, opt_y, opt_width, opt_height);
};


/**
 Creates, depending on the technology used, an instance of the {@link acgraph.vector.Text}
 or the{@link acgraph.vector.vml.Text} class.<br/>
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 @param {number=} opt_x The X-coordinate (left) of the top-left corner of the text bounds.
 @param {number=} opt_y The Y-coordinate (top) of the top-left corner of the text bounds.
 @param {string=} opt_text The text to display.
 @param {acgraph.vector.TextStyle=} opt_style Text style. See more: {@link acgraph.vector.Text#style}.
 @return {!acgraph.vector.Text} An instance of the {@link acgraph.vector.Text} or the {@link acgraph.vector.vml.Text} class.
 */
acgraph.text = function(opt_x, opt_y, opt_text, opt_style) {
  var text = (acgraph.type_ == acgraph.StageType.VML) ?
      new acgraph.vector.vml.Text(opt_x, opt_y) :
      new acgraph.vector.Text(opt_x, opt_y);
  if (opt_style) text.style(opt_style);
  if (opt_text) text.text(opt_text);
  return text;
};


/**
 Creates, depending on the technology used, an instance of the {@link acgraph.vector.SimpleText} class.<br/>
 <strong>Important:</strong> When an element is created this way, a parent element is not assigned to it automatically,
 so it is necessary to set the parent element manually.
 @param {string=} opt_text The text to display.
 @return {!acgraph.vector.SimpleText} An instance of the {@link acgraph.vector.SimpleText} class.
 */
acgraph.simpleText = function(opt_text) {
  var text = new acgraph.vector.SimpleText();
  if (opt_text) text.text(opt_text);
  return text;
};


/**
 Creates an instance of the{@link acgraph.vector.HatchFill} class in case a fill with such parameters does not
 exist. If there is already a fill with such parameters, an instance of it is returned.<br/>
 To learn more about working with hatch fills, see: {@link acgraph.vector.HatchFill}
 @param {acgraph.vector.HatchFill.HatchFillType=} opt_type The type of the hatch fill.
 @param {string=} opt_color The color of the the hatch combined with opacity.
 @param {number=} opt_thickness The thickness of the hatch fill.
 @param {number=} opt_size The size of the hatch fill.
 @return {!acgraph.vector.HatchFill} The instance of the {@link acgraph.vector.HatchFill} class for method chaining.
 */
acgraph.hatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  return new acgraph.vector.HatchFill(opt_type, opt_color, opt_thickness, opt_size);
};


/**
 Creates an instance of the{@link acgraph.vector.PatternFill} class.<br/>
 To learn more about working with pattern fills, see: {@link acgraph.vector.PatternFill}
 @param {!goog.math.Rect} bounds The bounds of the pattern. Defines the size and offset of the pattern.
 @return {!acgraph.vector.PatternFill} An instance of the {@link acgraph.vector.PatternFill} class for method chaining.
 */
acgraph.patternFill = function(bounds) {
  return new acgraph.vector.PatternFill(bounds);
};


/**
 Creates an instance ot the {@link acgraph.vector.Clip} class.
 @param {(number|Array.<number>|goog.math.Rect|Object|null|acgraph.vector.Shape)=} opt_leftOrShape Left coordinate of bounds
 or rect or array or object representing bounds.
 @param {number=} opt_top Top coordinate.
 @param {number=} opt_width Width of the rect.
 @param {number=} opt_height Height of the rect.
 @return {!acgraph.vector.Clip} The instance of the {@link acgraph.vector.Clip} class.
 */
acgraph.clip = function(opt_leftOrShape, opt_top, opt_width, opt_height) {
  return (acgraph.type_ == acgraph.StageType.VML) ?
      new acgraph.vector.vml.Clip(null, opt_leftOrShape, opt_top, opt_width, opt_height) :
      new acgraph.vector.Clip(null, opt_leftOrShape, opt_top, opt_width, opt_height);
};


/**
 * Creates an instance ot the {@link acgraph.vector.UnmanagedLayer} class.
 * @param {string|Element=} opt_content Layer content.
 * @return {acgraph.vector.UnmanagedLayer} The instance of the {@link acgraph.vector.UnmanagedLayer} class.
 */
acgraph.unmanagedLayer = function(opt_content) {
  return new acgraph.vector.UnmanagedLayer(opt_content);
};


//----------------------------------------------------------------------------------------------------------------------
//
// Reference to url(). For <base> bug.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Use absolute path to defs.
 * True -> url(http://anychart.com/chart.html?query=param##ac_clip_1)
 * False -> url(##ac_clip_1)
 * null -> auto detect (if exist <base> tag)
 * @param {?boolean=} opt_value Value to set.
 * @return {boolean|undefined} Current value.
 */
acgraph.useAbsoluteReferences = function(opt_value) {
  if (goog.isDef(opt_value)) {
    acgraph.compatibility.USE_ABSOLUTE_REFERENCES = opt_value;
  } else {
    return !!acgraph.getReference();
  }
};


/**
 * Cached reference value.
 * @type {string|undefined}
 * @private
 */
acgraph.getReferenceValue_ = undefined;


/**
 * Returns path prefix to defs.
 * @return {string} Path prefix.
 */
acgraph.getReference = function() {
  if (goog.isDef(acgraph.getReferenceValue_)) return acgraph.getReferenceValue_;

  // isIe9
  if (goog.userAgent.IE &&
      goog.userAgent.isVersionOrHigher('9') &&
      !goog.userAgent.isVersionOrHigher('10')) return acgraph.getReferenceValue_ = '';

  return acgraph.getReferenceValue_ = acgraph.compatibility.USE_ABSOLUTE_REFERENCES ||
      (goog.isNull(acgraph.compatibility.USE_ABSOLUTE_REFERENCES) && goog.dom.getElementsByTagNameAndClass('base').length) ?
          window.location.origin + window.location.pathname + window.location.search :
          '';
};


/**
 * Update paths to defs.
 * Affected: 'fill', 'stroke', 'clip-path'.
 */
acgraph.updateReferences = function() {
  var oldReference = acgraph.getReferenceValue_;
  acgraph.getReferenceValue_ = undefined;
  if (!goog.isDef(oldReference) || acgraph.getReference() == oldReference) return;

  var wrapper;
  var renderer = acgraph.getRenderer();

  for (var id in acgraph.wrappers_) {
    if (!acgraph.wrappers_.hasOwnProperty(id)) continue;
    wrapper = acgraph.wrappers_[id];
    var wrapperStage = wrapper.getStage();
    if (!wrapperStage) continue;

    // clip-path
    if (wrapper instanceof acgraph.vector.Element) {
      if (wrapperStage.isSuspended()) {
        wrapper.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
      } else if (!wrapper.hasDirtyState(acgraph.vector.Element.DirtyState.CLIP)) {
        renderer.setClip(wrapper);
      }
    }

    // fill, stroke
    if (wrapper instanceof acgraph.vector.Shape) {
      if (wrapperStage.isSuspended()) {
        wrapper.setDirtyState(acgraph.vector.Element.DirtyState.FILL | acgraph.vector.Element.DirtyState.STROKE);
      } else {
        if (!wrapper.hasDirtyState(acgraph.vector.Element.DirtyState.FILL)) renderer.applyFill(wrapper);
        if (!wrapper.hasDirtyState(acgraph.vector.Element.DirtyState.STROKE)) renderer.applyStroke(wrapper);
      }
    }
  }
};

//exports
(function() {
  goog.exportSymbol('acgraph.create', acgraph.create);
  goog.exportSymbol('acgraph.type', acgraph.type);
  goog.exportSymbol('acgraph.server', acgraph.server);
  goog.exportSymbol('acgraph.StageType.SVG', acgraph.StageType.SVG);
  goog.exportSymbol('acgraph.StageType.VML', acgraph.StageType.VML);
  goog.exportSymbol('acgraph.rect', acgraph.rect);
  goog.exportSymbol('acgraph.circle', acgraph.circle);
  goog.exportSymbol('acgraph.ellipse', acgraph.ellipse);
  goog.exportSymbol('acgraph.path', acgraph.path);
  goog.exportSymbol('acgraph.text', acgraph.text);
  goog.exportSymbol('acgraph.layer', acgraph.layer);
  goog.exportSymbol('acgraph.image', acgraph.image);
  goog.exportSymbol('acgraph.hatchFill', acgraph.hatchFill);
  goog.exportSymbol('acgraph.patternFill', acgraph.patternFill);
  goog.exportSymbol('acgraph.clip', acgraph.clip);
  goog.exportSymbol('acgraph.useAbsoluteReferences', acgraph.useAbsoluteReferences);
  goog.exportSymbol('acgraph.updateReferences', acgraph.updateReferences);
})();
