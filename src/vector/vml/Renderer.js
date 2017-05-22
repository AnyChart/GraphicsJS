goog.provide('acgraph.vector.vml.Renderer');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.LinearGradient');
goog.require('acgraph.vector.Renderer');
goog.require('acgraph.vector.vml.RadialGradient');
goog.require('goog.array');
goog.require('goog.color');
goog.require('goog.cssom');
goog.require('goog.dom');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.object');



//region --- init class ---
/**
 * Renderer for VML.
 * Works with VML, creates VML elements and sets attributes to them.
 * <h2>VML Renderer features:</h2>
 * <ul>
 *   <li>
 *     <h3>Creating root DOM element and environement intitialization</h3>
 *     <ul>
 *       <li><a href="#createStageElement">createStageElement</a></li>
 *       <li><a href="#setStageSize">setStageSize</a></li>
 *     </ul>
 *   </li>
 *
 *   <li>
 *     <h3>Creating VML elements and setting attributes to them</h3>
 *     <ul>
 *       <li><a href="#createLayerElement">createLayerElement</a></li>
 *       <li><a href="#setLayerProperties">setLayerProperties</a></li>
 *       <li><a href="#createRectElement">createRectElement</a></li>
 *       <li><a href="#setRectProperties">setRectProperties</a></li>
 *     </ul>
 *   </li>
 *
 *   <li>
 *     <h3>Utilities</h3>
 *     <ul>
 *       <li><a href="#createVMLElement_">createVMLElement_</a></li>
 *       <li><a href="#setAttribute_">setAttribute_</a></li>
 *       <li><a href="#setAttributes_">setAttributes_</a></li>
 *       <li><a href="#toCssSize_">toCssSize_</a></li>
 *       <li><a href="#toPosPx_">toPosPx_</a></li>
 *       <li><a href="#toPosCoord_">toPosCoord_</a></li>
 *       <li><a href="#toSizeCoord_">toSizeCoord_</a></li>
 *       <li><a href="#toSizePx_">toSizePx_</a></li>
 *     </ul>
 *   </li>
 * </ul>
 * @constructor
 * @extends {acgraph.vector.Renderer}
 */
acgraph.vector.vml.Renderer = function() {
  goog.base(this);
  var doc = goog.dom.getDocument();
  // Adding your own class to VML styles table, it will be applied to all VML
  // elements. Class tells browser that element is a VML element.
  // If there is no class with such name - add it to the table in document style.
  if (!this.isVMLClassDefined()) doc.createStyleSheet().addRule(
      '.' + acgraph.vector.vml.Renderer.VML_CLASS_, 'behavior:url(#default#VML)');

  // Add VML namespace into the document for the element with the given prefix
  // Depending on success or failure we choose the way to add VML elements.
  try {
    if (!doc.namespaces[acgraph.vector.vml.Renderer.VML_PREFIX_]) {
      doc.namespaces.add(
          acgraph.vector.vml.Renderer.VML_PREFIX_,
          acgraph.vector.vml.Renderer.VML_NS_);
    }

    this.createVMLElement_ = function(tagName) {
      return goog.dom.createDom(
          acgraph.vector.vml.Renderer.VML_PREFIX_ + ':' + tagName,
          {'class': acgraph.vector.vml.Renderer.VML_CLASS_}
      );
    };
  } catch (e) {
    this.createVMLElement_ = function(tagName) {
      return goog.dom.createDom(
          acgraph.vector.vml.Renderer.VML_PREFIX_ + ':' + tagName,
          {
            'class': acgraph.vector.vml.Renderer.VML_CLASS_,
            'xmlns': 'urn:schemas-microsoft.com:vml'
          }
      );
    };
  }
};
goog.inherits(acgraph.vector.vml.Renderer,
    acgraph.vector.Renderer);
goog.addSingletonGetter(acgraph.vector.vml.Renderer);
//endregion


//region --- Static members ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Static members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * The VML namespace URN.
 * @type {string}
 * @private
 */
acgraph.vector.vml.Renderer.VML_NS_ = 'urn:schemas-microsoft-com:vml';


/**
 * VML elements prefix.
 * @type {string}
 * @private
 */
acgraph.vector.vml.Renderer.VML_PREFIX_ = 'any_vml';


/**
 * CSS class for VML elements.
 * @type {string}
 * @private
 */
acgraph.vector.vml.Renderer.VML_CLASS_ = 'any_vml';


/**
 * The VML behavior URL.
 * @type {string}
 * @private
 */
acgraph.vector.vml.Renderer.VML_IMPORT_ = '#default#VML';


/**
 * IE8 mode indicator. IE8 treats VML differently, so we need to know if we are there.
 * @type {boolean}
 */
acgraph.vector.vml.Renderer.IE8_MODE = goog.global.document && goog.global.document.documentMode && goog.global.document.documentMode >= 8;


/**
 * Coordinates multiplier, allows sub-pixel rendering.
 * @type {number}
 * @private
 */
acgraph.vector.vml.Renderer.COORD_MULTIPLIER_ = 100;


/**
 * SUB-pixel shift for crisp display. The value must be 0.5.
 * @type {number}
 * @private
 */
acgraph.vector.vml.Renderer.SHIFT_ = 0;
//endregion ---


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Base node for measurement.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.prototype.measurement_ = null;


/**
 * Node for text bounds measurement.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.prototype.measurementText_ = null;


/**
 * Node for measure bounds of untransormable text.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.measurementSimpleText_ = null;


/**
 * Node for text base line measurement.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.prototype.virtualBaseLine_ = null;


/**
 * Desc.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.prototype.measurementVMLShape_ = null;


/**
 * Desc.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.prototype.measurementVMLTextPath_ = null;


/**
 * Node for image bounds measurement.
 * @type {Element}
 * @private
 */
acgraph.vector.vml.Renderer.prototype.measurementImage_ = null;


//region --- Utlis ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Utils
//
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//
//  Measurement
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Desc.
 */
acgraph.vector.vml.Renderer.prototype.createMeasurement = function() {

  //Text bounds

  this.measurementVMLShape_ = this.createTextSegmentElement();
  this.setPositionAndSize_(this.measurementVMLShape_, 0, 0, 1, 1);
  this.measurementVMLShape_.style['display'] = 'none';
  this.setAttributes_(this.measurementVMLShape_,
      {
        'filled': 'true',
        'fillcolor': 'black',
        'stroked': 'false',
        'path': 'm0,0 l1,0 e'
      }
  );
  goog.dom.appendChild(document.body, this.measurementVMLShape_);


  //Base line

  this.measurement_ = goog.dom.createDom(goog.dom.TagName.DIV);
  this.measurementText_ = goog.dom.createDom(goog.dom.TagName.SPAN);
  this.virtualBaseLine_ = goog.dom.createDom(goog.dom.TagName.SPAN);

  goog.dom.appendChild(document.body, this.measurement_);
  goog.dom.appendChild(this.measurement_, this.virtualBaseLine_);
  goog.dom.appendChild(this.measurement_, this.measurementText_);

  goog.style.setStyle(this.measurement_, {'position': 'absolute', 'visibility': 'hidden', 'left': 0, 'top': 0});
  goog.style.setStyle(this.virtualBaseLine_, {'font-size': '0px', 'border': '0 solid'});
  this.virtualBaseLine_.innerHTML = 'a';


  //Simple text

  this.measurementSimpleText_ = goog.dom.createDom(goog.dom.TagName.SPAN);
  goog.dom.appendChild(this.measurement_, this.measurementSimpleText_);
  goog.style.setStyle(this.measurementSimpleText_, {'font-size': '0px', 'border': '0 solid'});
  this.measurementSimpleText_.innerHTML = 'a';

  //Image measurement

  this.measurementImage_ = goog.dom.createDom(goog.dom.TagName.IMG);
  goog.style.setStyle(this.measurementImage_, {'position': 'absolute', 'left': 0, 'top': 0});
  goog.dom.appendChild(this.measurement_, this.measurementImage_);

  //Group measurement

  this.measurementGroupNode_ = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.dom.appendChild(this.measurement_, this.measurementGroupNode_);
};


/**
 * Measures bounds of image.
 * @param {string} src URI image.
 * @return {goog.math.Rect} Image bounds.
 */
acgraph.vector.vml.Renderer.prototype.measuringImage = function(src) {
  if (!this.measurement_) this.createMeasurement();
  this.setAttribute_(this.measurementImage_, 'src', src);
  return goog.style.getBounds(this.measurementImage_);
};


/**
 * Measure simple text.
 * @param {string} text Text to measure.
 * @param {acgraph.vector.TextSegmentStyle} segmentStyle Segment style.
 * @param {acgraph.vector.TextStyle} textStyle Text style.
 * @return {goog.math.Rect} Text bounds.
 */
acgraph.vector.vml.Renderer.prototype.measuringSimpleText = function(text, segmentStyle, textStyle) {
  if (!this.measurement_) this.createMeasurement();

  this.measurementSimpleText_.style.cssText = '';

  if (textStyle['fontStyle']) goog.style.setStyle(this.measurementSimpleText_, 'font-style', textStyle['fontStyle']);
  if (textStyle['fontVariant']) goog.style.setStyle(this.measurementSimpleText_, 'font-variant', textStyle['fontVariant']);
  if (textStyle['fontFamily']) goog.style.setStyle(this.measurementSimpleText_, 'font-family', textStyle['fontFamily']);
  if (textStyle['fontSize']) goog.style.setStyle(this.measurementSimpleText_, 'font-size', textStyle['fontSize']);
  if (textStyle['fontWeight']) goog.style.setStyle(this.measurementSimpleText_, 'font-weight', textStyle['fontWeight']);
  if (textStyle['letterSpacing']) goog.style.setStyle(this.measurementSimpleText_, 'letter-spacing', textStyle['letterSpacing']);
  if (textStyle['decoration']) goog.style.setStyle(this.measurementSimpleText_, 'text-decoration', textStyle['decoration']);
  if (textStyle['textIndent']) goog.style.setStyle(this.measurementSimpleText_, 'text-indent', textStyle['textIndent']);
  if (textStyle['textWrap'] && textStyle['width'] && textStyle['textWrap'] == acgraph.vector.Text.TextWrap.BY_LETTER) {
    goog.style.setStyle(this.measurementSimpleText_, 'word-break', 'break-all');
  } else {
    goog.style.setStyle(this.measurementSimpleText_, 'white-space', 'nowrap');
  }
  if (textStyle['width']) goog.style.setStyle(this.measurementSimpleText_, 'width', textStyle['width']);

  goog.style.setStyle(this.measurement_, {'left': 0, 'top': 0, 'width': '1px', height: '1px'});
  goog.style.setStyle(this.measurementSimpleText_, {
    'border': '0 solid',
    'position': 'absolute',
    'left': 0,
    'top': 0
  });

  this.measurementSimpleText_.innerHTML = text;
  var boundsTargetText = goog.style.getBounds(this.measurementSimpleText_);
  this.measurementSimpleText_.innerHTML = '';

  return boundsTargetText;
};


/**
 * Measures text.
 * @param {string} text Text to measure.
 * @param {Object} style Text style.
 * @return {goog.math.Rect} Text bounds.
 */
acgraph.vector.vml.Renderer.prototype.measure = function(text, style) {
  if (text == '') return new goog.math.Rect(0, 0, 0, 0);
  if (!this.measurement_) this.createMeasurement();

  goog.dom.removeNode(this.measurementVMLTextPath_);
  this.measurementVMLTextPath_ = /** @type {Element} */ (this.createTextNode(''));
  goog.dom.appendChild(this.measurementVMLShape_, this.measurementVMLTextPath_);

  var spaceWidth = null;
  var additionWidth = 0;

  if (goog.string.isSpace(text))
    return this.getSpaceBounds(style);
  else {
    if (goog.string.startsWith(text, ' '))
      additionWidth += spaceWidth = this.getSpaceBounds(style).width;
    if (goog.string.endsWith(text, ' '))
      additionWidth += spaceWidth || this.getSpaceBounds(style).width;
  }

  this.removeStyle_(this.measurementText_.style, 'font-style');
  this.removeStyle_(this.measurementText_.style, 'font-variant');
  this.removeStyle_(this.measurementText_.style, 'font-family');
  this.removeStyle_(this.measurementText_.style, 'font-size');
  this.removeStyle_(this.measurementText_.style, 'font-weight');
  this.removeStyle_(this.measurementText_.style, 'letter-spacing');
  this.removeStyle_(this.measurementText_.style, 'text-decoration');

  this.measurementText_.style.cssText = '';

  if (style.fontStyle) {
    goog.style.setStyle(this.measurementText_, 'font-style', style['fontStyle']);
    goog.style.setStyle(this.measurementVMLTextPath_, 'font-style', style['fontStyle']);
  }
  if (style.fontVariant) {
    goog.style.setStyle(this.measurementText_, 'font-variant', style['fontVariant']);
    goog.style.setStyle(this.measurementVMLTextPath_, 'font-variant', style['fontVariant']);
  }
  if (style.fontFamily) {
    goog.style.setStyle(this.measurementText_, 'font-family', style['fontFamily']);
    goog.style.setStyle(this.measurementVMLTextPath_, 'font-family', style['fontFamily']);
  }
  if (style.fontSize) {
    goog.style.setStyle(this.measurementText_, 'font-size', style['fontSize']);
    goog.style.setStyle(this.measurementVMLTextPath_, 'font-size', style['fontSize']);
  }
  if (style.fontWeight) {
    goog.style.setStyle(this.measurementText_, 'font-weight', style['fontWeight']);
    goog.style.setStyle(this.measurementVMLTextPath_, 'font-weight', style['fontWeight']);
  } else {
    goog.style.setStyle(this.measurementText_, 'font-weight', 'normal');
    goog.style.setStyle(this.measurementVMLTextPath_, 'font-weight', 'normal');
  }
  if (style.letterSpacing) {
    goog.style.setStyle(this.measurementText_, 'letter-spacing', style['letterSpacing']);
    this.measurementVMLTextPath_.style['v-text-spacing'] = style['letterSpacing'];
  }
  if (style.decoration) {
    goog.style.setStyle(this.measurementText_, 'text-decoration', style['decoration']);
    goog.style.setStyle(this.measurementVMLTextPath_, 'text-decoration', style['decoration']);
  }

  goog.style.setStyle(this.measurementText_, 'border', '0 solid');

  this.setAttribute_(this.measurementVMLTextPath_, 'string', text);
  var width = goog.style.getBounds(this.measurementVMLShape_).width;

  goog.style.setStyle(this.measurement_, {'left': 0, 'top': 0, 'width': 'auto', 'height': 'auto'});
  this.measurementText_.innerHTML = text;
  var boundsMicroText = goog.style.getBounds(this.virtualBaseLine_);
  goog.style.setPosition(this.measurement_, 0, -(boundsMicroText.top + boundsMicroText.height));

  var boundsTargetText = goog.style.getBounds(this.measurementText_);

  boundsTargetText.width = width + additionWidth;
  boundsTargetText.left = boundsTargetText.left - 1;

  this.measurementText_.innerHTML = '';

  return boundsTargetText;
};


/**
 * Measure any svg nodes.
 * @param {string|Node} element .
 * @return {goog.math.Rect} .
 */
acgraph.vector.vml.Renderer.prototype.measureElement = function(element) {
  if (!this.measurement_) this.createMeasurement();

  if (goog.isString(element)) {
    this.measurementGroupNode_.innerHTML = element;
  } else {
    goog.dom.appendChild(this.measurementGroupNode_, element.cloneNode(true));
  }
  var bounds = goog.style.getBounds(this.measurementGroupNode_);
  this.measurementGroupNode_.innerHTML = '';

  return bounds;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Attributes.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Applies attribute to VML element, way of setting depends on IE version.
 * @param {Element|HTMLElement|Node|CSSStyleDeclaration} element VML element to set attribute to.
 * @param {string} key Attribute name.
 * @param {string} value Attribute value.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.setAttribute_ = function(element, key, value) {
  if (acgraph.vector.vml.Renderer.IE8_MODE) {
    element[key] = value;
  } else {
    element.setAttribute(key, value);
  }
};


/**
 * Applies attribute to VML element.
 * @param {Element|Node|CSSStyleDeclaration} element VML element.
 * @param {Object} attrs Attributes.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.setAttributes_ = function(element, attrs) {
  goog.object.forEach(attrs, function(val, key) {
    this.setAttribute_(element, key, val);
  }, this);
};


/**
 * Removes attribute from VML element, the way depends on IE version.
 * @param {CSSStyleDeclaration} style VML style.
 * @param {string} key Attribute name.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.removeStyle_ = function(style, key) {
  if (!style[key]) return;
  style['cssText'] = style['cssText'].replace(new RegExp('(^|; )(' + key + ': [^;]*)(;|$)', 'ig'), ';');
};


/**
 * Removes attribute from VML element.
 * @param {Element|Node} element VML element.
 * @param {string} key Attribute name.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.removeAttribute_ = function(element, key) {
  element.removeAttribute(key);
};


/**
 * Transform size to CSS size. If passed in percents - returned as is,
 * and in pixels otherwise.
 *
 * @param {number|string} size Size.
 * @return {string} Position with regard to <a href='#COORD_MULTIPLIER'>COORD_MULTIPLIER</a>.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.toCssSize_ = function(size) {
  return goog.isString(size) && goog.string.endsWith(size, '%') ?
      parseFloat(size) + '%' : parseFloat(String(size)) + 'px';
};


/**
 * Transforming size with COORD_MULTIPLIER to support
 * fractional values.
 * @param {number} number Size.
 * @return {number} Size transformed with COORD_MULTIPLIER.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.toSizeCoord_ = function(number) {
  return Math.round(number) * acgraph.vector.vml.Renderer.COORD_MULTIPLIER_;
};


/**
 * Applies size and position of VML elements in parent container VML.
 * @param {Element} element VML DOM element.
 * @param {number} x Top-left X.
 * @param {number} y Top-left Y.
 * @param {number} width Width.
 * @param {number} height Height.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.setPositionAndSize_ = function(element, x, y, width, height) {
  this.setCoordSize(element);
  this.setAttributes_(element['style'], {
    'position': 'absolute',
    'left': this.toCssSize_(x),
    'top': this.toCssSize_(y),
    'width': this.toCssSize_(width),
    'height': this.toCssSize_(height)
  });
};


/**
 * Serializes Path and converts it into string that can be used in VML.
 * @param {acgraph.vector.PathBase} path Path.
 * @param {boolean=} opt_transformed Use transformed instead of original.
 * @return {?string} VML acceptable path.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.getVmlPath_ = function(path, opt_transformed) {
  if (path.isEmpty()) return null;
  var list = [];
  var func = opt_transformed ? path.forEachTransformedSegment : path.forEachSegment;
  func.call(path, function(segment, args) {
    switch (segment) {
      case acgraph.vector.PathBase.Segment.MOVETO:
        list.push('m');
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(args, this.toSizeCoord_), list);
        break;
      case acgraph.vector.PathBase.Segment.LINETO:
        list.push('l');
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(args, this.toSizeCoord_), list);
        break;
      case acgraph.vector.PathBase.Segment.CURVETO:
        list.push('c');
        acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(args, this.toSizeCoord_), list);
        break;
      case acgraph.vector.PathBase.Segment.CLOSE:
        list.push('x');
        break;
      case acgraph.vector.PathBase.Segment.ARCTO:
        var toAngle = args[2] + args[3];
        var cx = this.toSizeCoord_(args[4] - goog.math.angleDx(toAngle, args[0]));
        var cy = this.toSizeCoord_(args[5] - goog.math.angleDy(toAngle, args[1]));
        var rx = this.toSizeCoord_(args[0]);
        var ry = this.toSizeCoord_(args[1]);
        // VML angle in fd (see http://www.w3.org/TR/NOTE-VML)
        // Positive angles go counterclockwise.
        var fromAngle = Math.round(args[2] * -65536);
        var extent = Math.round(args[3] * -65536);
        list.push('ae', cx, cy, rx, ry, fromAngle, extent);
        break;
    }
  }, this);
  return list.join(' ');
};


/**
 * Creates VML element. Way depends on IE version and is set in constrictor.
 * @param {string} tagName Tag name.
 * @return {Element} HTML element.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.createVMLElement_;


/**
 * Checks if there is a class for VML in CSS.
 * @return {boolean} Is the class for VML defined in VML.
 */
acgraph.vector.vml.Renderer.prototype.isVMLClassDefined = function() {
  return !!goog.array.find(goog.cssom.getAllCssStyleRules(), function(cssRule) {
    return cssRule.selectorText === '.' + acgraph.vector.vml.Renderer.VML_CLASS_;
  });
};


/** @inheritDoc **/
acgraph.vector.vml.Renderer.prototype.setId = function(element, id) {
  this.setIdInternal(element.domElement(), id);
};


/**
 * Sets id to element.
 * @param {?Element} element - Element.
 * @param {string} id - ID to be set.
 */
acgraph.vector.vml.Renderer.prototype.setIdInternal = function(element, id) {
  if (element) {
    if (id)
      this.setAttribute_(element, 'id', id);
    else
      this.removeAttribute_(element, 'id');
  }
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTitle = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setDesc = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setAttributes = function(element, attrs) {
  var domElement = element.domElement();
  if (domElement && goog.isObject(attrs)) {
    for (var key in attrs) {
      var value = attrs[key];
      if (goog.isNull(value)) {
        this.removeAttribute_(domElement, key);
      } else {
        this.setAttribute_(domElement, key, /** @type {string} */ (value));
      }
    }
  }
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.getAttribute = function(element, key) {
  return element ? element.getAttribute(key) : void 0;
};


/**
 * Calcualtes linear gradient vector in UserSpaceOnUse mode.
 * @param {number} angle Angle.
 * @param {!goog.math.Rect} bounds Bounds.
 * @return {!{p1: !goog.math.Coordinate, p2: !goog.math.Coordinate}} Vector coordinates.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.getUserSpaceOnUseGradientVector_ = function(angle, bounds) {
  // Transform angle so it falls into [0; 90) range.
  // Note:
  //'[' - inclusive
  //'(' - exclusive
  /** @type {number} */
  var angleTransform = angle % 90;
  /** @type {number} */
  var radAngle = goog.math.toRadians(angle);
  // increment from center to calculate start and end of gradient vector.
  /** @type {number} */
  var dx = 1;
  /** @type {number} */
  var dy = 1;
  // shape center coordinates
  /** @type {number} */
  var centerX = bounds.left + bounds.width / 2;
  /** @type {number} */
  var centerY = bounds.top + bounds.height / 2;
  /**
   * For angles in 180 to 360 range gradient vector is just the same as for 0 to 180 range,
   * but direction is opposite. Check the angle and set swap variable that changes vector direction.
   * P.S. Sine of angles from 180 to 360 is less than zero, but it doesn't exist in 180 and 360
   * so there are additional checks.
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

  /** @type {number} */
  var tanAngle = Math.tan(radAngleTransform);

  var halfLengthVector = Math.sin(radAngleTransform) * (bounds.height / 2 - (tanAngle * bounds.width / 2)) +
      Math.sqrt(Math.pow(bounds.width / 2, 2) * (1 + Math.pow(tanAngle, 2)));

  dx *= Math.cos(radAngleTransform) * halfLengthVector;
  dy *= Math.sin(radAngleTransform) * halfLengthVector;

  if (swap) {
    dx = -dx;
    dy = -dy;
  }
  return {
    p1: new goog.math.Coordinate(Math.round(centerX - dx), Math.round(centerY + dy)),
    p2: new goog.math.Coordinate(Math.round(centerX + dx), Math.round(centerY - dy))
  };
};


/**
 * Calculates offset of point with regard to gradient vector in UserSpaceOnUse mode.
 * @param {goog.math.Coordinate} point Point.
 * @param {{p1: !goog.math.Coordinate, p2: !goog.math.Coordinate}} vector Gradient vector.
 * @return {number} Offset for perpendicular dropped from point to gradient vector (from vector start).
 * @private
 */
acgraph.vector.vml.Renderer.prototype.getOffsetOfPointRelativeGradientVector_ = function(point, vector) {
  // Calculate the base of perpendicular dropped from point to gradient vector.
  var baseNormal_x, baseNormal_y;
  if (vector.p1.x == vector.p2.x) {
    baseNormal_x = vector.p1.x;
    baseNormal_y = point.y;
  } else if (vector.p1.y == vector.p2.y) {
    baseNormal_x = point.x;
    baseNormal_y = vector.p1.y;
  } else {
    baseNormal_x = (vector.p1.x * Math.pow((vector.p2.y - vector.p1.y), 2) +
        point.x * Math.pow((vector.p2.x - vector.p1.x), 2) + (vector.p2.x -
        vector.p1.x) * (vector.p2.y - vector.p1.y) * (point.y - vector.p1.y)) /
        (Math.pow((vector.p2.y - vector.p1.y), 2) + Math.pow(vector.p2.x - vector.p1.x, 2));
    baseNormal_y = (vector.p2.x - vector.p1.x) * (point.x - baseNormal_x) /
        (vector.p2.y - vector.p1.y) + point.y;
  }
  /**
   * Perpendicular base. Offset point for the first angle of shape bounds.
   * @type {goog.math.Coordinate}
   */
  var baseNormal = new goog.math.Coordinate(baseNormal_x, baseNormal_y);

  // Calculate parameters to find point position.
  /**
   * Array of two numbers that define vector direction.
   * @type {Array.<number>}
   */
  var gradientVectorDirection = [
    goog.math.clamp(vector.p1.x - vector.p2.x, -1, 1),
    goog.math.clamp(vector.p1.y - vector.p2.y, -1, 1)
  ];
  /**
   * Array of two number that define perpendicular base (from vector start).
   * @type {Array.<number>}
   */
  var outsideOfStartGradientVectorPoint = [
    goog.math.clamp(vector.p1.x - baseNormal.x, -1, 1),
    goog.math.clamp(vector.p1.y - baseNormal.y, -1, 1)
  ];
  /**
   * Array of two number that define perpendicular base (from vector end).
   * @type {Array.<number>}
   */
  var outsideOfEndGradientVectorPoint = [
    goog.math.clamp(vector.p2.x - baseNormal.x, -1, 1),
    goog.math.clamp(vector.p2.y - baseNormal.y, -1, 1)
  ];

  /**
   * Checks where the point is relative to vector.
   * -1 - outside the vector, below.
   * 0 - withing the vector.
   * 1 - outside the vector, above.
   * @type {number}
   */
  var outsideOfVector;
  if (gradientVectorDirection[0] == 0) {
    outsideOfVector = (outsideOfStartGradientVectorPoint[1] + outsideOfEndGradientVectorPoint[1]) * gradientVectorDirection[1];
  } else {
    outsideOfVector = (outsideOfStartGradientVectorPoint[0] + outsideOfEndGradientVectorPoint[0]) * gradientVectorDirection[0];
  }

  return outsideOfVector < 0 ?
      - goog.math.Coordinate.distance(vector.p1, baseNormal) :
      goog.math.Coordinate.distance(vector.p1, baseNormal);
};


/**
 * Implements SVG gradient UserSpaceInUse mode for VML gradient.
 * TODO: need to optimize.
 * @param {!Array.<acgraph.vector.GradientKey>} keys Gradient keys.
 * @param {!goog.math.Rect} bounds Gradient bounds.
 * @param {number} angle Angle in [0, 360) range.
 * @param {!goog.math.Rect} shapeBounds Shape bounds.
 * @return {!Array.<acgraph.vector.GradientKey>} Gradient keys for shape.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.userSpaceOnUse_ = function(keys, bounds, angle, shapeBounds) {
  /**
   * Gradient vector for gradient bounds.
   * @type {!{p1: !goog.math.Coordinate, p2: !goog.math.Coordinate}}
   */
  var shapeGradientVector = this.getUserSpaceOnUseGradientVector_(angle, shapeBounds);
  /**
   * Shape gradient vector length.
   * @type {number}
   */
  var shapeGradientVectorLength = goog.math.Coordinate.distance(shapeGradientVector.p1, shapeGradientVector.p2);
  /**
   * Gradient vector for shape bounds.
   * @type {!{p1: !goog.math.Coordinate, p2: !goog.math.Coordinate}}
   */
  var gradientVector = this.getUserSpaceOnUseGradientVector_(angle, bounds);
  /**
   * Gradient vector length.
   * @type {number}
   */
  var gradientVectorLength = goog.math.Coordinate.distance(gradientVector.p1, gradientVector.p2);
  /**
   * Offset for start point of shape gradient vector relative to gradientVector
   * @type {number}
   */
  var offsetStartShapeVectorPoint = this.getOffsetOfPointRelativeGradientVector_(shapeGradientVector.p1, gradientVector);
  /**
    * Offset for end point of shape gradient vector relative to gradientVector
    * @type {number}
    */
  var offsetEndShapeVectorPoint = this.getOffsetOfPointRelativeGradientVector_(shapeGradientVector.p2, gradientVector);
  /**
   * First key for shape gradient.
   * Its offset is calculated as a ratio of pixel shoft relative to start point of gradient vector to its length.
   * Color is defined later as color blend in this offset.
   * @type {acgraph.vector.GradientKey}
   */
  var stopFirst = {'offset': Math.round(offsetStartShapeVectorPoint / gradientVectorLength * 100) / 100, 'color': '', 'opacity': 1};
  /**
   * Last key for shape gradient.
   * Its offset is calculated as a ratio of pixel shoft relative to start point of gradient vector to its length.
   * Color is defined later as color blend in this offset.
   * @type {acgraph.vector.GradientKey}
   */
  var stopLast = {'offset': Math.round(offsetEndShapeVectorPoint / gradientVectorLength * 100) / 100, 'color': '', 'opacity': 1};
  /**
   * Array of keys of gradient shape.
   * @type {Array.<acgraph.vector.GradientKey>}
   */
  var keysForShape = [];
  keysForShape.toString = function() {
    var result = '\n';
    for (var i = 0, len = this.length; i < len; i++) {
      result += 'offset: ' + this[i]['offset'] + '; color: ' + this[i]['color'] + '; opacity: ' + this[i]['opacity'] + '\n';
    }
    return result;
  };
  /**
   * One of the keys of initial gradient, which offset is less than offset of stopFirst key, but
   * the closest to it.
   * @type {acgraph.vector.GradientKey}
   */
  var stopPrev;
  /**
   * One of the keys of initial gradient, which offset is less than offset of stopLast key, but
   * the closest to it.
   * @type {acgraph.vector.GradientKey}
   */
  var stopNext;
  /**
   * Pixel value of offset of stopPrev key.
   * @type {number}
   */
  var offsetStopPrev;
  /**
   * Pixel value of offset of stopNext key.
   * @type {number}
   */
  var offsetStopNext;
  /**
   * Shape gradient keys. keysForShape array gets only keys that go
   * through this shape.
   */
  keysForShape.push(stopFirst);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    k['color'] = goog.color.parse(k['color']).hex;
    if (k['offset'] <= stopFirst['offset']) {
      stopPrev = {'offset': k['offset'], 'color': k['color'], 'opacity': k['opacity']};
    } else if ((k['offset'] > stopFirst['offset']) && (k['offset'] < stopLast['offset'])) {
      keysForShape.push({'offset': k['offset'], 'color': k['color'], 'opacity': k['opacity']});
    } else if ((k['offset'] >= stopLast['offset']) && !stopNext) {
      stopNext = {'offset': k['offset'], 'color': k['color'], 'opacity': k['opacity']};
    }
  }
  keysForShape.push(stopLast);
  /**
   * Define colors for the first and last offset for shape gradient. We know base offset colors,
   * they are taken from the initial gradient.
   */
  /** @type {number} */
  var offset1 = 1.0;
  /** @type {number} */
  var offset2 = 1.0;
  if (keysForShape.length > 2) {
    // Calculate color for the first key.
    if (!stopPrev) stopPrev = keysForShape[1];
    offsetStopPrev = gradientVectorLength * stopPrev['offset'];
    /** @type {number} */
    var offsetStopNextAfterFirst = gradientVectorLength * keysForShape[1]['offset'];
    /** @type {number} */
    var lengthBetween1 = Math.abs(offsetStopNextAfterFirst - offsetStopPrev);
    /** @type {goog.color.Rgb} */
    var startColor1 = goog.color.hexToRgb(String(stopPrev['color']));
    /** @type {goog.color.Rgb} */
    var endColor1 = goog.color.hexToRgb(String(keysForShape[1]['color']));

    offset1 -= lengthBetween1 == 0 ? 0 : Math.abs(offsetStartShapeVectorPoint - offsetStopPrev) / lengthBetween1;
    stopFirst['color'] = goog.color.rgbArrayToHex(goog.color.blend(startColor1, endColor1, offset1));

    // Calculate color for the last key.
    if (!stopNext) stopNext = keysForShape[keysForShape.length - 2];
    offsetStopNext = gradientVectorLength * stopNext['offset'];
    /** @type {number} */
    var offsetStopPenultimate = gradientVectorLength * keysForShape[keysForShape.length - 2]['offset'];
    /** @type {number} */
    var lengthBetween2 = Math.abs(offsetStopPenultimate - offsetStopNext);
    /** @type {goog.color.Rgb} */
    var startColor2 = goog.color.hexToRgb(String(keysForShape[keysForShape.length - 2]['color']));
    /** @type {goog.color.Rgb} */
    var endColor2 = goog.color.hexToRgb(String(stopNext['color']));

    offset2 -= lengthBetween2 == 0 ? 0 : Math.abs(offsetEndShapeVectorPoint - offsetStopPenultimate) / lengthBetween2;
    stopLast['color'] = goog.color.rgbArrayToHex(goog.color.blend(startColor2, endColor2, offset2));
  } else {
    if (!stopPrev && (stopNext['offset'] == 0)) stopPrev = stopNext;
    if (!stopNext && (stopPrev['offset'] == 1)) stopNext = stopPrev;

    offsetStopPrev = gradientVectorLength * stopPrev['offset'];
    offsetStopNext = gradientVectorLength * stopNext['offset'];
    /** @type {goog.color.Rgb} */
    var startColor = goog.color.hexToRgb(String(stopPrev['color']));
    /** @type {goog.color.Rgb} */
    var endColor = goog.color.hexToRgb(String(stopNext['color']));
    /** @type {number} */
    var lengthBetween = Math.abs(offsetStopNext - offsetStopPrev);

    offset1 -= lengthBetween == 0 ? 0 : Math.abs(offsetStartShapeVectorPoint - offsetStopPrev) / lengthBetween;
    offset2 -= lengthBetween == 0 ? 0 : Math.abs(offsetEndShapeVectorPoint - offsetStopPrev) / lengthBetween;

    stopFirst['color'] = goog.color.rgbArrayToHex(goog.color.blend(startColor, endColor, offset1));
    stopLast['color'] = goog.color.rgbArrayToHex(goog.color.blend(startColor, endColor, offset2));
  }
  stopFirst['opacity'] = stopPrev['opacity'];
  stopLast['opacity'] = stopNext['opacity'];

  /**
   * Reset shape gradient offset relative to gradient line.
   */
  for (i = 0; i < keysForShape.length; i++) {
    if (i == 0) {
      keysForShape[i]['offset'] = 0;
    } else if (i == keysForShape.length - 1) {
      keysForShape[i]['offset'] = 1;
    } else {
      keysForShape[i]['offset'] = (Math.abs(offsetStartShapeVectorPoint - (keysForShape[i]['offset'] * gradientVectorLength))) / shapeGradientVectorLength;
    }
  }
  return keysForShape;
};
//endregion


//region --- Creating root DOM element ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Creating root DOM element
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createStageElement = function() {
  return goog.dom.createDom('div', {'style': 'overflow:hidden;position:relative;'});
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setStageSize = function(el, width, height) {
  this.setAttributes_(el['style'], {
    'width': this.toCssSize_(width),
    'height': this.toCssSize_(height)
  });
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createDefsElement = function() {
  return goog.dom.createElement('div');
};


//endregion
//region --- VML Primitives ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Creating VML primitives
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createLayerElement = function() {
  return goog.dom.createElement('div');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createImageElement = function() {
  return this.createVMLElement_('image');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createRectElement = function() {
  return this.createVMLElement_('shape');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createCircleElement = function() {
  return this.createVMLElement_('shape');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createPathElement = function() {
  return this.createVMLElement_('shape');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createEllipseElement = function() {
  return this.createVMLElement_('shape');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createLinearGradientElement = function() {
  return this.createVMLElement_('fill');
};


/**
 * Creates VML ShapeType.
 * @return {Element} DOM element.
 */
acgraph.vector.vml.Renderer.prototype.createShapeTypeElement = function() {
  return this.createVMLElement_('shapetype');
};


/**
 * Creates fill element. In VML fill can be set as a separate DOM element.
 * @return {Element} DOM element.
 */
acgraph.vector.vml.Renderer.prototype.createFillElement = function() {
  return this.createVMLElement_('fill');
};


/**
 * Creates stroke element. In VML stroke can be set as a separate DOM element.
 * @return {Element} DOM element.
 */
acgraph.vector.vml.Renderer.prototype.createStrokeElement = function() {
  return this.createVMLElement_('stroke');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createFillPatternElement = function() {
  return goog.dom.createElement('div');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setFillPatternProperties = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setPatternTransformation = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setLayerSize = function(layer) {
  this.setAttributes_(layer.domElement()['style'], {
    'position': 'absolute',
    'left': this.toCssSize_(0),
    'top': this.toCssSize_(0),
    'width': this.toCssSize_(1),
    'height': this.toCssSize_(1)
  });
};


/**
 * Sets coordsize.
 * @param {Element} element Element.
 */
acgraph.vector.vml.Renderer.prototype.setCoordSize = function(element) {
  this.setAttribute_(element, 'coordsize', this.toSizeCoord_(1) + ' ' + this.toSizeCoord_(1));
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setImageProperties = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  var domElement = element.domElement();

  // If image src is not defined we need to remove it.
  // To remove we use 1x1 pixel image in base64 encoding.
  // We can't remove image with removeAttribute - it doesn't work,
  // image remains in place.
  var src = /** @type {string} */(element.src() || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
  var align = element.align(), calcX, calcY, calcWidth, calcHeight;
  if (align == acgraph.vector.Image.Align.NONE) {
    calcX = bounds.left;
    calcY = bounds.top;
    calcWidth = bounds.width;
    calcHeight = bounds.height;
  } else {
    // measure real size of an image
    var realImageBounds = this.measuringImage(src);

    // calculate bounds proportions and image proportions.
    var widthRate = realImageBounds.width / bounds.width;
    var heightRate = realImageBounds.height / bounds.height;

    var meet = element.fittingMode() == acgraph.vector.Image.Fitting.MEET;

    // choose the right ratio, where we can put image in bounds and preserve
    // image proportions.
    var fitMode;
    if ((widthRate > 1 && heightRate > 1) || (widthRate < 1 && heightRate < 1))
      fitMode = meet ? widthRate > heightRate : widthRate < heightRate;
    else
      fitMode = meet ? widthRate > 1 : widthRate < 1;

    var baseRate = 1 / (fitMode ? widthRate : heightRate);

    // transform coordinates and size of an image, like it happens in svg image element.
    calcWidth = realImageBounds.width * baseRate;
    calcHeight = realImageBounds.height * baseRate;


    switch (align) {
      case acgraph.vector.Image.Align.NONE:
        calcX = bounds.width;
        calcY = bounds.height;
        break;
      case acgraph.vector.Image.Align.X_MIN_Y_MIN:
        calcX = bounds.left;
        calcY = bounds.top;
        break;
      case acgraph.vector.Image.Align.X_MID_Y_MIN:
        calcX = bounds.left + bounds.width / 2 - calcWidth / 2;
        calcY = bounds.top;
        break;
      case acgraph.vector.Image.Align.X_MAX_Y_MIN:
        calcX = bounds.left + bounds.width - calcWidth;
        calcY = bounds.top;
        break;
      case acgraph.vector.Image.Align.X_MIN_Y_MID:
        calcX = bounds.left;
        calcY = bounds.top + bounds.height / 2 - calcHeight / 2;
        break;
      default:
      case acgraph.vector.Image.Align.X_MID_Y_MID:
        calcX = bounds.left + bounds.width / 2 - calcWidth / 2;
        calcY = bounds.top + bounds.height / 2 - calcHeight / 2;
        break;
      case acgraph.vector.Image.Align.X_MAX_Y_MID:
        calcX = bounds.left + bounds.width - calcWidth;
        calcY = bounds.top + bounds.height / 2 - calcHeight / 2;
        break;
      case acgraph.vector.Image.Align.X_MIN_Y_MAX:
        calcX = bounds.left;
        calcY = bounds.top + bounds.height - calcHeight;
        break;
      case acgraph.vector.Image.Align.X_MID_Y_MAX:
        calcX = bounds.left + bounds.width / 2 - calcWidth / 2;
        calcY = bounds.top + bounds.height - calcHeight;
        break;
      case acgraph.vector.Image.Align.X_MAX_Y_MAX:
        calcX = bounds.left + bounds.width - calcWidth;
        calcY = bounds.top + bounds.height - calcHeight;
        break;
    }
  }

  this.setAttributes_(domElement['style'], {
    'position': 'absolute',
    'left': this.toCssSize_(calcX),
    'top': this.toCssSize_(calcY),
    'width': this.toCssSize_(calcWidth),
    'height': this.toCssSize_(calcHeight)
  });

  // set image src in DOM element.
  this.setAttribute_(domElement, 'src', src);

  element.clip(bounds);
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setCircleProperties = function(circle) {
  this.setEllipseProperties(circle);
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setEllipseProperties = function(ellipse) {
  var domElement = ellipse.domElement();
  this.setPositionAndSize_(domElement, 0, 0, 1, 1);

  var cx = /** @type {number} */ (ellipse.centerX());
  var cy = /** @type {number} */ (ellipse.centerY());
  var rx = /** @type {number} */ (ellipse.radiusX());
  var ry = /** @type {number} */ (ellipse.radiusY());

  var transform = ellipse.getFullTransformation();
  var list;
  if (transform && !transform.isIdentity()) {
    var curves = acgraph.math.arcToBezier(cx, cy, rx, ry, 0, 360, false);
    var len = curves.length;
    transform.transform(curves, 0, curves, 0, len / 2);
    list = ['m', this.toSizeCoord_(curves[len - 2]), this.toSizeCoord_(curves[len - 1]), 'c'];
    acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(curves, this.toSizeCoord_), list);
  } else {
    list = ['ae',
      this.toSizeCoord_(cx),
      this.toSizeCoord_(cy),
      this.toSizeCoord_(rx),
      this.toSizeCoord_(ry),
      0,
      Math.round(360 * -65536)];
  }
  list.push('x');

  ellipse.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  ellipse.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);

  this.setAttribute_(domElement, 'path', list.join(' '));
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setPathProperties = function(path) {
  var element = path.domElement();

  this.setPositionAndSize_(element, 0, 0, 1, 1);

  var pathData = this.getVmlPath_(path, true);
  if (pathData)
    this.setAttribute_(element, 'path', pathData);
  else {
    this.setAttribute_(element, 'path', 'M 0,0');
    this.removeAttribute_(element, 'path');
  }

  path.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  path.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createTextSegmentElement = function() {
  var textSegmentDOMElement = this.createVMLElement_('shape');
  var path = this.createVMLElement_('path');
  path.setAttribute('textpathok', 't');
  goog.dom.appendChild(textSegmentDOMElement, path);
  return textSegmentDOMElement;
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createTextElement = function() {
  return goog.dom.createElement('span');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.createTextNode = function(text) {
  var textPath = this.createVMLElement_('textpath');
  textPath.setAttribute('on', 't');
  textPath.setAttribute('string', text);

  return textPath;
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setCursorProperties = function(element, cursor) {
  var domElement = element.domElement();
  if (domElement)
    domElement.style['cursor'] = cursor || '';
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTextPosition = function(element) {
  var domElement = element.domElement();
  var domElementStyle = domElement['style'];

  var x, y;
  if (element.isComplex()) {
    y = element.calcY;
    if (element.getSegments().length)
      y -= element.getSegments()[0].baseLine;
    x = element.calcX;
    this.setAttributes_(domElementStyle, {
      'position': 'absolute',
      'overflow': 'visible',
      'left': this.toCssSize_(x),
      'top': this.toCssSize_(y)
    });
  } else {
    x = /** @type {number} */ (element.x());
    y = /** @type {number} */ (element.y());

    if (element.vAlign() && element.height() && element.height() > element.realHeigth) {
      if (element.vAlign() == acgraph.vector.Text.VAlign.MIDDLE) y += element.height() / 2 - element.realHeigth / 2;
      if (element.vAlign() == acgraph.vector.Text.VAlign.BOTTOM) y += element.height() - element.realHeigth;
    }

    this.setAttributes_(domElementStyle, {
      'position': 'absolute',
      'overflow': 'hidden',
      'left': this.toCssSize_(x),
      'top': this.toCssSize_(y)
    });
  }
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTextProperties = function(element) {
  var domElement = element.domElement();
  var domElementStyle = domElement['style'];
  domElement.style.cssText = '';
  if (element.isComplex()) {
    this.setAttributes_(domElementStyle, {
      'width': this.toCssSize_(1),
      'height': this.toCssSize_(1)
    });
    domElement.innerHTML = '';
  } else {
    var text = element.getSimpleText();
    if (text == null) return;

    if (element.fontSize()) goog.style.setStyle(domElement, 'font-size', /** @type {number|string} */ (element.fontSize()));
    if (element.color()) goog.style.setStyle(domElement, 'color', /** @type {string} */ (element.color()));
    if (element.fontFamily()) goog.style.setStyle(domElement, 'font-family', /** @type {string} */ (element.fontFamily()));
    if (element.fontStyle()) goog.style.setStyle(domElement, 'font-style', /** @type {string} */ (element.fontStyle()));
    if (element.fontVariant()) goog.style.setStyle(domElement, 'font-variant', /** @type {string} */ (element.fontVariant()));
    if (element.fontWeight()) goog.style.setStyle(domElement, 'font-weight', /** @type {string|number} */ (element.fontWeight()));
    if (element.letterSpacing()) goog.style.setStyle(domElement, 'letter-spacing', /** @type {string|number} */ (element.letterSpacing()));
    if (element.decoration()) goog.style.setStyle(domElement, 'text-decoration', /** @type {string} */ (element.decoration()));
    if (element.opacity()) domElementStyle['filter'] = 'alpha(opacity=' + (element.opacity() * 100) + ')';
    if (element.lineHeight()) goog.style.setStyle(domElement, 'line-height', /** @type {string|number} */ (element.lineHeight()));
    if (element.textIndent()) goog.style.setStyle(domElement, 'text-indent', /** @type {number} */ (element.textIndent()));
    if (element.textOverflow() == '...') goog.style.setStyle(domElement, 'text-overflow', 'ellipsis');
    if (element.textOverflow() == '') goog.style.setStyle(domElement, 'text-overflow', 'clip');
    if (element.direction()) goog.style.setStyle(domElement, 'direction', /** @type {string} */ (element.direction()));

    if (element.textWrap() == acgraph.vector.Text.TextWrap.BY_LETTER && element.width()) {
      goog.style.setStyle(domElement, 'word-break', 'break-all');
      goog.style.setStyle(domElement, 'white-space', 'normal');
    } else {
      goog.style.setStyle(domElement, 'word-break', 'normal');
      goog.style.setStyle(domElement, 'white-space', 'nowrap');
    }
    if (element.hAlign()) {
      if (element.rtl)
        domElement.style['text-align'] =
            (element.hAlign() == acgraph.vector.Text.HAlign.END || element.hAlign() == acgraph.vector.Text.HAlign.LEFT) ?
                acgraph.vector.Text.HAlign.LEFT :
                (element.hAlign() == acgraph.vector.Text.HAlign.START || element.hAlign() == acgraph.vector.Text.HAlign.RIGHT) ?
                    acgraph.vector.Text.HAlign.RIGHT :
                    acgraph.vector.Text.HAlign.CENTER;
      else
        domElement.style['text-align'] =
            (element.hAlign() == acgraph.vector.Text.HAlign.END || element.hAlign() == acgraph.vector.Text.HAlign.RIGHT) ?
                acgraph.vector.Text.HAlign.RIGHT :
                (element.hAlign() == acgraph.vector.Text.HAlign.START || element.hAlign() == acgraph.vector.Text.HAlign.LEFT) ?
                    acgraph.vector.Text.HAlign.LEFT :
                    acgraph.vector.Text.HAlign.CENTER;
    }

    goog.style.setUnselectable(domElement, !element.selectable());
    domElement.innerHTML = element.getSimpleText();
    this.setAttribute_(domElementStyle, 'width', String(element.width() ? this.toCssSize_(/** @type {string|number} */ (element.width())) : element.getBounds().width));
    this.setAttribute_(domElementStyle, 'height', String(element.height() ? this.toCssSize_(/** @type {string|number} */ (element.height())) : element.getBounds().height));
  }
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTextSegmentPosition = function(element) {
  var domElement = element.domElement();
  var path =
      'm ' +
          this.toSizeCoord_(element.x) + ',' +
          this.toSizeCoord_(element.y) + ' l ' +
          (this.toSizeCoord_(element.x) + 1) + ',' +
          this.toSizeCoord_(element.y) + ' e';

  domElement.setAttribute('path', path);
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTextSegmentProperties = function(element) {
  var textEntry = element.parent();
  var textStyle = textEntry.style();
  var segmentStyle = element.getStyle();
  var domElement = element.domElement();

  var style = goog.object.clone(textStyle);
  goog.object.extend(style, segmentStyle);

  var textNode = /** @type {Element} */ (this.createTextNode(element.text));

  if (style['fontStyle']) goog.style.setStyle(textNode, 'font-style', style['fontStyle']);
  if (style['fontVariant']) goog.style.setStyle(textNode, 'font-variant', style['fontVariant']);
  if (style['fontFamily']) goog.style.setStyle(textNode, 'font-family', style['fontFamily']);
  if (style['fontSize']) goog.style.setStyle(textNode, 'font-size', style['fontSize']);
  if (style['fontWeight']) goog.style.setStyle(textNode, 'font-weight', style['fontWeight']);
  if (style['letterSpacing']) textNode.style['v-text-spacing'] = style['letterSpacing'];
  if (style['decoration']) goog.style.setStyle(textNode, 'text-decoration', style['decoration']);
  if (style['hAlign']) {
    if (textEntry.rtl)
      textNode.style['v-text-align'] =
          (style['hAlign'] == acgraph.vector.Text.HAlign.END || style['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
              acgraph.vector.Text.HAlign.LEFT :
              (style['hAlign'] == acgraph.vector.Text.HAlign.START || style['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
                  acgraph.vector.Text.HAlign.RIGHT :
                  acgraph.vector.Text.HAlign.CENTER;
    else
      textNode.style['v-text-align'] =
          (style['hAlign'] == acgraph.vector.Text.HAlign.END || style['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
              acgraph.vector.Text.HAlign.RIGHT :
              (style['hAlign'] == acgraph.vector.Text.HAlign.START || style['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
                  acgraph.vector.Text.HAlign.LEFT :
                  acgraph.vector.Text.HAlign.CENTER;
  }

  if (style['opacity']) {
    var fill = this.createFillElement();
    this.setAttribute_(fill, 'opacity', style['opacity']);
    goog.dom.appendChild(domElement, fill);
  }

  goog.dom.appendChild(domElement, textNode);
  if (!textEntry.selectable()) this.setAttribute_(domElement, 'unselectable', 'on');
  else domElement.removeAttribute('unselectable');

  this.setPositionAndSize_(domElement, 0, 0, 1, 1);

  domElement.setAttribute('filled', 't');
  domElement.setAttribute('fillcolor', style['color']);
  domElement.setAttribute('stroked', 'f');
};


/**
 * Resets the text so it displays properly on IE8. Noop in older
 * versions.
 * @param {acgraph.vector.Element} element Text element.
 */
acgraph.vector.vml.Renderer.prototype.textEarsFeint = function(element) {
  var domElement = element.domElement();
  if (acgraph.vector.vml.Renderer.IE8_MODE && element.domElement())
    domElement.innerHTML = domElement.innerHTML;
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.needsAnotherBehaviourForCalcText = function() {
  return true;
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.applyFillAndStroke = function(element) {
  /**
   * Shape fill, default if not set.
   * @type {acgraph.vector.Fill}
   */
  var fill = /** @type {acgraph.vector.Fill} */(element.fill());
  /**
   * Native pattern fill in VML works only with images, nothing like SVG  pattern fill,
   * so for now we just do not fill in VML,
   * probably we will add fully custom pattern fill later.
   */
  if (fill instanceof acgraph.vector.PatternFill) {
    fill = 'black';
  }
  /**
   * Shape stroke, default if not set.
   * @type {acgraph.vector.Stroke}
   */
  var stroke = /** @type {acgraph.vector.Stroke} */(element.stroke());
  /**
   * Stroke color.
   * @type {string}
   */
  var strokeColor;
  if (goog.isString(stroke))
    strokeColor = /** @type {string} */(stroke);
  else if ('keys' in stroke) // VML does not support gradient stroke, so just color it in the color of the first key.
    strokeColor = (stroke['keys'].length != 0) ? stroke['keys'][0]['color'] : '#000';
  else
    strokeColor = stroke['color'];
  /**
   * Whether fill is a radial gradient.
   * @type {boolean}
   */
  var isRadialGradient = !goog.isString(fill) && ('keys' in fill) && ('cx' in fill) && ('cy' in fill);
  /**
   * Whether fill is a gradient.
   * @type {boolean}
   */
  var isLinearGradient = !goog.isString(fill) && ('keys' in fill) && !isRadialGradient;
  /**
   * Whether fill is solid color.
   * @type {boolean}
   */
  var isFill = !isRadialGradient && !isLinearGradient;
  /**
   * Fill or not.
   * @type {boolean}
   */
  var filled = fill != 'none' && fill['color'] != 'none';
  /**
   * Stroke fill or not.
   * @type {boolean}
   */
  var stroked = strokeColor != 'none' && stroke['thickness'] != 0;
  /**
   * Checks if the fill is "complex" (color and opacity set together),
   * VML does it with two nodes only.
   * @type {boolean}
   */
  var complexFill = isFill && filled && fill['opacity'] != 1;
  /**
   * Check is the stroke is "complex" (color set with opacity or lineJoin).
   * VML does it with several nodes only.
   * @type {boolean}
   */
  var complexStroke = (!goog.isString(stroke) && stroked &&
      (stroke['opacity'] != 1 ||
      stroke['lineJoin'] != acgraph.vector.StrokeLineJoin.MITER ||
      stroke['lineCap'] != acgraph.vector.StrokeLineCap.BUTT ||
      stroke['dash'] != 'none'));

  /**
   * Defines whether we use ShapeType of object or we can go with primitive properties.
   * @type {boolean}
   */
  var requireShapeType = isRadialGradient || isLinearGradient || complexFill || complexStroke;

  var firstKey, lastKey, userSpaceOnUse, angle, keys;

  if (!requireShapeType) {
    this.setAttributes_(element.domElement(), {
      'type': '',
      'filled': filled,
      'fillcolor': fill['color'] || fill,
      'stroked': stroked,
      'strokecolor': strokeColor,
      'strokeweight': stroke['thickness'] ? stroke['thickness'] + 'px' : '1px'
    });
  } else {
    var stage = element.getStage();
    var defs = stage.getDefs();
    /** @type {!goog.math.Rect} */
    var elBounds;
    if (element instanceof acgraph.vector.Path && (/** @type {acgraph.vector.Path} */(element)).isEmpty())
      elBounds = new goog.math.Rect(0, 0, 1, 1);
    else
      elBounds = element.getBounds();

    /** @type {!(string|acgraph.vector.SolidFill|acgraph.vector.LinearGradient|acgraph.vector.vml.RadialGradient)} */
    var normalizedFill;

    // Transform gradient for userSpaceOnUse and saveAngle modes.
    if (isLinearGradient) {
      userSpaceOnUse = fill['mode'] instanceof goog.math.Rect;
      keys = goog.array.slice(fill['keys'], 0);
      // we need lasr and first key (with 0 and 1 offset);
      if (keys[0]['offset'] != 0)
        keys.unshift({'offset': 0, 'color': keys[0]['color'], 'opacity': keys[0]['opacity']});
      lastKey = keys[keys.length - 1];
      if (lastKey['offset'] != 1)
        keys.push({'offset': 1, 'color': lastKey['color'], 'opacity': lastKey['opacity']});
      var trueAngle = fill['mode'] ?
          this.saveGradientAngle(fill['angle'], elBounds) :
          fill['angle'];
      normalizedFill = defs.getLinearGradient(
          userSpaceOnUse ?
              this.userSpaceOnUse_(
                  keys,
                  fill['mode'],
                  trueAngle,
                  elBounds
              ) :
              keys,
          fill['opacity'],
          trueAngle,
          fill['mode']);
    } else if (isRadialGradient) {
      var size_x, size_y, cx, cy;
      if (fill['mode']) {
        var fillBounds = fill['mode'];
        var diameter = Math.min(fillBounds.width, fillBounds.height);

        cx = (fill['cx'] * fillBounds.width - (elBounds.left - fillBounds.left)) / elBounds.width;
        cy = (fill['cy'] * fillBounds.height - (elBounds.top - fillBounds.top)) / elBounds.height;

        var radius = 0.5;
        size_x = radius * 2 * (diameter / elBounds.width);
        size_y = radius * 2 * (diameter / elBounds.height);
      } else {
        cx = fill['cx'];
        cy = fill['cy'];
        size_x = size_y = 1;
      }

      normalizedFill = defs.getVMLRadialGradient(fill['keys'], cx, cy, size_x, size_y, fill['opacity'], fill['mode']);
    } else {
      normalizedFill = /** @type {string|acgraph.vector.SolidFill} */(fill);
    }

    /** @type {acgraph.vector.vml.ShapeType} */
    var shapeType = defs.getShapeType(normalizedFill, stroke);
    /** @type {Element} */
    var shapeTypeDomElement;

    // Render shapeType
    if (!shapeType.rendered) {
      shapeTypeDomElement = this.createShapeTypeElement();
      this.setIdInternal(shapeTypeDomElement, acgraph.utils.IdGenerator.getInstance().identify(shapeType));
      this.appendChild(defs.domElement(), shapeTypeDomElement);
      shapeType.rendered = true;

      // Render fill
      var fillDomElement = null;
      if (isLinearGradient) {
        var lg = /** @type {acgraph.vector.LinearGradient} */(normalizedFill);
        if (lg.rendered) {
          lg = new acgraph.vector.LinearGradient(lg.keys, lg.opacity, lg.angle, lg.mode);
          shapeType.setFill(lg);
        }

        fillDomElement = this.createFillElement();

        keys = lg.keys;
        var colors = [];

        goog.array.forEach(keys, function(key) {
          colors.push(key['offset'] + ' ' + key['color']);
        }, this);

        /**
         * Transform gradient angle in VML coordinates and transform it to equivalent
         * in 0 to 360 range.
         * In VML gradient line with 0 degrees angle is a perpendicular  drop from top to bottom
         * (Think of six o'clock). Gradient angle can be only in -360 to 360 range in VML.
         */
        angle = goog.math.standardAngle(lg.angle + 270);

        lastKey = keys[keys.length - 1];
        firstKey = keys[0];

        var opacity = userSpaceOnUse ? lg.opacity : (isNaN(firstKey['opacity']) ? lg.opacity : firstKey['opacity']);
        var opacity2 = userSpaceOnUse ? lg.opacity : (isNaN(lastKey['opacity']) ? lg.opacity : lastKey['opacity']);

        this.setAttributes_(fillDomElement, {
          'type': 'gradient',
          'method': 'none',
          'colors': colors.join(','),
          'angle': angle,
          'color': firstKey['color'],
          'opacity': opacity2,
          'color2': lastKey['color'],
          'o:opacity2': opacity
        });

        this.appendChild(shapeTypeDomElement, fillDomElement);
        lg.defs = defs;
        lg.rendered = true;

      } else if (isRadialGradient) {
        var rg = /** @type {acgraph.vector.vml.RadialGradient} */(normalizedFill);
        if (rg.rendered) {
          rg = new acgraph.vector.vml.RadialGradient(rg.keys, rg.cx, rg.cy, rg.size_x, rg.size_y, rg.opacity, rg.bounds);
          shapeType.setFill(rg);
        }
        fillDomElement = this.createFillElement();

        keys = rg.keys;

        firstKey = keys[keys.length - 1];
        lastKey = keys[0];

        this.setAttributes_(fillDomElement, {
          'src': stage['pathToRadialGradientImage'],
          'size': rg.size_x + ',' + rg.size_y,
          'origin': '.5, .5',
          'position': rg.cx + ',' + rg.cy,
          'type': 'pattern',
          'method': 'linear sigma',
          'colors': '0 ' + firstKey['color'] + ';1 ' + lastKey['color'],
          'color': firstKey['color'],
          'opacity': isNaN(firstKey['opacity']) ? rg.opacity : firstKey['opacity'],
          'color2': lastKey['color'],
          'o:opacity2': isNaN(lastKey['opacity']) ? rg.opacity : lastKey['opacity']
        });

        this.appendChild(shapeTypeDomElement, fillDomElement);
        rg.defs = defs;
        rg.rendered = true;
      } else if (isFill) {
        fillDomElement = shapeType.fillDomElement ?
            shapeType.fillDomElement :
            shapeType.fillDomElement = this.createFillElement();

        if (goog.isString(fill)) {
          this.setAttributes_(element.domElement(), {
            'fillcolor': fill,
            'filled': fill != 'none'
          });
          this.setAttributes_(fillDomElement, {
            'type': 'solid',
            'on': fill != 'none',
            'color': fill,
            'opacity': 1
          });
        } else {
          this.setAttributes_(element.domElement(), {
            'fillcolor': fill['color'],
            'filled': fill['color'] != 'none'
          });
          this.setAttributes_(fillDomElement, {
            'type': 'solid',
            'on': fill['color'] != 'none',
            'color': fill['color'],
            'opacity': isNaN(fill['opacity']) ? 1 : fill['opacity']
          });
        }
      }
      this.appendChild(shapeTypeDomElement, fillDomElement);

      var strokeDomElement = shapeType.strokeDomElement ?
          shapeType.strokeDomElement :
          shapeType.strokeDomElement = this.createStrokeElement();

      var thickness = stroke['thickness'] ? stroke['thickness'] : 1;
      var dash = this.vmlizeDash(stroke['dash'], thickness);
      var cap = dash ? 'flat' : stroke['lineCap'];
      this.setAttributes_(strokeDomElement, {
        // we do this in such perverted way beacaus if linejoin is MITER - dash doesn't work in VML.
        'joinstyle': stroke['lineJoin'] || acgraph.vector.StrokeLineJoin.MITER,
        'endcap': cap == acgraph.vector.StrokeLineCap.BUTT ? 'flat' : cap,
        'dashstyle': dash,
        'on': stroked,
        'color': strokeColor,
        'opacity': (goog.isObject(stroke) && ('opacity' in stroke)) ? stroke['opacity'] : 1,
        'weight': thickness + 'px'
      });
      this.appendChild(shapeTypeDomElement, strokeDomElement);
    }


    if (isRadialGradient || isLinearGradient) {
      firstKey = normalizedFill.keys[normalizedFill.keys.length - 1];
      this.setAttributes_(element.domElement(), {
        'fillcolor': firstKey['color'],
        'filled': firstKey['color'] != 'none'
      });
    }

    this.setAttributes_(element.domElement(), {
      'filled': filled,
      'fillcolor': fill['color'] || fill,
      'stroked': stroked,
      'strokecolor': strokeColor,
      'strokeweight': stroke['thickness'] ? stroke['thickness'] + 'px' : '1px'
    });

    this.setAttributes_(element.domElement(), {'type': '#' + acgraph.utils.IdGenerator.getInstance().identify(shapeType)});
  }
};


/**
 * @param {string} dash Source dash in SVG style.
 * @param {number} lineThickness Line thickness.
 * @return {string} VML Dash.
 */
acgraph.vector.vml.Renderer.prototype.vmlizeDash = function(dash, lineThickness) {
  dash = String(dash);
  if (!dash) return 'none';
  var lengths = dash.split(' ');
  if (lengths.length % 2 != 0)
    lengths.push.apply(lengths, lengths); // repeat the pattern
  var result = [];
  for (var i = 0; i < lengths.length; i++) {
    result.push(Math.ceil(parseFloat(lengths[i]) / lineThickness));
  }
  return result.join(' ');
};


//endregion
//----------------------------------------------------------------------------------------------------------------------
//
//  Element properties
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setVisible = function(element) {
  var style = element.domElement()['style'];
  this.setAttribute_(style, 'visibility', element.visible() ? '' : 'hidden');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTransformation = function(element) {
  this.setTransform_(element, element.getBoundsWithoutTransform());
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setRectTransformation = function(element) {
  var bounds = element.getBoundsWithoutTransform();
  var domElement = element.domElement();

  var left = bounds.left;
  var top = bounds.top;
  var right = left + bounds.width;
  var bottom = top + bounds.height;
  var points = [right, top, right, bottom, left, bottom, left, top];

  var transform = element.getFullTransformation();
  if (transform && !transform.isIdentity())
    transform.transform(points, 0, points, 0, points.length / 2);

  points = goog.array.map(points, this.toSizeCoord_);
  var pathData = ['m', points[6], points[7], 'l'];
  acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, points, pathData);
  pathData.push('x');

  this.setAttribute_(domElement, 'path', pathData.join(' '));
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setEllipseTransformation = function(element) {
  var domElement = element.domElement();

  var cx = /** @type {number} */ (element.centerX());
  var cy = /** @type {number} */ (element.centerY());
  var rx = /** @type {number} */ (element.radiusX());
  var ry = /** @type {number} */ (element.radiusY());

  var transform = element.getFullTransformation();
  var list;
  if (transform && !transform.isIdentity()) {
    var curves = acgraph.math.arcToBezier(cx, cy, rx, ry, 0, 360, false);
    var len = curves.length;
    transform.transform(curves, 0, curves, 0, len / 2);
    list = ['m', this.toSizeCoord_(curves[len - 2]), this.toSizeCoord_(curves[len - 1]), 'c'];
    acgraph.utils.partialApplyingArgsToFunction(Array.prototype.push, goog.array.map(curves, this.toSizeCoord_), list);
  } else {
    list = ['ae',
      this.toSizeCoord_(cx),
      this.toSizeCoord_(cy),
      this.toSizeCoord_(rx),
      this.toSizeCoord_(ry),
      0,
      Math.round(360 * -65536)];
  }
  list.push('x');

  this.setAttribute_(domElement, 'path', list.join(' '));
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setImageTransformation = function(element) {
  var style = element.domElement()['style'];

  /** @type {goog.math.AffineTransform} */
  var tx = element.getFullTransformation();
  if (!tx) return;

  var angle = acgraph.math.getRotationAngle(tx);
  this.setAttribute_(style, 'rotation', String(angle));

  // Leave it here for a while
  /*this.setAttributes_(element.domElement()['style'], {
    'left': this.toCssSize_(bounds.left + tx.getTranslateX()),
    'top': this.toCssSize_(bounds.top + tx.getTranslateY())
  });*/
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setPathTransformation = function(path) {
  var element = path.domElement();

  var pathData = this.getVmlPath_(path, true);
  if (pathData)
    this.setAttribute_(element, 'path', pathData);
  else
    this.removeAttribute_(element, 'path');
  // Alternative way to transform path. Do not remove.
  //this.setTransform_(path, path.getStage().getBounds());
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setLayerTransformation = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setTextTransformation = function(element) {
  /** @type {goog.math.AffineTransform} */
  var tx = element.getFullTransformation();
  if (!tx) return;

  var segments = element.getSegments();
  var domElement = element.domElement();
  var domElementStyle = domElement['style'];
  var i, len;

  var x, y;
  if (element.isComplex()) {
    y = element.calcY;
    if (element.getSegments().length)
      y -= element.getSegments()[0].baseLine;
    x = element.calcX;

    this.setAttributes_(domElementStyle, {
      'position': 'absolute',
      'overflow': 'visible',
      'left': this.toCssSize_(x + tx.getTranslateX()),
      'top': this.toCssSize_(y + tx.getTranslateY())
    });

    var changed = element.isScaleOrShearChanged();
    if (changed) {
      for (i = 0, len = segments.length; i < len; i++) {
        var segment = /** @type {acgraph.vector.TextSegment} */ (segments[i]);
        /** @type {Element} */
        var skew;
        if (segment.skew) {
          skew = segment.skew;
          this.setAttributes_(skew, {
            'origin': [-0.5 - x, -0.5 - y].join(','),
            'matrix': [
              acgraph.math.round(tx.getScaleX(), 6),
              acgraph.math.round(tx.getShearX(), 6),
              acgraph.math.round(tx.getShearY(), 6),
              acgraph.math.round(tx.getScaleY(), 6),
              0, 0
            ].join(',')
          });
        } else {
          skew = segment.skew = this.createVMLElement_('skew');
        }

        if (!segment.skewAttached && segment.domElement()) {
          this.appendChild(segment.domElement(), skew);
          segment.skewAttached = true;
        }

        /** @type {string} */
        var origin = [-0.5 - x, -0.5 - y].join(',');
        if (segment.domElement()) segment.domElement()['rotation'] = 0;
        this.setAttributes_(skew, {
          'on': 'true',
          'origin': origin,
          'matrix': [
            acgraph.math.round(tx.getScaleX(), 6),
            acgraph.math.round(tx.getShearX(), 6),
            acgraph.math.round(tx.getShearY(), 6),
            acgraph.math.round(tx.getScaleY(), 6),
            0, 0
          ].join(',')
        });
      }
    }
  } else {
    x = element.x();
    y = element.y();

    if (element.vAlign() && element.height() && element.height() > element.realHeigth) {
      if (element.vAlign() == 'middle') y += element.height() / 2 - element.realHeigth / 2;
      if (element.vAlign() == 'bottom') y += element.height() - element.realHeigth;
    }

    this.setAttributes_(domElementStyle, {
      'position': 'absolute',
      'overflow': 'hidden',
      'left': this.toCssSize_(x + tx.getTranslateX()),
      'top': this.toCssSize_(y + tx.getTranslateY())
    });
  }
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.needsReRenderOnParentTransformationChange = function() {
  return true;
};


/**
 * Sets transformation to VML element.
 * @param {!acgraph.vector.Element} element Element.
 * @param {goog.math.Rect} bounds Browser opinion of element bounds.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.setTransform_ = function(element, bounds) {
  /** @type {goog.math.AffineTransform} */
  var tx = element.getFullTransformation();
  if (!tx) {
    // if there is a skew node attaches to element
    if (element.skewAttached) {
      // remove it
      this.removeNode(element.skew);
      // and tell element it is not there anymore
      element.skewAttached = false;
    }
    return;
  }

  /** @type {Element} */
  var skew;
  if (element.skew) {
    skew = element.skew;
  } else {
    skew = element.skew = this.createVMLElement_('skew');
  }
  if (!element.skewAttached)
  {
    this.appendChild(element.domElement(), skew);
    element.skewAttached = true;
  }
  /** @type {string} */
  var origin = [-0.5 - bounds.left / bounds.width, -0.5 - bounds.top / bounds.height].join(',');
  this.setAttributes_(skew, {
    'on': 'true',
    'origin': origin,
    'matrix': [
      acgraph.math.round(tx.getScaleX(), 6),
      acgraph.math.round(tx.getShearX(), 6),
      acgraph.math.round(tx.getShearY(), 6),
      acgraph.math.round(tx.getScaleY(), 6),
      0, 0
    ].join(',')
  });

  this.setAttributes_(element.domElement()['style'], {
    'left': this.toCssSize_(bounds.left + tx.getTranslateX()),
    'top': this.toCssSize_(bounds.top + tx.getTranslateY())
  });
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setPointerEvents = goog.nullFunction;


/**
 * Does nothing in case of vml.
 */
acgraph.vector.vml.Renderer.prototype.disposeClip = goog.nullFunction;


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setDisableStrokeScaling = goog.nullFunction;


/**
 * Adds clipping attributes to element clipping to element.
 * @param {!acgraph.vector.Element} element Element.
 * @param {!goog.math.Rect} clipRect Bounds of clipping rectangle.
 * @param {boolean|undefined} isLayer Whether clip adding for layer.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.addClip_ = function(element, clipRect, isLayer) {
  clipRect = clipRect.clone();
  var style = element.domElement()['style'];

  if (goog.isDef(isLayer) && isLayer) {
    // layer clip
    var tx = element.getFullTransformation();
    clipRect = acgraph.math.getBoundsOfRectWithTransform(clipRect, tx);
  } else {
    // element clip
    clipRect.left -= element.getX();
    clipRect.top -= element.getY();
  }

  var left = clipRect.left;
  var top = clipRect.top;
  var right = left + clipRect.width;
  var bottom = top + clipRect.height;
  /** @type {string} */
  var clipVal = [
    'rect(',
    top + 'px',
    right + 'px',
    bottom + 'px',
    left + 'px',
    ')'
  ].join(' ');
  this.setAttribute_(style, 'clip', clipVal);
};


/**
 * Removes clip from element.
 * @param {!acgraph.vector.Element} element Element.
 * @private
 */
acgraph.vector.vml.Renderer.prototype.removeClip_ = function(element) {
  var style = element.domElement()['style'];
  this.removeStyle_(style, 'clip');
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.setClip = function(element) {
  var isLayer = element instanceof acgraph.vector.Layer;
  /** @type {acgraph.vector.vml.Clip} */
  var clipElement = /** @type {acgraph.vector.vml.Clip} */(element.clip());
  if (clipElement) {
    var shape = /** @type {acgraph.vector.Shape} */(clipElement.shape());
    var clipShape = shape.getBoundsWithTransform(shape.getSelfTransformation());
    this.addClip_(element, /** @type {!goog.math.Rect} */ (clipShape), isLayer);
  } else
    this.removeClip_(element);
};


/** @inheritDoc */
acgraph.vector.vml.Renderer.prototype.needsReClipOnBoundsChange = function() {
  return true;
};
