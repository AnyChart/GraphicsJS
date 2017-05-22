goog.provide('acgraph.vector.svg.Renderer');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Renderer');
goog.require('goog.dom');
goog.require('goog.math.Line');
goog.require('goog.math.Rect');
goog.require('goog.object');
goog.require('goog.userAgent');



/**
 * This class implements the SVG graphics renderer. It is used to intitialize the environment for
 * working with SVG, to create graphic SVG primitives, and to set attributes to them.
 * @constructor
 * @extends {acgraph.vector.Renderer}
 */
acgraph.vector.svg.Renderer = function() {
  goog.base(this);
};
goog.inherits(acgraph.vector.svg.Renderer,
    acgraph.vector.Renderer);
goog.addSingletonGetter(acgraph.vector.svg.Renderer);


//----------------------------------------------------------------------------------------------------------------------
//
//  Static members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * URI spaces for SVG names.
 * @private
 * @type {string}
 */
acgraph.vector.svg.Renderer.SVG_NS_ = 'http://www.w3.org/2000/svg';


/**
 * An XLink URI namespace.
 * @type {string}
 * @private
 */
acgraph.vector.svg.Renderer.XLINK_NS_ = 'http://www.w3.org/1999/xlink';


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Desc.
 * @type {Element}
 * @private
 */
acgraph.vector.svg.Renderer.prototype.measurement_ = null;


/**
 * Desc.
 * @type {Element}
 * @private
 */
acgraph.vector.svg.Renderer.prototype.measurementText_ = null;


/**
 * Desc.
 * @type {Node}
 * @private
 */
acgraph.vector.svg.Renderer.prototype.measurementTextNode_ = null;


/**
 * Element for svg node measuring.
 * @type {Element}
 * @private
 */
acgraph.vector.svg.Renderer.prototype.measurementGroupNode_ = null;


/**
 * Image loader.
 * @type {goog.net.ImageLoader}
 * @private
 */
acgraph.vector.svg.Renderer.prototype.imageLoader_ = null;


//----------------------------------------------------------------------------------------------------------------------
//
//  Attributes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Creates an SVG element with a given name.
 * @param {string} tag The tag name.
 * @return {!Element} The HTML element.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.createSVGElement_ = function(tag) {
  return goog.dom.getDocument().createElementNS(
      acgraph.vector.svg.Renderer.SVG_NS_,
      tag
  );
};


/**
 * Sets a given attribute with a given value for a given element.
 * @param {Element} el The element.
 * @param {string} key The name of the attribute.
 * @param {(string|number)} value The value of the attribute.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.setAttribute_ = function(el, key, value) {
  el.setAttribute(key, value);
};


/**
 * Removes an attribute with a given name from a given element.
 * @param {Element} el The element.
 * @param {string} key The name of the attribute.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.removeAttribute_ = function(el, key) {
  el.removeAttribute(key);
};


/**
 * Sets attributes to a given element. They are set as  a hash array, where each key is a name of a particular attribute.
 * @param {Element} el The element.
 * @param {Object} attrs The hash array of attributes.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.setAttributes_ = function(el, attrs) {
  goog.object.forEach(attrs, function(val, key) {
    this.setAttribute_(el, key, val);
  }, this);
};


/**
 * @param {Element} el Target element.
 * @param {string} key Attribute key.
 * @return {*} Attribute value.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.getAttribute_ = function(el, key) {
  return el.getAttribute(key);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Attributes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Desc.
 */
acgraph.vector.svg.Renderer.prototype.createMeasurement = function() {
  this.measurement_ = this.createSVGElement_('svg');
  this.measurementText_ = this.createTextElement();
  this.measurementTextNode_ = this.createTextNode('');

  goog.dom.appendChild(this.measurementText_, this.measurementTextNode_);
  goog.dom.appendChild(this.measurement_, this.measurementText_);
  goog.dom.appendChild(goog.dom.getDocument().body, this.measurement_);

  this.measurementLayerForBBox_ = this.createLayerElement();
  goog.dom.appendChild(this.measurement_, this.measurementLayerForBBox_);

  //We need set 'display: block' for <svg> element to prevent scrollbar on 100% height of parent container (see DVF-620)
  this.setAttributes_(this.measurement_, {'display': 'block', 'width': 0, 'height': 0});

  this.measurementGroupNode_ = this.createLayerElement();
  goog.dom.appendChild(this.measurement_, this.measurementGroupNode_);
};


/**
 * Measures text.
 * @param {string} text The text to measure.
 * @param {Object} style The style of text.
 * @return {goog.math.Rect} Text borders.
 */
acgraph.vector.svg.Renderer.prototype.measure = function(text, style) {
  //if (text == '') return new goog.math.Rect(0, 0, 0, 0);
  if (!this.measurement_) this.createMeasurement();

  var spaceWidth = null;
  var additionWidth = 0;

  if (text.length == 0) {
    return this.getEmptyStringBounds(style);
  }

  if (goog.string.isSpace(text)) {
    return this.getSpaceBounds(style);
  } else {
    if (goog.string.startsWith(text, ' '))
      additionWidth += spaceWidth = this.getSpaceBounds(style).width;
    if (goog.string.endsWith(text, ' '))
      additionWidth += spaceWidth || this.getSpaceBounds(style).width;
  }

  style['fontStyle'] ?
      this.setAttribute_(this.measurementText_, 'font-style', style['fontStyle']) :
      this.removeAttribute_(this.measurementText_, 'font-style');

  style['fontVariant'] ?
      this.setAttribute_(this.measurementText_, 'font-variant', style['fontVariant']) :
      this.removeAttribute_(this.measurementText_, 'font-variant');

  style['fontFamily'] ?
      this.setAttribute_(this.measurementText_, 'font-family', style['fontFamily']) :
      this.removeAttribute_(this.measurementText_, 'font-family');

  style['fontSize'] ?
      this.setAttribute_(this.measurementText_, 'font-size', style['fontSize']) :
      this.removeAttribute_(this.measurementText_, 'font-size');

  style['fontWeight'] ?
      this.setAttribute_(this.measurementText_, 'font-weight', style['fontWeight']) :
      this.removeAttribute_(this.measurementText_, 'font-weight');

  style['letterSpacing'] ?
      this.setAttribute_(this.measurementText_, 'letter-spacing', style['letterSpacing']) :
      this.removeAttribute_(this.measurementText_, 'letter-spacing');

  style['decoration'] ?
      this.setAttribute_(this.measurementText_, 'text-decoration', style['decoration']) :
      this.removeAttribute_(this.measurementText_, 'text-decoration');

  this.measurementTextNode_.nodeValue = text;
  var bbox = this.measurementText_['getBBox']();
  this.measurementTextNode_.nodeValue = '';

  if (style['fontVariant'] && goog.userAgent.OPERA) {
    this.measurementTextNode_.nodeValue = text.charAt(0).toUpperCase();
    bbox.height = this.measurementText_['getBBox']().height;
  }

  return new goog.math.Rect(bbox.x, bbox.y, bbox.width + additionWidth, bbox.height);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.getBBox = function(element, text, style) {
  var boundsCache = this.textBoundsCache;
  var styleHash = this.getStyleHash(style);
  var styleCache = boundsCache[styleHash];
  if (!styleCache) styleCache = boundsCache[styleHash] = {};
  var textBoundsCache = styleCache[text];

  if (textBoundsCache) {
    return textBoundsCache;
  } else {
    var spaceWidth = null;
    var additionWidth = 0;

    if (text.length == 0) {
      return this.getEmptyStringBounds(style);
    }

    if (goog.string.isSpace(text)) {
      return this.getSpaceBounds(style);
    } else {
      if (goog.string.startsWith(text, ' '))
        additionWidth += spaceWidth = this.getSpaceBounds(style).width;
      if (goog.string.endsWith(text, ' '))
        additionWidth += spaceWidth || this.getSpaceBounds(style).width;
    }

    var parentNode = element.parentNode;

    this.measurementLayerForBBox_.appendChild(element);
    var bbox = element['getBBox']();
    if (parentNode) parentNode.appendChild(element);

    var x = element.getAttribute('x') || 0;
    var y = element.getAttribute('y') || 0;
    return styleCache[text] = new goog.math.Rect(bbox.x - x, bbox.y - y, bbox.width + additionWidth, bbox.height);
  }
};


/**
 * Measure any svg nodes.
 * @param {string|Node} element .
 * @return {goog.math.Rect} .
 */
acgraph.vector.svg.Renderer.prototype.measureElement = function(element) {
  if (!this.measurement_) this.createMeasurement();

  if (goog.isString(element)) {
    this.measurementGroupNode_.innerHTML = element;
  } else {
    goog.dom.appendChild(this.measurementGroupNode_, element.cloneNode(true));
  }
  var bbox = this.measurementGroupNode_['getBBox']();
  goog.dom.removeChildren(this.measurementGroupNode_);

  return new goog.math.Rect(bbox.x, bbox.y, bbox.width, bbox.height);
};


/**
 * Measures the bounds of an image.
 * @param {string} src The URI of the image.
 * @param {Function} callback The Callback function to which the measured bounds of the image will be sent.
 */
acgraph.vector.svg.Renderer.prototype.measuringImage = function(src, callback) {
  if (!this.imageMap_) {
    this.getImageLoader();
    this.imageMap_ = {};

    goog.events.listen(this.imageLoader_, goog.net.EventType.COMPLETE, function(e) {
      this.starLoadImage_ = false;
    }, false, this);

    goog.events.listen(this.imageLoader_,
        goog.events.EventType.LOAD,
        this.onImageLoadHandler_,
        false,
        this
    );
  }

  this.imageMap_[goog.getUid(callback)] = [src, callback];
  this.starLoadImage_ = true;
  this.imageLoader_.addImage(src, src);
  this.imageLoader_.start();
};


/**
 * Image load handler.
 * @param {goog.events.Event} e Event.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.onImageLoadHandler_ = function(e) {
  var target = e.target;
  goog.object.forEach(this.imageMap_, function(value, key) {
    if (value[0] == target.id) {
      var callback = value[1];
      callback.call(this, target.naturalWidth, target.naturalHeight);
      delete this.imageMap_[key];
    }
  }, this);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.isImageLoading = function() {
  return this.starLoadImage_;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Path
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Serializes a given Path and converts its data to a String which can be used in SVG.
 * @param {acgraph.vector.PathBase} path The Path to serialize.
 * @return {?string} A representation which can be used in SVG.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.getSvgPath_ = function(path) {
  if (path.isEmpty()) return null;
  /** @type {!Array.<string|number>} */
  var list = [];
  path.forEachSegment(function(segment, args) {
    switch (segment) {
      case acgraph.vector.PathBase.Segment.MOVETO:
        list.push('M');
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
        break;
      case acgraph.vector.PathBase.Segment.LINETO:
        list.push('L');
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
        break;
      case acgraph.vector.PathBase.Segment.CURVETO:
        list.push('C');
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, args, list);
        break;
      case acgraph.vector.PathBase.Segment.ARCTO:
        /** @type {number} */
        var extent = args[3];
        list.push('A', args[0], args[1],
            0, Math.abs(extent) > 180 ? 1 : 0, extent > 0 ? 1 : 0,
            args[4], args[5]);
        break;
      case acgraph.vector.PathBase.Segment.CLOSE:
        list.push('Z');
        break;
    }
  });
  return list.join(' ');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Gradient
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Calculation of a gradient vector with a given angle of slope. Visually the angle will look as not set. To
 * keep the given angle it is necessary to use the saveAngle parameter.
 * @param {number} angle The angle in degrees.
 * @return {!goog.math.Line} The objects with the coordinates of the gradient vector.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.getObjectBoundingBoxGradientVector_ = function(angle) {
  /** @type {number} */
  var radAngle = goog.math.toRadians(angle);
  /** @type {number} */
  var tanAngle = Math.tan(radAngle);

  /** @type {number} */
  var dx = 1 / (tanAngle * 2);
  /** @type {number} */
  var dy = tanAngle / 2;

  /** @type {boolean} */
  var swap = false;
  if (Math.abs(dy) <= 0.5) {
    dx = -0.5;
    swap = Math.cos(radAngle) < 0;
  } else {
    dy = -0.5;
    swap = Math.sin(radAngle) > 0;
  }

  if (swap) {
    dx = -dx;
    dy = -dy;
  }

  return new goog.math.Line(
      0.5 + dx,
      0.5 + dy,
      0.5 - dx,
      0.5 - dy
  );
};


/**
 * Calculation of a linear gradient vector for the UserSpaceOnUse mode.
 * @param {number} angle The angle of the vector.
 * @param {!goog.math.Rect} bounds The bounds of the shape.
 * @return {!goog.math.Line} The coordinates of the vector.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.getUserSpaceOnUseGradientVector_ = function(angle, bounds) {
  //The angle is transformed so that it lies in the [0; 90) range.
  /** @type {number} */
  var angleTransform = angle % 90;
  /** @type {number} */
  var radAngle = goog.math.toRadians(angle);
  //Increments to the center of the shape – according to them the initial and end points of the gradient vector are calculated.
  /** @type {number} */
  var dx = 1;
  /** @type {number} */
  var dy = 1;
  //The coordinates of the center of the shape.
  /** @type {number} */
  var centerX = bounds.left + bounds.width / 2;
  /** @type {number} */
  var centerY = bounds.top + bounds.height / 2;
  /**
   * For the angles between 180 and 360 degrees the gradient vector  is situated the same way as for the angles between 0 and 180, but the direction
   * is opposite. The interval where the angle lies is found, and the <b>swap</b> variable is set, which swaps
   * the ends of the vector to change its direction.
   * P.S. The sine of the angles between 180 and 360 is lesser than 0, and the sine of 180 or 360 does not exist, so in addition
   * the angle is checked for 180 and 360.
   * @type {boolean}
   */
  var swap = Math.sin(radAngle) < 0 || angle == 180 || angle == 360;
  if (angle == 90 || angle == 270) angleTransform += 0.000001;
  if ((angle != 180) && (Math.tan(radAngle) < 0 || angle == 90 || angle == 270)) {
    dx = -1;
    angleTransform = 90 - angleTransform;
  }

  /** @type {number} */
  var radAngleTransform = goog.math.toRadians(angleTransform);
  /** @type {number} */
  var halfLengthVector = Math.sin(radAngleTransform) * (bounds.height / 2 - Math.tan(radAngleTransform) *
      bounds.width / 2) + bounds.width / 2 / Math.cos(radAngleTransform);

  dx *= Math.cos(radAngleTransform) * halfLengthVector;
  dy *= Math.sin(radAngleTransform) * halfLengthVector;

  if (swap) {
    dx = -dx;
    dy = -dy;
  }

  return new goog.math.Line(
      Math.round(centerX - dx),
      Math.round(centerY + dy),
      Math.round(centerX + dx),
      Math.round(centerY - dy)
  );
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM elements creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createStageElement = function() {
  /** @type {Element} */
  var element = this.createSVGElement_('svg');
  if (!goog.userAgent.IE)
    this.setAttribute_(element, 'xmlns', acgraph.vector.svg.Renderer.SVG_NS_);
  this.setAttribute_(element, 'border', '0');
  return element;
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createLinearGradientElement = function() {
  return this.createSVGElement_('linearGradient');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createRadialGradientElement = function() {
  return this.createSVGElement_('radialGradient');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createFillPatternElement = function() {
  return this.createSVGElement_('pattern');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createImageElement = function() {
  return this.createSVGElement_('image');
};


/**
 * Creation of a DOM element for a gradient key.
 * @return {Element} The DOM element.
 */
acgraph.vector.svg.Renderer.prototype.createGradientKey = function() {
  return this.createSVGElement_('stop');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createLayerElement = function() {
  return this.createSVGElement_('g');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createRectElement = function() {
  return this.createSVGElement_('rect');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createCircleElement = function() {
  return this.createSVGElement_('circle');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createPathElement = function() {
  return this.createSVGElement_('path');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createEllipseElement = function() {
  return this.createSVGElement_('ellipse');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createDefsElement = function() {
  return this.createSVGElement_('defs');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createTextElement = function() {
  return this.createSVGElement_('text');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createTextSegmentElement = function() {
  return this.createSVGElement_('tspan');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createTextNode = function(text) {
  return goog.dom.createTextNode(text);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setFillPatternProperties = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  this.setAttributes_(element.domElement(), {
    'x': bounds.left,
    'y': bounds.top,
    'width': bounds.width,
    'height': bounds.height,
    'patternUnits': 'userSpaceOnUse'
  });
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setImageProperties = function(element) {
  var bounds = element.getBoundsWithoutTransform();

  this.measuringImage(/** @type {string} */(element.src()), goog.nullFunction);
  //If the src of an image is not defined, it must be removed.
  //To remove the image, a transparent 1x1 pixel image in the base64 encoding is used. Removal
  //through removeAttributeNS does not work in Safari, Chrome, and Opera Next: the attribute is removed, but there are no visible
  //changes in the image, for example, its size does not change.
  var src = /** @type {string} */(element.src() || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  var domElement = element.domElement();
  this.setAttributes_(domElement, {
    'x': bounds.left,
    'y': bounds.top,
    'width': bounds.width,
    'height': bounds.height,
    'image-rendering': 'optimizeQuality',
    'preserveAspectRatio': element.align() + ' ' + element.fittingMode(),
    'opacity': element.opacity()
  });

  domElement.setAttributeNS(acgraph.vector.svg.Renderer.XLINK_NS_, 'href', src);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setCursorProperties = function(element, cursor) {
  var domElement = element.domElement();
  if (domElement)
    domElement.style['cursor'] = cursor || '';
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTextPosition = function(element) {
  var domElement = element.domElement();
  this.setAttribute_(domElement, 'x', element.calcX);
  this.setAttribute_(domElement, 'y', element.calcY);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTextProperties = function(element) {
  var style = element.style();
  var domElement = element.domElement();

  if (!element.selectable()) {
    domElement.style['-webkit-touch-callout'] = 'none';
    domElement.style['-webkit-user-select'] = 'none';
    domElement.style['-khtml-user-select'] = 'none';
    domElement.style['-moz-user-select'] = 'moz-none';
    domElement.style['-ms-user-select'] = 'none';
    domElement.style['-o-user-select'] = 'none';
    domElement.style['user-select'] = 'none';

    if ((goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9) || goog.userAgent.OPERA) {
      this.setAttribute_(domElement, 'unselectable', 'on');
      this.setAttribute_(domElement, 'onselectstart', 'return false;');
    }
  } else {
    domElement.style['-webkit-touch-callout'] = '';
    domElement.style['-webkit-user-select'] = '';
    domElement.style['-khtml-user-select'] = '';
    domElement.style['-moz-user-select'] = '';
    domElement.style['-ms-user-select'] = '';
    domElement.style['-o-user-select'] = '';
    domElement.style['user-select'] = '';

    if ((goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9) || goog.userAgent.OPERA) {
      this.removeAttribute_(domElement, 'unselectable');
      this.removeAttribute_(domElement, 'onselectstart');
    }
  }

  //Improves font display in Opera.
  //if (goog.userAgent.OPERA) this.setAttribute_(domElement, 'text-rendering', 'geometricPrecision');

  //like segment style
  if (style['fontStyle'])
    this.setAttribute_(domElement, 'font-style', style['fontStyle']);
  else
    this.removeAttribute_(domElement, 'font-style');

  if (style.fontVariant) {
    if (goog.userAgent.GECKO) {
      domElement.style['font-variant'] = style['fontVariant'];
    } else {
      this.setAttribute_(domElement, 'font-variant', style['fontVariant']);
    }
  } else {
    if (goog.userAgent.GECKO) {
      domElement.style['font-variant'] = '';
    } else {
      this.removeAttribute_(domElement, 'font-variant');
    }
  }

  if (style['fontFamily'])
    this.setAttribute_(domElement, 'font-family', style['fontFamily']);
  else
    this.removeAttribute_(domElement, 'font-family');

  if (style['fontSize'])
    this.setAttribute_(domElement, 'font-size', style['fontSize']);
  else
    this.removeAttribute_(domElement, 'font-size');

  if (style['fontWeight'])
    this.setAttribute_(domElement, 'font-weight', style['fontWeight']);
  else
    this.removeAttribute_(domElement, 'font-weight');

  if (style['color'])
    this.setAttribute_(domElement, 'fill', style['color']);
  else
    this.removeAttribute_(domElement, 'fill');

  if (style['letterSpacing'])
    this.setAttribute_(domElement, 'letter-spacing', style['letterSpacing']);
  else
    this.removeAttribute_(domElement, 'letter-spacing');

  if (style['decoration']) {
    if (goog.userAgent.GECKO) {
      //Text-decoration does not work in Mozilla – there is a bug report about it in their bugtracker:
      //https://bugzilla.mozilla.org/show_bug.cgi?id=317196
      //domElement.style['text-decoration'] = style.decoration;  //does not work either.
      this.setAttribute_(domElement, 'text-decoration', style['decoration']);

    } else {
      this.setAttribute_(domElement, 'text-decoration', style['decoration']);
    }
  } else
    this.removeAttribute_(domElement, 'text-decoration');

  //text style
  if (style['direction'])
    this.setAttribute_(domElement, 'direction', style['direction']);
  else
    this.removeAttribute_(domElement, 'direction');

  if (style['hAlign']) {
    var align;

    if (style['direction'] == 'rtl') {
      if (goog.userAgent.GECKO || goog.userAgent.IE) {
        align = (style['hAlign'] == acgraph.vector.Text.HAlign.END || style['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
            acgraph.vector.Text.HAlign.START :
            (style['hAlign'] == acgraph.vector.Text.HAlign.START || style['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
                acgraph.vector.Text.HAlign.END :
                'middle';
      } else {
        align = (style['hAlign'] == acgraph.vector.Text.HAlign.END || style['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
            acgraph.vector.Text.HAlign.END :
            (style['hAlign'] == acgraph.vector.Text.HAlign.START || style['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
                acgraph.vector.Text.HAlign.START :
                'middle';
      }
    } else {
      align = (style['hAlign'] == acgraph.vector.Text.HAlign.END || style['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
          acgraph.vector.Text.HAlign.END :
          (style['hAlign'] == acgraph.vector.Text.HAlign.START || style['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
              acgraph.vector.Text.HAlign.START :
              'middle';
    }
    this.setAttribute_(domElement, 'text-anchor', /** @type {string} */ (align));
  } else
    this.removeAttribute_(domElement, 'text-anchor');

  if (style['opacity'])
    domElement.style['opacity'] = style['opacity'];
  else
    domElement.style['opacity'] = '1';
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTextSegmentPosition = function(element) {
  var domElement = element.domElement();
  var text = element.parent();

  if (element.firstInLine || element.dx) this.setAttribute_(domElement, 'x', text.calcX + element.dx);
  this.setAttribute_(domElement, 'dy', element.dy);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTextSegmentProperties = function(element) {
  var style = element.getStyle();
  var domElement = element.domElement();
  var text = element.parent();

  var textNode = this.createTextNode(element.text);
  goog.dom.appendChild(domElement, textNode);

  if ((goog.userAgent.IE && goog.userAgent.DOCUMENT_MODE == 9) || goog.userAgent.OPERA) {
    if (!text.selectable()) {
      this.setAttribute_(domElement, 'onselectstart', 'return false;');
      this.setAttribute_(domElement, 'unselectable', 'on');
    } else {
      this.removeAttribute_(domElement, 'onselectstart');
      this.removeAttribute_(domElement, 'unselectable');
    }
  }

  //segment style
  if (style.fontStyle)
    this.setAttribute_(domElement, 'font-style', style.fontStyle);

  if (style.fontVariant)
    this.setAttribute_(domElement, 'font-variant', style.fontVariant);

  if (style.fontFamily)
    this.setAttribute_(domElement, 'font-family', style.fontFamily);

  if (style.fontSize)
    this.setAttribute_(domElement, 'font-size', style.fontSize);

  if (style.fontWeight)
    this.setAttribute_(domElement, 'font-weight', style.fontWeight);

  if (style.color)
    this.setAttribute_(domElement, 'fill', style.color);

  if (style.letterSpacing)
    this.setAttribute_(domElement, 'letter-spacing', style.letterSpacing);

  if (style.decoration)
    this.setAttribute_(domElement, 'text-decoration', style.decoration);
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.createClipElement = function() {
  return this.createSVGElement_('clipPath');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Coloring.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Radial gradient fill rendering.
 * @param {acgraph.vector.RadialGradientFill} fill The radial gradient fill instance.
 * @param {acgraph.vector.Defs} defs The radial gradient instance.
 * @return {string} The identifier of the rendered radial gradient.
 */
acgraph.vector.svg.Renderer.prototype.renderRadialGradient = function(fill, defs) {
  var gradient = defs.getRadialGradient(fill['keys'], fill['cx'], fill['cy'], fill['fx'], fill['fy'], fill['opacity'], fill['mode'], fill['transform']);
  if (!gradient.rendered) {
    var fillDomElement = this.createRadialGradientElement();
    this.setIdInternal(fillDomElement, gradient.id());
    this.appendChild(defs.domElement(), fillDomElement);
    gradient.defs = defs;
    gradient.rendered = true;

    goog.array.forEach(gradient.keys, function(key) {
      var keyDomElement = this.createGradientKey();
      this.setAttributes_(keyDomElement, {
        'offset': key['offset'],
        'style': 'stop-color:' + key['color'] + ';stop-opacity:' + (isNaN(key['opacity']) ? gradient.opacity : key['opacity'])
      });

      this.appendChild(fillDomElement, keyDomElement);
    }, this);

    if (gradient.bounds) {
      this.setAttributes_(fillDomElement, {
        'cx': gradient.cx * gradient.bounds.width + gradient.bounds.left,
        'cy': gradient.cy * gradient.bounds.height + gradient.bounds.top,
        'fx': gradient.fx * gradient.bounds.width + gradient.bounds.left,
        'fy': gradient.fy * gradient.bounds.height + gradient.bounds.top,
        'r': Math.min(gradient.bounds.width, gradient.bounds.height) / 2,
        'spreadMethod': 'pad',
        'gradientUnits': 'userSpaceOnUse'
      });
    } else {
      this.setAttributes_(fillDomElement, {
        'cx': gradient.cx,
        'cy': gradient.cy,
        'fx': gradient.fx,
        'fy': gradient.fy,
        'gradientUnits': 'objectBoundingBox'
      });
    }
    if (gradient.transform) {
      this.setAttribute_(fillDomElement, 'gradientTransform', gradient.transform.toString());
    }
  }

  return gradient.id();
};


/**
 * Linear gradient fill rendering.
 * @param {acgraph.vector.LinearGradientFill} fill The linear gradient fill instance.
 * @param {acgraph.vector.Defs} defs The radial gradient instance.
 * @param {!goog.math.Rect} elementBounds The bounds of the element.
 * @return {string} The identifier of the rendered linear gradient.
 */
acgraph.vector.svg.Renderer.prototype.renderLinearGradient = function(fill, defs, elementBounds) {
  var angle = (fill['mode'] === true) ?
      this.saveGradientAngle(fill['angle'], elementBounds) :
      fill['angle'];
  var gradient = defs.getLinearGradient(fill['keys'], fill['opacity'], angle, fill['mode'], fill['transform']);
  if (!gradient.rendered) {
    var fillDomElement = this.createLinearGradientElement();
    this.setIdInternal(fillDomElement, gradient.id());
    this.appendChild(defs.domElement(), fillDomElement);
    gradient.defs = defs;
    gradient.rendered = true;

    goog.array.forEach(gradient.keys, function(key) {
      var keyDomElement = this.createGradientKey();
      this.setAttributes_(keyDomElement, {
        'offset': key['offset'],
        'style': 'stop-color:' + key['color'] + ';stop-opacity:' + (isNaN(key['opacity']) ? gradient.opacity : key['opacity'])
      });
      this.appendChild(fillDomElement, keyDomElement);
    }, this);
    /** @type {!goog.math.Line} */
    var vector;

    if (gradient.bounds) {
      vector = this.getUserSpaceOnUseGradientVector_(gradient.angle, gradient.bounds);
      this.setAttributes_(fillDomElement, {
        'x1': vector.x0,
        'y1': vector.y0,
        'x2': vector.x1,
        'y2': vector.y1,
        'spreadMethod': 'pad',
        'gradientUnits': 'userSpaceOnUse'
      });
    } else {
      vector = this.getObjectBoundingBoxGradientVector_(gradient.angle);
      this.setAttributes_(fillDomElement, {
        'x1': vector.x0,
        'y1': vector.y0,
        'x2': vector.x1,
        'y2': vector.y1,
        'gradientUnits': 'objectBoundingBox'
      });
    }
    if (gradient.transform) {
      this.setAttribute_(fillDomElement, 'gradientTransform', gradient.transform.toString());
    }
  }
  return gradient.id();
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.applyFill = function(element) {
  /** @type {acgraph.vector.Fill} */
  var fill = /** @type {acgraph.vector.Fill} */(element.fill());
  /** @type {!acgraph.vector.Defs} */
  var defs = element.getStage().getDefs();
  var pathPrefix = 'url(' + acgraph.getReference() + '#';

  if (goog.isString(fill)) {
    this.setAttribute_(element.domElement(), 'fill', /** @type {string} */(fill));
    this.removeAttribute_(element.domElement(), 'fill-opacity');
  } else if (goog.isArray(fill['keys']) && fill['cx'] && fill['cy']) {
    this.setAttribute_(element.domElement(), 'fill', pathPrefix +
        this.renderRadialGradient(/** @type {acgraph.vector.RadialGradientFill} */(fill), defs) + ')');
    this.removeAttribute_(element.domElement(), 'fill-opacity');
  } else if (goog.isArray(fill['keys'])) {
    if (!element.getBounds()) return;
    this.setAttribute_(element.domElement(), 'fill',
        pathPrefix + this.renderLinearGradient(/** @type {acgraph.vector.LinearGradientFill} */(fill), defs, element.getBounds()) + ')');
    this.removeAttribute_(element.domElement(), 'fill-opacity');
  } else if (fill['src']) {
    var b = element.getBoundsWithoutTransform();
    if (b) {
      b.width = b.width || 0;
      b.height = b.height || 0;
      b.left = b.left || 0;
      b.top = b.top || 0;
    } else {
      b = new goog.math.Rect(0, 0, 0, 0);
    }

    if (fill['mode'] == acgraph.vector.ImageFillMode.TILE) {
      var callback = function(imageFill) {
        imageFill.id(); // if the identifier of the fill is still empty, it will be generated
        imageFill.parent(element.getStage()).render();
        acgraph.getRenderer().setAttribute_(element.domElement(), 'fill', pathPrefix + imageFill.id() + ')');
      };
      defs.getImageFill(fill['src'], b, fill['mode'], fill['opacity'], callback);
    } else {
      var imageFill = defs.getImageFill(fill['src'], b, fill['mode'], fill['opacity']);
      imageFill.id(); // if the identifier of the fill is still empty, it will be generated
      imageFill.parent(element.getStage()).render();
      this.setAttribute_(element.domElement(), 'fill', pathPrefix + imageFill.id() + ')');
    }
  } else if (fill instanceof acgraph.vector.HatchFill) {
    var hatch = /** @type {acgraph.vector.HatchFill} */(fill);
    hatch = defs.getHatchFill(hatch.type, hatch.color, hatch.thickness, hatch.size);
    hatch.id(); // if the identifier of the fill is still empty, it will be generated
    hatch.parent(element.getStage()).render();
    this.setAttribute_(element.domElement(), 'fill', pathPrefix + hatch.id() + ')');
  } else if (fill instanceof acgraph.vector.PatternFill) {
    /** @type {acgraph.vector.PatternFill} */
    var pattern = /** @type {acgraph.vector.PatternFill} */(fill);
    pattern.id(); // if the identifier of the fill is still empty, it will be generated
    pattern.parent(element.getStage()).render();
    this.setAttribute_(element.domElement(), 'fill', pathPrefix + pattern.id() + ')');
  } else {
    // DVF-1729 fix
    // because internet explorer converts fill-opacity "0.00001" to "1e-5" that is not css-compatible
    // and export server can't generate proper image.
    if (fill['opacity'] <= 0.0001 && goog.userAgent.IE && goog.userAgent.isVersionOrHigher('9'))
      fill['opacity'] = 0.0001;
    this.setAttributes_(element.domElement(), {
      'fill': (/** @type {acgraph.vector.SolidFill} */(fill))['color'],
      'fill-opacity': (/** @type {acgraph.vector.SolidFill} */(fill))['opacity']
    });
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.applyStroke = function(element) {
  /** @type {acgraph.vector.Stroke} */
  var stroke = /** @type {acgraph.vector.Stroke} */(element.stroke());
  var defs = element.getStage().getDefs();
  var domElement = element.domElement();
  var pathPrefix = 'url(' + acgraph.getReference() + '#';

  if (goog.isString(stroke)) {
    this.setAttribute_(domElement, 'stroke', /** @type {string} */(stroke));
  } else if (goog.isArray(stroke['keys']) && stroke['cx'] && stroke['cy']) {
    this.setAttribute_(domElement, 'stroke', pathPrefix +
        this.renderRadialGradient(/** @type {acgraph.vector.RadialGradientFill} */(stroke), defs) + ')');
  } else if (goog.isArray(stroke['keys'])) {
    if (!element.getBounds()) return;
    this.setAttribute_(domElement, 'stroke',
        pathPrefix + this.renderLinearGradient(/** @type {acgraph.vector.LinearGradientFill} */(stroke), defs, element.getBounds()) + ')');
  } else {
    this.setAttribute_(domElement, 'stroke', stroke['color']);
  }

  if (stroke['lineJoin'])
    this.setAttribute_(domElement, 'stroke-linejoin', stroke['lineJoin']);
  else
    this.removeAttribute_(domElement, 'stroke-linejoin');
  if (stroke['lineCap'])
    this.setAttribute_(domElement, 'stroke-linecap', stroke['lineCap']);
  else
    this.removeAttribute_(domElement, 'stroke-linecap');
  if (stroke['opacity'])
    this.setAttribute_(domElement, 'stroke-opacity', stroke['opacity']);
  else
    this.removeAttribute_(domElement, 'stroke-opacity');
  if (stroke['thickness'])
    this.setAttribute_(domElement, 'stroke-width', stroke['thickness']);
  else
    this.removeAttribute_(domElement, 'stroke-width');
  if (stroke['dash'])
    this.setAttribute_(domElement, 'stroke-dasharray', stroke['dash']);
  else
    this.removeAttribute_(domElement, 'stroke-dasharray');
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.applyFillAndStroke = function(element) {
  this.applyFill(element);
  this.applyStroke(element);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Element properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setVisible = function(element) {
  if (element.visible()) {
    this.removeAttribute_(element.domElement(), 'visibility');
  } else {
    this.setAttribute_(element.domElement(), 'visibility', 'hidden');
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTransformation = function(element) {
  /** @type {goog.math.AffineTransform} */
  var transformation = element.getSelfTransformation();
  if (transformation && !transformation.isIdentity()) {
    this.setAttribute_(element.domElement(), 'transform', transformation.toString());
  } else {
    this.removeAttribute_(element.domElement(), 'transform');
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setPatternTransformation = function(element) {
  /** @type {goog.math.AffineTransform} */
  var transformation = element.getSelfTransformation();
  if (transformation && !transformation.isIdentity()) {
    this.setAttribute_(element.domElement(), 'patternTransform', transformation.toString());
  } else {
    this.removeAttribute_(element.domElement(), 'patternTransform');
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setPathTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setImageTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setLayerTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTextTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setRectTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setEllipseTransformation = acgraph.vector.svg.Renderer.prototype.setTransformation;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setStageSize = function(el, width, height) {
  this.setAttributes_(el, {
    'width': width,
    'height': height
  });
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setId = function(element, id) {
  this.setIdInternal(element.domElement(), id);
};


/**
 * Sets id to element.
 * @param {?Element} element - Element.
 * @param {string} id - ID to be set.
 */
acgraph.vector.svg.Renderer.prototype.setIdInternal = function(element, id) {
  if (element) {
    if (id)
      this.setAttribute_(element, 'id', id);
    else
      this.removeAttribute_(element, 'id');
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setTitle = function(element, title) {
  var domElement = element.domElement();
  if (domElement) {
    if (goog.isDefAndNotNull(title)) { //Set new value
      if (!element.titleElement) {
        element.titleElement = this.createSVGElement_('title');
        this.setAttribute_(element.titleElement, 'aria-label', '');
      }
      if (!goog.dom.getParentElement(element.titleElement))
        goog.dom.insertChildAt(domElement, element.titleElement, 0);
      element.titleElement.innerHTML = title;
    } else if (element.titleElement) { //remove node
      domElement.removeChild(element.titleElement);
    }
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setDesc = function(element, desc) {
  var domElement = element.domElement();
  if (domElement) {
    if (goog.isDefAndNotNull(desc)) { //Set new value
      if (!element.descElement) {
        element.descElement = this.createSVGElement_('desc');
        this.setAttribute_(element.descElement, 'aria-label', '');
      }
      if (!goog.dom.getParentElement(element.descElement))
        goog.dom.insertChildAt(domElement, element.descElement, 0);
      element.descElement.innerHTML = desc;
    } else if (element.descElement) { //remove node
      domElement.removeChild(element.descElement);
    }
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setAttributes = function(element, attrs) {
  var domElement = element.domElement();
  if (domElement && goog.isObject(attrs)) {
    for (var key in attrs) {
      var value = attrs[key];
      if (goog.isNull(value)) {
        this.removeAttribute_(domElement, key);
      } else {
        this.setAttribute_(domElement, key, /** @type {(string|number)} */ (value));
      }
    }
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.getAttribute = function(element, key) {
  return element ? element.getAttribute(key) : void 0;
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setDisableStrokeScaling = function(element, isDisabled) {
  var domElement = element.domElement();
  if (domElement) {
    if (isDisabled)
      this.setAttribute_(domElement, 'vector-effect', 'non-scaling-stroke');
    else
      this.removeAttribute_(domElement, 'vector-effect');
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setLayerSize = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setRectProperties = function(rect) {
  var boundsWithoutTransform = rect.getBoundsWithoutTransform();
  this.setAttributes_(rect.domElement(), {
    'x': boundsWithoutTransform.left,
    'y': boundsWithoutTransform.top,
    'width': boundsWithoutTransform.width,
    'height': boundsWithoutTransform.height
  });
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setCircleProperties = function(circle) {
  this.setAttributes_(circle.domElement(), {
    'cx': circle.centerX(),
    'cy': circle.centerY(),
    'r': circle.radius()
  });
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setEllipseProperties = function(ellipse) {
  this.setAttributes_(ellipse.domElement(), {
    'cx': ellipse.centerX(),
    'cy': ellipse.centerY(),
    'rx': ellipse.radiusX(),
    'ry': ellipse.radiusY()
  });
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setPathProperties = function(path) {
  var pathData = this.getSvgPath_(path);
  if (pathData)
    this.setAttribute_(path.domElement(), 'd', pathData);
  else
    this.setAttribute_(path.domElement(), 'd', 'M 0,0');
};


/**
 * Always creates clip in case of custom clip or creates new from rect or returns already created from cache.
 * @param {acgraph.vector.Element} element Element to take stage from.
 * @param {!acgraph.vector.Clip} clipElement Rect to check the cache. Identifies whether clip is creating custom.
 * @return {string} Id of clip.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.createClip_ = function(element, clipElement) {
  /** @type {!acgraph.vector.svg.Defs} */
  var defs = /** @type {!acgraph.vector.svg.Defs} */ (element.getStage().getDefs());
  /** @type {Element} */
  var clipDomElement = defs.getClipPathElement(clipElement);
  var id = acgraph.utils.IdGenerator.getInstance().identify(clipDomElement, acgraph.utils.IdGenerator.ElementTypePrefix.CLIP);

  var clipShapeElement;
  if (goog.dom.getParentElement(clipDomElement) != defs.domElement()) {
    this.setAttribute_(clipDomElement, 'clip-rule', 'nonzero');
    this.setIdInternal(clipDomElement, id);
  }

  clipElement.stage(element.getStage());
  clipElement.id(id);

  var clipShape = clipElement.shape();
  clipShape.render();
  clipShapeElement = clipShape.domElement();

  if (clipShapeElement) {
    this.appendChild(clipDomElement, clipShapeElement);
    this.appendChild(defs.domElement(), clipDomElement);
  }

  return id;
};


/**
 * Removes clip and its children from defs.
 * Called in acgraph.vector.Clip#dispose method.
 * @param {acgraph.vector.Clip} clip Disposing clip.
 */
acgraph.vector.svg.Renderer.prototype.disposeClip = function(clip) {
  var elements = clip.getElements();
  for (var i = 0; i < elements.length; i++) {
    if (elements[i].domElement())
      this.removeClip_(elements[i]);
    elements[i].clip(null);
  }

  var clipId = /** @type {string} */ (clip.id());
  var clipPath = goog.dom.getElement(clipId);
  if (clipPath) {
    var clipPathElement = goog.dom.getFirstElementChild(clipPath);
    this.removeNode(clipPathElement);
    this.removeNode(clipPath);
  }
};


/**
 * Adds clipping attributes to element clipping to element.
 * @param {!acgraph.vector.Element} element Element.
 * @param {string} clipId Id of clip element to add.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.addClip_ = function(element, clipId) {
  var pathPrefix = acgraph.getReference();
  this.setAttributes_(element.domElement(), {
    'clip-path': 'url(' + pathPrefix + '#' + clipId + ')',
    'clipPathUnits': 'userSpaceOnUse'
  });
};


/**
 * Removes clipping attributes from element.
 * @param {!acgraph.vector.Element} element Element.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.removeClip_ = function(element) {
  this.removeAttribute_(element.domElement(), 'clip-path');
  this.removeAttribute_(element.domElement(), 'clipPathUnits');
};


/**
 * Updates clip with clipId with new bounds.
 * @param {!acgraph.vector.Clip} clipElement Rect to check the cache. Identifies whether clip is creating custom.
 */
acgraph.vector.svg.Renderer.prototype.updateClip = function(clipElement) {
  var clipShape = clipElement.shape();
  var dom = clipShape.domElement();
  if (!dom) {
    /** @type {!acgraph.vector.svg.Defs} */
    var defs = /** @type {!acgraph.vector.svg.Defs} */ (clipElement.getStage().getDefs());
    /** @type {Element} */
    var clipDomElement = defs.getClipPathElement(clipElement);
    clipShape.render();
    var clipShapeElement = clipShape.domElement();
    this.appendChild(clipDomElement, clipShapeElement);
  } else {
    clipElement.shape().render();
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setClip = function(element) {
  /** @type {acgraph.vector.Clip} */
  var clipelement = /** @type {acgraph.vector.Clip} */ (element.clip());
  if (clipelement) {
    var clipId;
    if (clipelement instanceof acgraph.vector.Clip)
      clipId = /** @type {string} */ (clipelement.id());
    if (!clipId)
      clipId = this.createClip_(element, clipelement);
    this.addClip_(element, clipId);
  } else {
    this.removeClip_(element);
  }
};


/** @inheritDoc */
acgraph.vector.svg.Renderer.prototype.setPointerEvents = function(element) {
  if (element.disablePointerEvents())
    this.setAttribute_(element.domElement(), 'pointer-events', 'none');
  else
    this.removeAttribute_(element.domElement(), 'pointer-events');
};


/**
 * Transforms a rectangle into a path string which can be set as a path data.
 * @param {!goog.math.Rect} rect The rectangle to transformed.
 * @return {string} The string describing the rectangle, which can be set as a path data.
 * @private
 */
acgraph.vector.svg.Renderer.prototype.getPathStringFromRect_ = function(rect) {
  var left = rect.left;
  var top = rect.top;
  var right = left + rect.width;
  var bottom = top + rect.height;
  return [
    'M', left, top,
    'L', right, top,
    right, bottom,
    left, bottom,
    'Z'
  ].join(' ');
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Printing
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * @param {Element} element
 * @param {acgraph.vector.Stage} stage
 */
acgraph.vector.svg.Renderer.prototype.setPrintAttributes = function(element, stage) {
  this.setAttribute_(element, 'width', '100%');
  this.setAttribute_(element, 'height', '100%');
  this.setAttribute_(element, 'viewBox', '0 0 ' + stage.width() + ' ' + stage.height());
  goog.style.setStyle(element, 'width', '100%');
  goog.style.setStyle(element, 'height', '');
  goog.style.setStyle(element, 'max-height', '100%');
};
