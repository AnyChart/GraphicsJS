goog.provide('acgraph.vector');
goog.provide('acgraph.vector.Anchor');
goog.provide('acgraph.vector.Cursor');
goog.provide('acgraph.vector.ILayer');

goog.require('acgraph.math');
goog.require('goog.math.AffineTransform');
goog.require('goog.math.Rect');

/**
 A namespace for working with vector graphics.
 @namespace
 @name acgraph.vector
 */


/**
 The list of positions for an anchor.
 @enum {string}
 */
acgraph.vector.Anchor = {
  /** The left-top anchor of the element. */
  LEFT_TOP: 'left-top',

  /** The left-center anchor of the element. */
  LEFT_CENTER: 'left-center',

  /** The left-bottom anchor of the element. */
  LEFT_BOTTOM: 'left-bottom',

  /** The center-top anchor of the element. */
  CENTER_TOP: 'center-top',

  /** The center anchor of the element. */
  CENTER: 'center',

  /** The center-bottom anchor of the element. */
  CENTER_BOTTOM: 'center-bottom',

  /** The right-top anchor of the element. */
  RIGHT_TOP: 'right-top',

  /** The right-center anchor of the element.*/
  RIGHT_CENTER: 'right-center',

  /** The right-bottom anchor of the element. */
  RIGHT_BOTTOM: 'right-bottom'
};


/**
 Defines the type of the cursor.<br/>
 To view the example, point the cursor at the description of the type.
 @enum {string}
 */
acgraph.vector.Cursor = {
  /** <span style="cursor:default">Default type</span> */
  DEFAULT: 'default',

  /** <span style="cursor:crosshair">Crosshair type</span> */
  CROSSHAIR: 'crosshair',

  /** <span style="cursor:pointer">Pointer type</span> */
  POINTER: 'pointer',

  /** <span style="cursor:move">Move type</span> */
  MOVE: 'move',

  /** <span style="cursor:text">Text type</span> */
  TEXT: 'text',

  /** <span style="cursor:wait">Wait type</span> */
  WAIT: 'wait',

  /** <span style="cursor:help">Help type</span> */
  HELP: 'help',

  /** <span style="cursor:n-resize">N-resize type</span> */
  N_RESIZE: 'n-resize',

  /** <span style="cursor:ne-resize">NE-resize type</span> */
  NE_RESIZE: 'ne-resize',

  /** <span style="cursor:e-resize">E-resize type</span> */
  E_RESIZE: 'e-resize',

  /** <span style="cursor:se-resize">SE-resize type</span> */
  SE_RESIZE: 'se-resize',

  /** <span style="cursor:s-resize">S-resize type</span> */
  S_RESIZE: 's-resize',

  /** <span style="cursor:sw-resize">SW-resize type</span> */
  SW_RESIZE: 'sw-resize',

  /** <span style="cursor:w-resize">W-resize type</span> */
  W_RESIZE: 'w-resize',

  /** <span style="cursor:nw-resize">NW-resize type</span> */
  NW_RESIZE: 'nw-resize',

  /** <span style="cursor:ns-resize">NS-resize type</span> */
  NS_RESIZE: 'ns-resize',

  /** <span style="cursor:ew-resize">EW-resize type</span> */
  EW_RESIZE: 'ew-resize',

  /** <span style="cursor:nwse-resize">NWSE-resize type</span> */
  NWSE_RESIZE: 'nwse-resize',

  /** <span style="cursor:nesw-resize">NESW-resize type</span> */
  NESW_RESIZE: 'nesw-resize'
};


/**
 * Gets the coordinates of the anchor at the bound.
 * @param {goog.math.Rect} bounds The bound rectangle.
 * @param {(acgraph.vector.Anchor|string)} anchor The anchor for which it is necessary to get the coordinates.
 * @return {Array.<number>} The coordinates of the anchor as [x, y].
 */
acgraph.vector.getCoordinateByAnchor = function(bounds, anchor) {
  var x = bounds.left;
  var y = bounds.top;
  anchor = anchor.toLowerCase();
  switch (anchor) {
    case acgraph.vector.Anchor.LEFT_TOP:
      break;
    case acgraph.vector.Anchor.LEFT_CENTER:
      y += bounds.height / 2;
      break;
    case acgraph.vector.Anchor.LEFT_BOTTOM:
      y += bounds.height;
      break;
    case acgraph.vector.Anchor.CENTER_TOP:
      x += bounds.width / 2;
      break;
    case acgraph.vector.Anchor.CENTER:
      x += bounds.width / 2;
      y += bounds.height / 2;
      break;
    case acgraph.vector.Anchor.CENTER_BOTTOM:
      x += bounds.width / 2;
      y += bounds.height;
      break;
    case acgraph.vector.Anchor.RIGHT_TOP:
      x += bounds.width;
      break;
    case acgraph.vector.Anchor.RIGHT_CENTER:
      x += bounds.width;
      y += bounds.height / 2;
      break;
    case acgraph.vector.Anchor.RIGHT_BOTTOM:
      x += bounds.width;
      y += bounds.height;
      break;
  }
  return [x, y];
};



/**
 * @interface
 */
acgraph.vector.ILayer = function() {
};


/**
 * @param {!acgraph.vector.Element} child .
 * @return {!acgraph.vector.ILayer} .
 */
acgraph.vector.ILayer.prototype.addChild;


/**
 * @param {acgraph.vector.Element} element Element to be removed.
 * @return {acgraph.vector.Element} Removed element or null.
 */
acgraph.vector.ILayer.prototype.removeChild;


/**
 * @param {acgraph.vector.Element} child .
 */
acgraph.vector.ILayer.prototype.notifyRemoved;


/**
 * @return {acgraph.vector.Stage} Stage (may be null).
 */
acgraph.vector.ILayer.prototype.getStage;


/**
 Gradient keys.
 @typedef {{
      offset: number,
      color: (string),
      opacity: (number|undefined)
    }}
 */
acgraph.vector.GradientKey;


/**
 Fill.
 @typedef {{
       color:string,
       opacity:(number|undefined)
     }}
 */
acgraph.vector.SolidFill;


/**
 Linear gradient.
 @typedef {{
      keys: !Array.<(acgraph.vector.GradientKey|string)>,
      angle: (number|undefined),
      mode: (boolean|!goog.math.Rect|undefined),
      opacity: (number|undefined)
    }}
 */
acgraph.vector.LinearGradientFill;


/**
 Radial gradient fill.
 @typedef {{
       keys: !Array.<(acgraph.vector.GradientKey|string)>,
       cx: number,
       cy: number,
       mode: (goog.math.Rect|undefined),
       fx: (number|undefined),
       fy: (number|undefined),
       opacity: (number|undefined)
     }}
 */
acgraph.vector.RadialGradientFill;


/**
 Image fill.
 @typedef {{
      src: string,
      mode: (acgraph.vector.ImageFillMode|undefined),
      opacity: (number|undefined)
    }}
 */
acgraph.vector.ImageFill;


/**
 Any color fill.
 @typedef {!(
       string |
       acgraph.vector.SolidFill |
       acgraph.vector.LinearGradientFill |
       acgraph.vector.RadialGradientFill
     )} acgraph.vector.ColoredFill
 */
acgraph.vector.ColoredFill;


/**
 Any fill.
 @typedef {!(
      string |
      acgraph.vector.ImageFill |
      acgraph.vector.SolidFill |
      acgraph.vector.LinearGradientFill |
      acgraph.vector.RadialGradientFill |
      acgraph.vector.PatternFill
    )} acgraph.vector.Fill
 */
acgraph.vector.Fill;


/**
 Solid color line.
 @typedef {{
      color: string,
      thickness: (number|undefined),
      opacity: (number|undefined),
      dash: (string|undefined),
      lineJoin: (string|undefined),
      lineCap: (string|undefined)
    }}
 */
acgraph.vector.SolidStroke;


/**
 Linear gradient stroke.
 @typedef {{
      keys: !Array.<(acgraph.vector.GradientKey|string)>,
      angle: (number|undefined),
      mode: (boolean|!goog.math.Rect|undefined),
      opacity: (number|undefined),
      thickness: (number|undefined),
      dash: (string|undefined),
      lineJoin: (string|undefined),
      lineCap: (string|undefined)
    }}
 */
acgraph.vector.LinearGradientStroke;


/**
 Radial gradient stroke.
 @typedef {{
      keys: !Array.<(acgraph.vector.GradientKey|string)>,
      cx: number,
      cy: number,
      mode: (goog.math.Rect|undefined),
      fx: (number|undefined),
      fy: (number|undefined),
      opacity: (number|undefined),
      thickness: (number|undefined),
      dash: (string|undefined),
      lineJoin: (string|undefined),
      lineCap: (string|undefined)
    }}
 */
acgraph.vector.RadialGradientStroke;


/**
 Any stroke.
 @typedef {!(
      string |
      acgraph.vector.SolidStroke |
      acgraph.vector.LinearGradientStroke |
      acgraph.vector.RadialGradientStroke
    )} acgraph.vector.Stroke
 */
acgraph.vector.Stroke;


/**
 * A shortcut for Fill or Stroke or PatternFill.
 * @typedef {acgraph.vector.Fill|acgraph.vector.Stroke|acgraph.vector.PatternFill}
 */
acgraph.vector.AnyColor;


/**
 Format of style the text. May be applied to plain and html texts.
 @typedef {{
    fontSize: (string|number|undefined),
    color: (string|undefined),
    fontFamily: (string|undefined),
    direction: (acgraph.vector.Text.Direction|string|undefined),
    fontStyle: (acgraph.vector.Text.FontStyle|string|undefined),
    fontVariant: (acgraph.vector.Text.FontVariant|string|undefined),
    fontWeight: (number|string|undefined),
    letterSpacing: (number|string|undefined),
    decoration: (acgraph.vector.Text.Decoration|string|undefined),
    opacity: (number|undefined),
    lineHeight: (string|number|undefined),
    textIndent: (number|undefined),
    vAlign: (acgraph.vector.Text.VAlign|string|undefined),
    hAlign: (acgraph.vector.Text.HAlign|string|undefined),
    width: (number|string|undefined),
    height: (number|string|undefined),
    wordWrap: (string|undefined),
    wordBreak: (string|undefined),
    textOverflow: (acgraph.vector.Text.TextOverflow|string|undefined),
    selectable: (boolean|undefined)
 }}
 */
acgraph.vector.TextStyle;


/**
 Text segment.
 @typedef {{
    fontStyle: (string|undefined),
    fontVariant: (string|undefined),
    fontFamily: (string|undefined),
    fontSize: (string|number|undefined),
    fontWeight: (number|string|undefined),
    color: (string|undefined),
    letterSpacing: (string|undefined),
    decoration: (string|undefined),
    opacity: (number|undefined)
 }}
 */
acgraph.vector.TextSegmentStyle;


/**
 Line joins.
 More at: <a href='http://www.w3.org/TR/SVG/painting.html#StrokeLinejoinProperty'>StrokeLinejoinProperty</a>
 @enum {string}
 */
acgraph.vector.StrokeLineJoin = {
  MITER: 'miter',
  ROUND: 'round',
  BEVEL: 'bevel'
};


/**
 Line caps.
 <a href='http://www.w3.org/TR/SVG/painting.html#StrokeLinecapProperty'>StrokeLinecapProperty</a>
 @enum {string}
 */
acgraph.vector.StrokeLineCap = {
  BUTT: 'butt',
  ROUND: 'round',
  SQUARE: 'square'
};


/**
 * Image fill modes.
 * @enum {string}
 */
acgraph.vector.ImageFillMode = {
  /**
   * Stretches image, proportions are not kept.
   */
  STRETCH: 'stretch',
  /**
   * Fit by greater side.
   */
  FIT_MAX: 'fit-max',
  /**
   * Fit by lesser side.
   */
  FIT: 'fit',
  /**
   * Tiling.
   */
  TILE: 'tile'
};


/**
 * Paper sizes.
 * @enum {string}
 */
acgraph.vector.PaperSize = {
  /**
   * It measures 8.5 by 11 inches (215.9 mm x 279.4 mm). US Letter size is a recognized standard adopted by the American National Standards Institute (ANSI) whereas the A4 is the International Standard (ISO) used in most countries.
   */
  US_LETTER: 'us-letter',

  /**
   * The base A0 size of paper is defined as having an area of 1 m2. Rounded to the nearest millimetre, the A0 paper size is 841 by 1,189 millimetres (33.1 in × 46.8 in). Successive paper sizes in the series A1, A2, A3, and so forth, are defined by halving the preceding paper size across the larger dimension.
   */
  A0: 'a0',

  /**
   * A1 measures 594 × 841 millimeters or 23.4 × 33.1 inches.
   */
  A1: 'a1',

  /**
   * A2 measures 420 × 594 millimeters or 16.5 × 23.4 inches.
   */
  A2: 'a2',

  /**
   * The A3 size print measures 29.7 x 42.0cm, 11.69 x 16.53 inches, if mounted 40.6 x 50.8cm, 15.98 x 20 inches. The A4 size print measures 21.0 x 29.7cm, 8.27 x 11.69 inches, if mounted 30.3 x 40.6cm, 11.93 x 15.98 inches.
   */
  A3: 'a3',

  /**
   * A transitional size called PA4 (210 mm × 280 mm or 8.27 in × 11.02 in) was proposed for inclusion into the ISO 216 standard in 1975. It has the height of Canadian P4 paper (215 mm × 280 mm, about 8½ in × 11 in) and the width of international A4 paper (210 mm × 297 mm or 8.27 in × 11.69 in).
   */
  A4: 'a4',

  /**
   * A5 measures 148 × 210 millimeters or 5.83 × 8.27 inches.
   */
  A5: 'a5',

  /**
   * A6 measures 105 × 148 millimeters or 4.13 × 5.83 inches. In PostScript, its dimensions are rounded off to 298 × 420 points. The matching envelope format is C6 (114 × 162 mm).
   */
  A6: 'a6'
};


/**
 * Converts string representation of transformations to goog.math.AffineTransform object.
 * @param {string} value
 * @return {goog.math.AffineTransform}
 */
acgraph.vector.parseTransformationString = function(value) {
  var i, j, len, len_;

  var transforms = value.trim()
      .replace(/\(\s+/gi, '(')
      .replace(/\s+\)/gi, ')')
      .replace(/(\s+,\s+)|(\s+)/gi, ',')
      .replace(/(\)),*(\w)/gi, '$1 $2')
      .split(' ');

  var tx = new goog.math.AffineTransform();

  for (j = 0, len_ = transforms.length; j < len_; j++) {
    var transform = transforms[j];

    var r = /^(matrix|translate|rotate|scale|skewX|skewY)\(([e\d.,-]+)\)/i;
    var result = r.exec(transform);
    var type = result[1];
    var params = /** @type {Array.<number>} */(result[2].split(','));
    for (i = 0, len = params.length; i < len; i++) {
      params[i] = parseFloat(params[i]);
    }

    switch (type) {
      case 'matrix':
        var new_tx = new goog.math.AffineTransform(params[0], params[1], params[2], params[3], params[4], params[5]);
        tx.concatenate(new_tx);
        break;
      case 'translate':
        tx.translate(params[0], params[1] || 0);
        break;
      case 'rotate':
        tx.rotate(goog.math.toRadians(params[0]), params[1] || 0, params[2] || 0);
        break;
      case 'scale':
        tx.scale(params[0], params[1] || 0);
        break;
      case 'skewX':
        tx.shear(Math.tan(goog.math.toRadians(params[0])), 0);
        break;
      case 'skewY':
        tx.shear(0, Math.tan(goog.math.toRadians(params[0])));
        break;
    }
  }

  return tx;
};


/**
 * Normalizes stroke params. Look at vector.Shape.fill() params for details.
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!goog.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!goog.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {!acgraph.vector.Fill} .
 */
acgraph.vector.normalizeFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode,
                                        opt_opacity, opt_fx, opt_fy) {
  /** @type {acgraph.vector.Fill} */
  var newFill;
  /** @type {number} */
  var opacity;
  /** @type {!Array.<(acgraph.vector.GradientKey|string)>} */
  var keys;
  /** @type {acgraph.vector.GradientKey} */
  var key;
  /** @type {number} */
  var i;
  var color;
  var newKeys;
  var newKey;

  if (goog.isString(opt_fillOrColorOrKeys)) { // if that's a "function(color, opt_opacity);" case.
    newFill = acgraph.vector.parseColor(opt_fillOrColorOrKeys, false);
    if (goog.isString(newFill) && goog.isDef(opt_opacityOrAngleOrCx)) { // Simple color settings, e.g. fill('red', 0.5)
      opacity = parseFloat(opt_opacityOrAngleOrCx);
      newFill = {
        'color': opt_fillOrColorOrKeys,
        'opacity': isNaN(opacity) ? 1 : goog.math.clamp(opacity, 0, 1)
      };
    }
  } else if (goog.isArray(opt_fillOrColorOrKeys)) { // creating gradient (linear or radial)
    keys = goog.array.slice(opt_fillOrColorOrKeys, 0);
    for (i = keys.length; i--;) { // iterate keys and normalize them if set as simple color
      key = keys[i];
      if (goog.isString(key)) // key is set as string - need to normalize
        key = acgraph.vector.parseKey(key);
      if (isNaN(key['offset'])) // check all invalid offsets, including absence
        key['offset'] = i / ((keys.length - 1) || 1);
      keys[i] = /** @type {acgraph.vector.GradientKey} */(key);
    }
    newKeys = goog.array.slice(keys, 0);
    newKeys.sort(function(k1, k2) {
      return k1['offset'] - k2['offset'];
    });

    if (newKeys[0]['offset'] != 0) {
      newKey = /** @type {acgraph.vector.GradientKey} */ ({
        'offset': 0,
        'color': /** @type {string} */ (keys[0]['color'])
      });
      if (goog.isDef(keys[0]['opacity']) && !isNaN(keys[0]['opacity'])) {
        newKey['opacity'] = goog.math.clamp(keys[0]['opacity'], 0, 1);
      }
      keys.unshift(newKey);
    }

    if (newKeys[newKeys.length - 1]['offset'] != 1) {
      newKey = /** @type {acgraph.vector.GradientKey} */ ({
        'offset': 1,
        'color': /** @type {string} */ (keys[keys.length - 1]['color'])
      });
      if (goog.isDef(keys[keys.length - 1]['opacity']) && !isNaN(keys[keys.length - 1]['opacity'])) {
        newKey['opacity'] = goog.math.clamp(keys[keys.length - 1]['opacity'], 0, 1);
      }
      keys.push(newKey);
    }
    if (goog.isNumber(opt_opacityOrAngleOrCx) && !isNaN(opt_opacityOrAngleOrCx) &&
        goog.isNumber(opt_modeOrCy) && !isNaN(opt_modeOrCy)) { // radial gradient
      var cx = opt_opacityOrAngleOrCx || 0;
      var cy = opt_modeOrCy || 0;
      newFill = {
        'keys': keys,
        'cx': cx,
        'cy': cy,
        'mode': acgraph.vector.normalizeGradientMode(opt_opacityOrMode), // only rectangle
        'fx': isNaN(opt_fx) ? cx : +opt_fx,
        'fy': isNaN(opt_fy) ? cy : +opt_fy,
        'opacity': goog.math.clamp(goog.isDef(opt_opacity) ? opt_opacity : 1, 0, 1)
      };
    } else { // linear gradient
      newFill = {
        'keys': keys,
        'angle': (+opt_opacityOrAngleOrCx) || 0,
        'mode': acgraph.vector.normalizeGradientMode(opt_modeOrCy) || !!opt_modeOrCy, // can be boolean
        'opacity': goog.math.clamp(!isNaN(+opt_opacityOrMode) ? +opt_opacityOrMode : 1, 0, 1)
      };
    }
  } else if (goog.isObject(opt_fillOrColorOrKeys)) { // fill as an object
    if (opt_fillOrColorOrKeys instanceof acgraph.vector.PatternFill) {
      newFill = opt_fillOrColorOrKeys;
    } else if (opt_fillOrColorOrKeys['type'] == 'pattern') {
      delete opt_fillOrColorOrKeys['id'];
      var bounds = opt_fillOrColorOrKeys['bounds'];
      bounds = new goog.math.Rect(bounds['left'], bounds['top'], bounds['width'], bounds['height']);
      newFill = acgraph.patternFill(bounds);
      newFill.deserialize(opt_fillOrColorOrKeys);
    } else if ('keys' in opt_fillOrColorOrKeys) { // gradient
      keys = goog.array.slice(opt_fillOrColorOrKeys['keys'], 0);
      for (i = keys.length; i--;) { // iterate keys and normalize them if set as simple color
        key = keys[i];
        if (goog.isString(key)) // key is set as string - need to normalize
          newKey = acgraph.vector.parseKey(key);
        else { // copy as we can
          if (goog.isString(key['color']))
            color = key['color'];
          else if (goog.isArray(key['color']))
            color = goog.color.rgbArrayToHex(key['color']);
          else
            color = 'black';

          newKey = {
            'offset': key['offset'],
            'color': color
          };
          if (!isNaN(key['opacity']))
            newKey['opacity'] = goog.math.clamp(key['opacity'], 0, 1);
        }
        if (isNaN(newKey['offset'])) // check all invalid offsets, including absence
          newKey['offset'] = i / ((keys.length - 1) || 1);
        keys[i] = /** @type {acgraph.vector.GradientKey} */(newKey);
      }
      newKeys = goog.array.slice(keys, 0);
      newKeys.sort(function(k1, k2) {
        return k1['offset'] - k2['offset'];
      });

      if (newKeys[0]['offset'] != 0) {
        newKey = /** @type {acgraph.vector.GradientKey} */ ({
          'offset': 0,
          'color': /** @type {string} */ (keys[0]['color'])
        });
        if (goog.isDef(keys[0]['opacity']) && !isNaN(keys[0]['opacity'])) {
          newKey['opacity'] = goog.math.clamp(keys[0]['opacity'], 0, 1);
        }
        keys.unshift(newKey);
      }

      if (newKeys[newKeys.length - 1]['offset'] != 1) {
        newKey = /** @type {acgraph.vector.GradientKey} */ ({
          'offset': 1,
          'color': /** @type {string} */ (keys[keys.length - 1]['color'])
        });
        if (goog.isDef(keys[keys.length - 1]['opacity']) && !isNaN(keys[keys.length - 1]['opacity'])) {
          newKey['opacity'] = goog.math.clamp(keys[keys.length - 1]['opacity'], 0, 1);
        }
        keys.push(newKey);
      }

      opacity = goog.math.clamp(goog.isDef(opt_fillOrColorOrKeys['opacity']) ? opt_fillOrColorOrKeys['opacity'] : 1, 0, 1);
      var mode = acgraph.vector.normalizeGradientMode(opt_fillOrColorOrKeys['mode']);
      cx = opt_fillOrColorOrKeys['cx'];
      cy = opt_fillOrColorOrKeys['cy'];

      if (goog.isNumber(cx) && !isNaN(cx) && goog.isNumber(cy) && !isNaN(cy)) { // treat as radial gradient
        newFill = {
          'keys': keys,
          'cx': +cx,
          'cy': +cy,
          'mode': mode, // only rectangle is possible
          'fx': isNaN(opt_fillOrColorOrKeys['fx']) ? +opt_fillOrColorOrKeys['cx'] : +opt_fillOrColorOrKeys['fx'],
          'fy': isNaN(opt_fillOrColorOrKeys['fy']) ? +opt_fillOrColorOrKeys['cy'] : +opt_fillOrColorOrKeys['fy'],
          'opacity': opacity
        };
      } else {
        newFill = {
          'keys': keys,
          'angle': +opt_fillOrColorOrKeys['angle'] || 0,
          'mode': mode || !!opt_fillOrColorOrKeys['mode'], // can be boolean
          'opacity': opacity
        };
      }
      var transform = opt_fillOrColorOrKeys['transform'];
      if (goog.isDefAndNotNull(transform)) {
        if (transform instanceof goog.math.AffineTransform) {
          newFill['transform'] = transform;
        } else if (goog.isObject(transform)) {
          newFill['transform'] = new goog.math.AffineTransform();
          newFill['transform'].setTransform(
              transform['m00'],
              transform['m10'],
              transform['m01'],
              transform['m11'],
              transform['m02'],
              transform['m12']
          );
        } else if (goog.isString(transform)) {
          newFill['transform'] = acgraph.vector.parseTransformationString(transform);
        }
      }
    } else if ('src' in opt_fillOrColorOrKeys) {
      newFill = {
        'src': opt_fillOrColorOrKeys['src'],
        'mode': goog.isDef(opt_fillOrColorOrKeys['mode']) ? opt_fillOrColorOrKeys['mode'] : acgraph.vector.ImageFillMode.STRETCH,
        'opacity': goog.math.clamp(goog.isDef(opt_fillOrColorOrKeys['opacity']) ? opt_fillOrColorOrKeys['opacity'] : 1, 0, 1)
      };
    } else {
      color = goog.isString(opt_fillOrColorOrKeys['color']) ? opt_fillOrColorOrKeys['color'] : 'black';
      if (isNaN(opt_fillOrColorOrKeys['opacity']))
        newFill = color;
      else
        newFill = {
          'color': color,
          'opacity': goog.math.clamp(opt_fillOrColorOrKeys['opacity'], 0, 1)
        };
    }
  } else {
    newFill = 'none';
  }
  return newFill;
};


/**
 * Normalizes stroke params. Look at vector.Shape.stroke() params for details.
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Stroke fill,
 *   if used as setter.
 * @param {number=} opt_thickness Line thickness. Defaults to 1.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 *    Dash array contains a list of comma and/or white space separated lengths and percentages that specify the
 *    lengths of alternating dashes and gaps. If an odd number of values is provided, then the list of values is
 *    repeated to yield an even number of values. Thus, stroke dashpattern: 5,3,2 is equivalent to dashpattern: 5,3,2,5,3,2.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!acgraph.vector.Stroke} .
 */
acgraph.vector.normalizeStroke = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  var tmp;
  /** @type {acgraph.vector.Stroke} */
  var newStroke;
  if (goog.isNull(opt_strokeOrFill)) { // If stroke is null - nothing to pars
    newStroke = 'none';
  } else {
    if (goog.isString(opt_strokeOrFill)) { // is sting - can start from thickness ('1 red 0.2')
      tmp = goog.string.splitLimit(opt_strokeOrFill, ' ', 1);
      var tmpThickness = parseFloat(tmp[0]);
      if (!isNaN(tmpThickness)) { // if starts with thickness - it has priority over opt_thickness
        opt_strokeOrFill = tmp[1];
        opt_thickness = tmpThickness;
      }
    }
    var setAsComplexStroke = goog.isObject(opt_strokeOrFill);
    var thickness = parseFloat(
        (setAsComplexStroke && ('thickness' in opt_strokeOrFill)) ?
            opt_strokeOrFill['thickness'] :
            opt_thickness);
    if (!isNaN(thickness) && !thickness) // if thickness is set and set to 0
      return 'none';

    var hasDash = setAsComplexStroke && ('dash' in opt_strokeOrFill);
    var hasJoin = setAsComplexStroke && ('lineJoin' in opt_strokeOrFill);
    var hasCap = setAsComplexStroke && ('lineCap' in opt_strokeOrFill);

    // Get normalized fill.
    tmp = acgraph.vector.normalizeFill(/** @type {(acgraph.vector.Fill|string|null)} */(opt_strokeOrFill));
    if (tmp == 'none')
      return /** @type {string} */(tmp);
    // No pattern fill for stroke, unfortunately :D
    // Double typecast should be here, via ColoredFill,
    // but that's too much metadata, so let's go with this.
    newStroke = (tmp instanceof acgraph.vector.PatternFill) ? 'black' : /** @type {acgraph.vector.Stroke} */(tmp);

    // If nothing else we can use normalized fill as a stroke,
    // ot is compatible. Otherwise we need to add properties.
    if (!isNaN(thickness) || hasDash || hasJoin || hasCap ||
        goog.isDef(opt_dashpattern) || goog.isDef(opt_lineJoin) || goog.isDef(opt_lineCap)) {
      if (goog.isString(newStroke)) // If there is and color is set as string, we need to upgrade it to an object
        newStroke = /** @type {acgraph.vector.Stroke} */({
          'color': newStroke
        });
      if (!isNaN(thickness))
        newStroke['thickness'] = thickness;
      if (hasDash)
        newStroke['dash'] = opt_strokeOrFill['dash'] || 'none';
      else if (goog.isDefAndNotNull(opt_dashpattern))
        newStroke['dash'] = opt_dashpattern || 'none';
      if (hasJoin)
        newStroke['lineJoin'] = opt_strokeOrFill['lineJoin'] || 'none';
      else if (goog.isDefAndNotNull(opt_lineJoin))
        newStroke['lineJoin'] = opt_lineJoin || 'none';
      if (hasCap)
        newStroke['lineCap'] = opt_strokeOrFill['lineCap'] || 'none';
      else if (goog.isDefAndNotNull(opt_lineCap))
        newStroke['lineCap'] = opt_lineCap || 'none';
    }
  }

  return newStroke;
};


/**
 * Normalize hatch fill.
 * @param {(!acgraph.vector.HatchFill|!acgraph.vector.PatternFill|acgraph.vector.HatchFill.HatchFillType|string|Object|null)=} opt_patternFillOrType
 * @param {string=} opt_color
 * @param {(string|number)=} opt_thickness
 * @param {(string|number)=} opt_size
 * @return {acgraph.vector.PatternFill|acgraph.vector.HatchFill}
 */
acgraph.vector.normalizeHatchFill = function(opt_patternFillOrType, opt_color, opt_thickness, opt_size) {
  var newFill;
  if (goog.isString(opt_patternFillOrType) && opt_patternFillOrType.toLowerCase() == 'none') {
    return null;
  }

  if (goog.isString(opt_patternFillOrType) || goog.isNumber(opt_patternFillOrType)) {
    newFill = acgraph.hatchFill(
        // Type is normalized inside the constructor. Defaults to BACKWARD_DIAGONAL.
        /** @type {acgraph.vector.HatchFill.HatchFillType} */(opt_patternFillOrType),
        opt_color,
        goog.isDef(opt_thickness) ? parseFloat(opt_thickness) : undefined,
        goog.isDef(opt_size) ? parseFloat(opt_size) : undefined);
  } else if (opt_patternFillOrType instanceof acgraph.vector.PatternFill) {
    newFill = opt_patternFillOrType;
  } else if (goog.isObject(opt_patternFillOrType)) {
    if (opt_patternFillOrType['type'] == 'pattern') {
      delete opt_patternFillOrType['id'];
      var bounds = opt_patternFillOrType['bounds'];
      bounds = new goog.math.Rect(bounds['left'], bounds['top'], bounds['width'], bounds['height']);
      newFill = acgraph.patternFill(bounds);
      newFill.deserialize(opt_patternFillOrType);
    } else {
      newFill = acgraph.hatchFill(
          /** @type {acgraph.vector.HatchFill.HatchFillType} */(opt_patternFillOrType['type']),
          opt_patternFillOrType['color'],
          opt_patternFillOrType['thickness'],
          opt_patternFillOrType['size']);
    }
  } else
    newFill = null;
  return newFill;
};


/**
 * Normalize paper size, consider following cases:
 *    normalizePageSize('a2');
 *    normalizePageSize('a2', true);
 *    normalizePageSize('900px');
 *    normalizePageSize('900px', '900px');
 * @param {(string|number)=} opt_paperSizeOrWidth
 * @param {(boolean|string|number)=} opt_landscapeOrHeight
 * @param {acgraph.vector.PaperSize=} opt_default
 * @return {{width: string, height: string}}
 */
acgraph.vector.normalizePageSize = function(opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_default) {
  if (!goog.isDef(opt_default)) opt_default = acgraph.vector.PaperSize.A4;
  var result = acgraph.utils.exporting.PaperSize[opt_default];
  var size;

  //if both parameters passed, try to recognize by second param
  if (goog.isDef(opt_paperSizeOrWidth) && goog.isDef(opt_landscapeOrHeight)) {
    if (goog.isString(opt_paperSizeOrWidth) && goog.isBoolean(opt_landscapeOrHeight)) {
      opt_paperSizeOrWidth = opt_paperSizeOrWidth.toLowerCase();
      size = acgraph.utils.exporting.PaperSize[opt_paperSizeOrWidth];
      if (size) {
        if (opt_landscapeOrHeight) {
          result = {width: size.height, height: size.width};
        } else {
          result = size;
        }
      }
    } else {
      result.width = String(opt_paperSizeOrWidth);
      result.height = String(opt_landscapeOrHeight);
    }
  } else if (goog.isDef(opt_paperSizeOrWidth)) {
    size = acgraph.utils.exporting.PaperSize[String(opt_paperSizeOrWidth)];
    if (size) {
      result = size;
    }
  }

  if (!goog.string.endsWith(result.width, 'px') && !goog.string.endsWith(result.width, 'mm')) result.width += 'px';
  if (!goog.string.endsWith(result.height, 'px') && !goog.string.endsWith(result.height, 'mm')) result.height += 'px';

  return result;
};


/**
 * Reduce to a rectangle. If it is not possible (null or boolean), returns null.
 * @param {null|number|boolean|goog.math.Rect|{left:number,top:number,width:number,height:number}|undefined} mode Gradient
 *    mode to normalize.
 * @return {goog.math.Rect} Normalized gradient rectangle (no extra objects created).
 */
acgraph.vector.normalizeGradientMode = function(mode) {
  if (goog.isDefAndNotNull(mode)) { // mode is set
    if (mode instanceof goog.math.Rect)
      return mode;
    else if (goog.isObject(mode) && !isNaN(mode['left']) && !isNaN(mode['top']) && !isNaN(mode['width']) && !isNaN(mode['height']))
      return new goog.math.Rect(mode['left'], mode['top'], mode['width'], mode['height']);
  }
  return null;
};


/**
 * @param {string} color Color as 'red' or 'red 0.5'.
 * @param {boolean} forceObject Alwasy return as acgraph.vector.SolidFill object or a string
 *    in case of simple color.
 * @return {string|acgraph.vector.SolidFill} Normalized color.
 */
acgraph.vector.parseColor = function(color, forceObject) {
  /** @type {Array.<string>} */
  var tmp = color.split(' ');
  /** @type {number} */
  var opacity = (tmp.length > 1) ? goog.math.clamp(+tmp[tmp.length - 1], 0, 1) : NaN;
  if (!isNaN(opacity)) {
    tmp.pop();
    color = tmp.join(' ');
  } else if (forceObject) {
    // else gradient keys set as ['red', 'blue'] get opacity and block applying of
    // global opacity of gradient.
    return {'color': color};
  } else {
    opacity = 1;
  }
  return (forceObject || opacity != 1) ?
      {
        'color': color,
        'opacity': opacity
      } :
      color;
};


/**
 * @param {string} key Key is '[offset ]color[ opacity]': 'red', 'red 0.5', '0.5 red' or '0.5 red 0.5'.
 * @return {acgraph.vector.GradientKey} Normalized key.
 */
acgraph.vector.parseKey = function(key) {
  var tmp = goog.string.splitLimit(key, ' ', 1);
  var color;
  var offset = NaN;
  if (tmp.length > 1) {
    offset = parseFloat(tmp[0]);
    color = isNaN(offset) ? key : tmp[1];
  } else
    color = key;
  var result = acgraph.vector.parseColor(color, true);
  if (!isNaN(offset))
    result['offset'] = goog.math.clamp(offset, 0, 1);
  return /** @type {acgraph.vector.GradientKey} */(result);
};


/**
 * Retrieves thickness from the stroke object.
 * @param {acgraph.vector.Stroke} stroke Stroke.
 * @return {number} Thickness of the stroke.
 */
acgraph.vector.getThickness = function(stroke) {
  var res;
  return (stroke && stroke != 'none') ?
      (isNaN(res = stroke['thickness']) || goog.isNull(res) ? 1 : res) :
      0;
};


//exports
(function() {
  goog.exportSymbol('acgraph.vector.normalizeFill', acgraph.vector.normalizeFill);
  goog.exportSymbol('acgraph.vector.normalizeStroke', acgraph.vector.normalizeStroke);
  goog.exportSymbol('acgraph.vector.normalizeHatchFill', acgraph.vector.normalizeHatchFill);
})();
