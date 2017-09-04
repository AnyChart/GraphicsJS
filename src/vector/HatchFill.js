goog.provide('acgraph.vector.HatchFill');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Path');
goog.require('acgraph.vector.PatternFill');
goog.require('goog.math.Rect');



/**
 HatchFill is a special pattern fill with predefined set of a primitives. Sets of a primitives does numbered and
 declared in {@link acgraph.vector.HatchFill.HatchFillType} enum. Hatch fill properties will be applied to his
 children (sets of a primitives). HatchFill is a immutable fill, therefore after rendering his a properties
 can not be changed.<br/>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#hatchFill} or
 {@link acgraph.hatchFill}
 @see acgraph.vector.Stage#hatchFill
 @see acgraph.hatchFill
 @name acgraph.vector.HatchFill
 @param {acgraph.vector.HatchFill.HatchFillType=} opt_type Hatch fill type.
 @param {string=} opt_color Hatch fill color CAN BE COMBINED WITH OPACITY.
 @param {number=} opt_thickness Hatch fill thickness.
 @param {number=} opt_size Hatch fill size.
 @constructor
 @extends {acgraph.vector.PatternFill}
 */
acgraph.vector.HatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  /**
   * Hatch fill type.
   * @type {acgraph.vector.HatchFill.HatchFillType}
   */
  this.type = acgraph.vector.HatchFill.normalizeHatchFillType(opt_type || '');
  /**
   * Hatch fill color.
   * @type {string}
   */
  this.color = '' + (goog.isDefAndNotNull(opt_color) ? opt_color : 'black 0.5');
  /**
   * Hatch fill stroke thickness.
   * @type {number}
   */
  this.thickness = goog.isDefAndNotNull(opt_thickness) ? opt_thickness : 1;
  /**
   * Pattern size.
   * @type {number}
   */
  this.size = goog.isDefAndNotNull(opt_size) ? opt_size : 10;

  acgraph.vector.HatchFill.base(this, 'constructor', new goog.math.Rect(0, 0, this.size, this.size));

  var initializer = acgraph.vector.HatchFill.creationMap_[this.type];
  if (initializer)
    initializer.call(this);
};
goog.inherits(acgraph.vector.HatchFill, acgraph.vector.PatternFill);


/**
 * Serializes hatch fill parameters in its own string id.
 * @param {acgraph.vector.HatchFill.HatchFillType} type Hatch fill type.
 * @param {string} color Hatch fill color.
 * @param {number} thickness Hatch fill thickness.
 * @param {number} size Hatch fill size.
 * @return {string} Serialized hatch fill params.
 */
acgraph.vector.HatchFill.serialize = function(type, color, thickness, size) {
  return [type, color, thickness, size].join(',');
};


/**
 Hatch Fill types.
 <b>Note!</b> VML does not support hatch due to performance issues.
 @enum {string}
 */
acgraph.vector.HatchFill.HatchFillType = {
  BACKWARD_DIAGONAL: 'backward-diagonal',
  FORWARD_DIAGONAL: 'forward-diagonal',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  DASHED_BACKWARD_DIAGONAL: 'dashed-backward-diagonal',
  GRID: 'grid',
  DASHED_FORWARD_DIAGONAL: 'dashed-forward-diagonal',
  DASHED_HORIZONTAL: 'dashed-horizontal',
  DASHED_VERTICAL: 'dashed-vertical',
  DIAGONAL_CROSS: 'diagonal-cross',
  DIAGONAL_BRICK: 'diagonal-brick',
  DIVOT: 'divot',
  HORIZONTAL_BRICK: 'horizontal-brick',
  VERTICAL_BRICK: 'vertical-brick',
  CHECKER_BOARD: 'checker-board',
  CONFETTI: 'confetti',
  PLAID: 'plaid',
  SOLID_DIAMOND: 'solid-diamond',
  ZIG_ZAG: 'zig-zag',
  WEAVE: 'weave',
  PERCENT_05: 'percent-05',
  PERCENT_10: 'percent-10',
  PERCENT_20: 'percent-20',
  PERCENT_25: 'percent-25',
  PERCENT_30: 'percent-30',
  PERCENT_40: 'percent-40',
  PERCENT_50: 'percent-50',
  PERCENT_60: 'percent-60',
  PERCENT_70: 'percent-70',
  PERCENT_75: 'percent-75',
  PERCENT_80: 'percent-80',
  PERCENT_90: 'percent-90'
};


/**
 * @param {number} w
 * @param {number} h
 * @param {Array.<number>} pixelPositions
 * @this {acgraph.vector.HatchFill}
 * @private
 */
acgraph.vector.HatchFill.percentHelper_ = function(w, h, pixelPositions) {
  this.bounds = new goog.math.Rect(0, 0, w, h);
  this.onePixelRects_(pixelPositions);
};


/**
 * @param {number} w
 * @param {number} h
 * @param {Array.<number>} pixelPositions
 * @this {acgraph.vector.HatchFill}
 * @private
 */
acgraph.vector.HatchFill.bigPercentHelper_ = function(w, h, pixelPositions) {
  this.bounds = new goog.math.Rect(0, 0, w, h);
  this.rectHelper_(w, h);
  this.onePixelRects_(pixelPositions, 'white');
};


/**
 * @const {Object<acgraph.vector.HatchFill.HatchFillType, function(this:acgraph.vector.HatchFill)>}
 */
acgraph.vector.HatchFill.creationMap_ = (function() {
  var map = {};
  map[acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL] = function() {
    this.rLinesHelper_([-1, 0, this.size + 1, 0, this.thickness], -45);
  };
  map[acgraph.vector.HatchFill.HatchFillType.FORWARD_DIAGONAL] = function() {
    this.rLinesHelper_([-1, 0, this.size + 1, 0, this.thickness], 45);
  };
  map[acgraph.vector.HatchFill.HatchFillType.HORIZONTAL] = function() {
    this.rLinesHelper_([-1, this.size / 2, this.size + 1, this.size / 2, this.thickness]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.VERTICAL] = function() {
    this.rLinesHelper_([this.size / 2, -1, this.size / 2, this.size + 1, this.thickness]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DIAGONAL_CROSS] = function() {
    this.rLinesHelper_([
      0, this.size / 2, this.size, this.size / 2, this.thickness,
      this.size / 2, 0, this.size / 2, this.size, this.thickness
    ], 45);
  };
  map[acgraph.vector.HatchFill.HatchFillType.GRID] = function() {
    this.rLinesHelper_([
      -1, this.size / 2, this.size + 1, this.size / 2, this.thickness,
      this.size / 2, -1, this.size / 2, this.size + 1, this.thickness
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.HORIZONTAL_BRICK] = function() {
    this.rLinesHelper_([
      0, 0, 0, this.size / 2 - 1, this.thickness,
      0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness,
      this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness,
      0, this.size - 1, this.size, this.size - 1, this.thickness
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.VERTICAL_BRICK] = function() {
    this.rLinesHelper_([
      0, 0, 0, this.size / 2 - 1, this.thickness,
      0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness,
      this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness,
      0, this.size - 1, this.size, this.size - 1, this.thickness
    ], 90);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK] = function() {
    this.rLinesHelper_([
      0, 0, 0, this.size / 2 - 1, this.thickness,
      0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness,
      this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness,
      0, this.size - 1, this.size, this.size - 1, this.thickness
    ], 45);
  };
  map[acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD] = function() {
    this.multiSquareHelper_([
      0, 0, this.size / 2,
      this.size / 2, this.size / 2, this.size
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.CONFETTI] = function() {
    var s = this.size / 8;
    var confettiSize = this.size / 4;
    this.multiSquareHelper_([
      0, s * 2, confettiSize,
      s, s * 5, confettiSize,
      s * 2, 0, confettiSize,
      s * 4, s * 4, confettiSize,
      s * 5, s, confettiSize,
      s * 6, s * 6, confettiSize
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.PLAID] = function() {
    this.rectHelper_(this.size / 2, this.size / 2);
    var s = this.size / 8;
    var isSelected = false;
    for (var dx = 0; dx < 2; dx++) {
      isSelected = false;
      for (var xPos = 0; xPos < 4; xPos++) {
        isSelected = !isSelected;
        for (var yPos = 0; yPos < 4; yPos++) {
          if (isSelected) {
            this.rectHelper_(s, s, xPos * s + dx * this.size / 2, yPos * s + this.size / 2);
          }
          isSelected = !isSelected;
        }
      }
    }
  };
  map[acgraph.vector.HatchFill.HatchFillType.SOLID_DIAMOND] = function() {
    this.segmentedDrawHelper_([[this.size / 2, 0, 0, this.size / 2, this.size / 2, this.size, this.size, this.size / 2, this.size / 2, 0]], true);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DASHED_FORWARD_DIAGONAL] = function() {
    this.rLinesHelper_([0, 0, this.size / 2, this.size / 2, this.thickness]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DASHED_BACKWARD_DIAGONAL] = function() {
    this.rLinesHelper_([this.size / 2, 0, 0, this.size / 2, this.thickness]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DASHED_HORIZONTAL] = function() {
    this.rLinesHelper_([
      0, 0, this.size / 2, 0, this.thickness,
      this.size / 2, this.size / 2, this.size, this.size / 2, this.thickness
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DASHED_VERTICAL] = function() {
    this.rLinesHelper_([
      0, 0, 0, this.size / 2, this.thickness,
      this.size / 2, this.size / 2, this.size / 2, this.size, this.thickness
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.DIVOT] = function() {
    var percent = 0.1;
    var innerPercent = 0.2;
    var padding = this.size * percent;
    var ds = this.size * (1 - percent * 2 - innerPercent) / 2;
    this.segmentedDrawHelper_([
      [padding + ds, padding, padding, padding + ds / 2, padding + ds, padding + ds],
      [this.size - padding - ds, this.size - padding - ds, this.size - padding, this.size - padding - ds / 2, this.size - padding - ds, this.size - padding]
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.ZIG_ZAG] = function() {
    this.segmentedDrawHelper_([
      [0, 0, this.size / 2, this.size / 2, this.size, 0],
      [0, this.size / 2, this.size / 2, this.size, this.size, this.size / 2]
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.WEAVE] = function() {
    this.segmentedDrawHelper_([
      [0, 0, this.size / 2, this.size / 2, this.size, 0],
      [0, this.size / 2, this.size / 2, this.size, this.size, this.size / 2],
      [this.size / 2, this.size / 2, this.size * 3 / 4, this.size * 3 / 4],
      [this.size, this.size / 2, this.size * 3 / 4, this.size / 4]
    ]);
  };
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_05] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 8, 8, [0, 0, 4, 4]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_10] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 8, 4, [0, 0, 4, 2]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_20] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 4, 4, [0, 0, 2, 2]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_25] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 4, 2, [0, 0, 2, 1]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_30] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 4, 4, [0, 0, 2, 0, 3, 1, 0, 2, 2, 2, 1, 3]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_40] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 4, 8, [0, 0, 2, 0, 3, 1, 0, 2, 2, 2, 1, 3, 3, 3, 0, 4, 2, 4, 1, 5, 3, 5, 0, 6, 2, 6, 1, 7, 3, 7]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_50] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 2, 2, [0, 0, 1, 1]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_60] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 4, 4, [0, 0, 2, 0, 0, 1, 1, 1, 3, 1, 0, 2, 2, 2, 1, 3, 2, 3, 3, 3]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_70] = goog.partial(acgraph.vector.HatchFill.percentHelper_, 4, 4, [0, 0, 2, 0, 3, 0, 0, 1, 1, 1, 2, 1, 0, 2, 2, 2, 3, 2, 0, 3, 1, 3, 2, 3]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_75] = goog.partial(acgraph.vector.HatchFill.bigPercentHelper_, 4, 4, [0, 0, 2, 2]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_80] = goog.partial(acgraph.vector.HatchFill.bigPercentHelper_, 8, 4, [0, 0, 4, 2]);
  map[acgraph.vector.HatchFill.HatchFillType.PERCENT_90] = goog.partial(acgraph.vector.HatchFill.bigPercentHelper_, 8, 8, [7, 7, 4, 3]);
  return map;
})();


/**
 * Normalize passed string to hatchFill type.
 * @param {*} value Value to normalize.
 * @param {acgraph.vector.HatchFill.HatchFillType=} opt_default Hatch Fill type which will be returned as default if passed value is not correct.
 * @return {!acgraph.vector.HatchFill.HatchFillType} Normalized Hatch Fill type value.
 */
acgraph.vector.HatchFill.normalizeHatchFillType = function(value, opt_default) {
  value = value.toLowerCase();

  for (var i in acgraph.vector.HatchFill.HatchFillType) {
    if (acgraph.vector.HatchFill.HatchFillType[i].toLowerCase() == value || acgraph.vector.HatchFill.HatchFillType[i].toLowerCase().replace(/-/g, '') == value)
      return acgraph.vector.HatchFill.HatchFillType[i];
  }
  return opt_default || acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL;
};


/**
 * @param {Array.<Array.<number>>} segments
 * @param {boolean=} opt_close
 * @this {acgraph.vector.HatchFill}
 * @private
 */
acgraph.vector.HatchFill.prototype.segmentedDrawHelper_ = function(segments, opt_close) {
  var path = this.strokePathHelper_();
  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i];
    path.moveTo(segment[0], segment[1]);
    for (var j = 2; j < segment.length; j += 2) {
      path.lineTo(segment[j], segment[j + 1]);
    }
  }
  if (opt_close)
    path.close();
};


/**
 * @param {Array.<number>} args - Array of groups of rLine_ args.
 * @param {number=} opt_rotation
 * @private
 */
acgraph.vector.HatchFill.prototype.rLinesHelper_ = function(args, opt_rotation) {
  var path = this.strokePathHelper_();
  for (var i = 0; i < args.length; i += 5) {
    this.rLine_(path, args[i], args[i + 1], args[i + 2], args[i + 3], args[i + 4]);
  }
  if (opt_rotation)
    this.rotate(opt_rotation);
};


/**
 * @param {Array.<number>} params - Array of groups square bounds (l, t, size).
 * @private
 */
acgraph.vector.HatchFill.prototype.multiSquareHelper_ = function(params) {
  for (var i = 0; i < params.length; i += 3) {
    var size = params[i + 2];
    this.rectHelper_(size, size, params[i], params[i + 1]);
  }
};


/**
 * Notice non-standard parameters order.
 * @param {number} w
 * @param {number} h
 * @param {number=} opt_l
 * @param {number=} opt_t
 * @private
 */
acgraph.vector.HatchFill.prototype.rectHelper_ = function(w, h, opt_l, opt_t) {
  this.rect(opt_l || 0, opt_t || 0, w, h).fill(this.color).stroke('none');
};


/**
 * @return {acgraph.vector.Path}
 * @private
 */
acgraph.vector.HatchFill.prototype.strokePathHelper_ = function() {
  return /** @type {acgraph.vector.Path} */(this.path().fill('none').stroke(this.color, this.thickness));
};


/**
 * @param {Array.<number>} positions
 * @param {acgraph.vector.Fill=} opt_color
 * @private
 */
acgraph.vector.HatchFill.prototype.onePixelRects_ = function(positions, opt_color) {
  var path = this.path().fill(opt_color || this.color).stroke('none');
  for (var i = 0; i < positions.length; i += 2) {
    var x = positions[i];
    var y = positions[i + 1];
    path.moveTo(x, y).lineTo(x, y + 1, x + 1, y + 1, x + 1, y).close();
  }
};


/**
 * Draw line with round to integer and normalize to crisp line
 * @param {acgraph.vector.Path} path Path.
 * @param {number} startX Start line x.
 * @param {number} startY Start line y.
 * @param {number} endX End line x.
 * @param {number} endY End line y.
 * @param {number} width Width.
 * @return {!acgraph.vector.Path} this for chaining.
 * @private
 */
acgraph.vector.HatchFill.prototype.rLine_ = function(path, startX, startY, endX, endY, width) {
  if (startX === endX) startX = endX = Math.round(startX) + (width % 2 / 2);
  if (startY === endY) startY = endY = Math.round(startY) + (width % 2 / 2);
  path.moveTo(startX, startY).lineTo(endX, endY);
  return path;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Type prefix
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.HatchFill.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.HATCH_FILL;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.HatchFill.prototype.disposeInternal = function() {
  goog.base(this, 'disposeInternal');

  if (this.getStage())
    this.getStage().getDefs().removeHatchFill(this);
};


//exports
(function() {
  var proto = acgraph.vector.HatchFill.prototype;
  proto['dispose'] = proto.dispose;
})();
