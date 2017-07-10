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

  goog.base(this, new goog.math.Rect(0, 0, this.size, this.size));
  this.create_();
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
 * Creates a set of primitives which is a hatch fill.
 * @private
 */
acgraph.vector.HatchFill.prototype.create_ = function() {
  /** @type {acgraph.vector.Path} */
  var path;
  /** @type {acgraph.vector.Rect} */
  var rect;
  var s;

  switch (this.type) {
    case acgraph.vector.HatchFill.HatchFillType.BACKWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, -1, 0, this.size + 1, 0, this.thickness);
      this.rotate(-45);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.FORWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, -1, 0, this.size + 1, 0, this.thickness);
      this.rotate(45);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.HORIZONTAL:
      path = this.path();
      this.rLine_(path, -1, this.size / 2, this.size + 1, this.size / 2, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.VERTICAL:
      path = this.path();
      this.rLine_(path, this.size / 2, -1, this.size / 2, this.size + 1, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.DIAGONAL_CROSS:
      path = this.path();
      this.rLine_(path, 0, this.size / 2, this.size, this.size / 2, this.thickness);
      this.rLine_(path, this.size / 2, 0, this.size / 2, this.size, this.thickness);
      this.rotate(45);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.GRID:
      path = this.path();
      this.rLine_(path, -1, this.size / 2, this.size + 1, this.size / 2, this.thickness);
      this.rLine_(path, this.size / 2, -1, this.size / 2, this.size + 1, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.HORIZONTAL_BRICK:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2 - 1, this.thickness);
      this.rLine_(path, 0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness);
      this.rLine_(path, 0, this.size - 1, this.size, this.size - 1, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.VERTICAL_BRICK:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2 - 1, this.thickness);
      this.rLine_(path, 0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness);
      this.rLine_(path, 0, this.size - 1, this.size, this.size - 1, this.thickness);
      this.rotate(90);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.DIAGONAL_BRICK:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2 - 1, this.thickness);
      this.rLine_(path, 0, this.size / 2 - 1, this.size, this.size / 2 - 1, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2 - 1, this.size / 2, this.size - 1, this.thickness);
      this.rLine_(path, 0, this.size - 1, this.size, this.size - 1, this.thickness);
      this.rotate(45);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.CHECKER_BOARD:
      this.rect(0, 0, this.size / 2, this.size / 2)
          .fill(this.color)
          .stroke('none');

      this.rect(this.size / 2, this.size / 2, this.size, this.size)
          .fill(this.color)
          .stroke('none');
      break;

    case acgraph.vector.HatchFill.HatchFillType.CONFETTI:
      s = this.size / 8;
      var confettiSize = this.size / 4;

      this.rect(0, s * 2, confettiSize, confettiSize)
          .fill(this.color)
          .stroke('none');

      this.rect(s, s * 5, confettiSize, confettiSize)
          .fill(this.color)
          .stroke('none');

      this.rect(s * 2, 0, confettiSize, confettiSize)
          .fill(this.color)
          .stroke('none');

      this.rect(s * 4, s * 4, confettiSize, confettiSize)
          .fill(this.color)
          .stroke('none');

      this.rect(s * 5, s, confettiSize, confettiSize)
          .fill(this.color)
          .stroke('none');

      this.rect(s * 6, s * 6, confettiSize, confettiSize)
          .fill(this.color)
          .stroke('none');
      break;

    case acgraph.vector.HatchFill.HatchFillType.PLAID:
      rect = this.rect(0, 0, this.size / 2, this.size / 2);
      rect.fill(this.color);
      rect.stroke('none');

      s = this.size / 8;
      var isSelected = false;
      for (var dx = 0; dx < 2; dx++) {
        isSelected = false;
        for (var xPos = 0; xPos < 4; xPos++) {
          isSelected = !isSelected;
          for (var yPos = 0; yPos < 4; yPos++) {
            if (isSelected) {
              rect = this.rect(xPos * s + dx * this.size / 2, yPos * s + this.size / 2, s, s);
            }
            rect.fill(this.color);
            rect.stroke('none');
            isSelected = !isSelected;
          }
        }
      }
      break;

    case acgraph.vector.HatchFill.HatchFillType.SOLID_DIAMOND:
      this.path()
          .moveTo(this.size / 2, 0)
          .lineTo(0, this.size / 2)
          .lineTo(this.size / 2, this.size)
          .lineTo(this.size, this.size / 2)
          .lineTo(this.size / 2, 0)
          .close()
          .fill(this.color)
          .stroke('none');
      break;

    case acgraph.vector.HatchFill.HatchFillType.DASHED_FORWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, 0, 0, this.size / 2, this.size / 2, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.DASHED_BACKWARD_DIAGONAL:
      path = this.path();
      this.rLine_(path, this.size / 2, 0, 0, this.size / 2, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.DASHED_HORIZONTAL:
      path = this.path();
      this.rLine_(path, 0, 0, this.size / 2, 0, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2, this.size, this.size / 2, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.DASHED_VERTICAL:
      path = this.path();
      this.rLine_(path, 0, 0, 0, this.size / 2, this.thickness);
      this.rLine_(path, this.size / 2, this.size / 2, this.size / 2, this.size, this.thickness);
      path.fill('none');
      path.stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.DIVOT:
      var percent = 0.1;
      var innerPercent = 0.2;
      var padding = this.size * percent;
      var ds = this.size * (1 - percent * 2 - innerPercent) / 2;

      this.path()
          .moveTo(padding + ds, padding)
          .lineTo(padding, padding + ds / 2)
          .lineTo(padding + ds, padding + ds)
          .moveTo(this.size - padding - ds, this.size - padding - ds)
          .lineTo(this.size - padding, this.size - padding - ds / 2)
          .lineTo(this.size - padding - ds, this.size - padding)
          .fill('none')
          .stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.ZIG_ZAG:
      path = this.path();
      path
          .moveTo(0, 0)
          .lineTo(this.size / 2, this.size / 2)
          .lineTo(this.size, 0)
          .moveTo(0, this.size / 2)
          .lineTo(this.size / 2, this.size)
          .lineTo(this.size, this.size / 2)
          .fill('none')
          .stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.WEAVE:
      this.path()
          .moveTo(0, 0)
          .lineTo(this.size / 2, this.size / 2)
          .lineTo(this.size, 0)
          .moveTo(0, this.size / 2)
          .lineTo(this.size / 2, this.size)
          .lineTo(this.size, this.size / 2)
          .moveTo(this.size / 2, this.size / 2)
          .lineTo(this.size * 3 / 4, this.size * 3 / 4)
          .moveTo(this.size, this.size / 2)
          .lineTo(this.size * 3 / 4, this.size / 4)
          .fill('none')
          .stroke(this.color, this.thickness);
      break;

    case acgraph.vector.HatchFill.HatchFillType.PERCENT_05:
      this.bounds = new goog.math.Rect(0, 0, 8, 8);
      this.rect(0, 0, 1, 1)
          .fill(this.color)
          .stroke('none');
      this.rect(4, 4, 1, 1)
          .fill(this.color)
          .stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_10:
      this.bounds = new goog.math.Rect(0, 0, 8, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(4, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_20:
      this.bounds = new goog.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_25:
      this.bounds = new goog.math.Rect(0, 0, 4, 2);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_30:
      this.bounds = new goog.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_40:
      this.bounds = new goog.math.Rect(0, 0, 4, 8);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 4, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 4, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 5, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 5, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 6, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 6, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 7, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 7, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_50:
      this.bounds = new goog.math.Rect(0, 0, 2, 2);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_60:
      this.bounds = new goog.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 0, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 1, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 2, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(1, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(2, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(3, 3, 1, 1);
      rect.fill(this.color);
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_70:
      this.bounds = new goog.math.Rect(0, 0, 4, 4);
      this.path()
          .moveTo(0, 0).lineTo(0, 1).lineTo(1, 1).lineTo(1, 0).close()
          .moveTo(2, 0).lineTo(2, 1).lineTo(3, 1).lineTo(3, 0).close()
          .moveTo(3, 0).lineTo(3, 1).lineTo(4, 1).lineTo(4, 0).close()
          .moveTo(0, 1).lineTo(0, 2).lineTo(1, 2).lineTo(1, 1).close()
          .moveTo(1, 1).lineTo(1, 2).lineTo(2, 2).lineTo(2, 1).close()
          .moveTo(2, 1).lineTo(2, 2).lineTo(3, 2).lineTo(3, 1).close()
          .moveTo(0, 2).lineTo(0, 3).lineTo(1, 3).lineTo(1, 2).close()
          .moveTo(2, 2).lineTo(2, 3).lineTo(3, 3).lineTo(3, 2).close()
          .moveTo(3, 2).lineTo(3, 3).lineTo(4, 3).lineTo(4, 2).close()
          .moveTo(0, 3).lineTo(0, 4).lineTo(1, 4).lineTo(1, 3).close()
          .moveTo(1, 3).lineTo(1, 4).lineTo(2, 4).lineTo(2, 3).close()
          .moveTo(2, 3).lineTo(2, 4).lineTo(3, 4).lineTo(3, 3).close()
          .fill(this.color)
          .stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_75:
      this.bounds = new goog.math.Rect(0, 0, 4, 4);
      rect = this.rect(0, 0, 4, 4);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 0, 1, 1);
      rect.fill('white');
      rect.stroke('none');
      rect = this.rect(2, 2, 1, 1);
      rect.fill('white');
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_80:
      this.bounds = new goog.math.Rect(0, 0, 8, 4);
      rect = this.rect(0, 0, 8, 4);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(0, 0, 1, 1);
      rect.fill('white');
      rect.stroke('none');
      rect = this.rect(4, 2, 1, 1);
      rect.fill('white');
      rect.stroke('none');
      break;
    case acgraph.vector.HatchFill.HatchFillType.PERCENT_90:
      this.bounds = new goog.math.Rect(0, 0, 8, 8);
      rect = this.rect(0, 0, 8, 8);
      rect.fill(this.color);
      rect.stroke('none');
      rect = this.rect(7, 7, 1, 1);
      rect.fill('white');
      rect.stroke('none');
      rect = this.rect(4, 3, 1, 1);
      rect.fill('white');
      rect.stroke('none');
      break;
  }
};


/**
 * Draw line with round to integer and normalize to crisp line
 * @param {!acgraph.vector.Path} path Path.
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
