goog.provide('acgraph.vector.Text');
goog.provide('acgraph.vector.Text.TextOverflow');

goog.require('acgraph.utils.HTMLParser');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Element');
goog.require('acgraph.vector.TextSegment');
goog.require('goog.math.Rect');



/**
 Text class.<br>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#text} or
 {@link acgraph.vector.Layer#text} to create layer or stage bound text.
 <br/> Use {@link acgraph.text} to create unbound text.
 @see acgraph.vector.Stage#text
 @see acgraph.vector.Layer#text
 @see acgraph.text
 @name acgraph.vector.Text
 @param {number=} opt_x Coordinate X (Left) of left top corner of text bounds.
 @param {number=} opt_y Coordinate Y (Top) of left top corner of text bounds.
 @constructor
 @extends {acgraph.vector.Element}
*/
acgraph.vector.Text = function(opt_x, opt_y) {

  /**
   * Define whether the text was defragmented.
   * @type {boolean}
   */
  this.defragmented = false;

  /**
   * X coordinate.
   * @type {number}
   * @private
   */
  this.x_ = opt_x || 0;

  /**
   * Y coordinate.
   * @type {number}
   * @private
   */
  this.y_ = opt_y || 0;

  /**
   * Element bounds.
   * acgraph.vector.Element.DirtyState.DATA must be set with any changes.
   * @type {goog.math.Rect}
   * @protected
   */
  this.bounds = new goog.math.Rect(this.x_, this.y_, 0, 0);

  /**
   *
   * @type {number}
   */
  this.realHeight = 0;

  /**
   *
   * @type {number}
   */
  this.realWidth = 0;

  /**
   * Calculated  X coordinate. Property X of text node, X coordinate of text baseline of first
   * tspan node, therefore need to calculate X coordinate, that mean coordinate left top corner of bounds text node.
   * @type {number}
   */
  this.calcX = 0;

  /**
   * Calculated Y coordinate.
   * @type {number}
   */
  this.calcY = 0;

  /**
   * Text mode. HTML or plain text.
   * @type {boolean}
   * @private
   */
  this.htmlOn_ = false;

  /**
   * Text segments.
   * @type {!Array.<acgraph.vector.TextSegment>}
   * @private
   */
  this.segments_ = [];

  /**
   * Array of segments representing text line.
   * @type {!Array.<acgraph.vector.TextSegment>}
   * @private
   */
  this.currentLine_ = [];

  /**
   * Width of current text line.
   * @type {number}
   * @private
   */
  this.currentLineWidth_ = 0;

  /**
   * Width of line before current.
   * @type {number}
   * @private
   */
  this.prevLineWidth_ = 0;

  /**
   * Height of current text line.
   * @type {number}
   * @private
   */
  this.currentLineHeight_ = 0;

  /**
   * Whether current line empty.
   * @type {boolean}
   * @private
   */
  this.currentLineEmpty_ = true;

  /**
   * Number of sequential breaks
   * @type {number}
   * @private
   */
  this.currentNumberSeqBreaks_ = 0;

  /**
   * Sum of empty lines height.
   * @type {number}
   * @private
   */
  this.accumulatedHeight_ = 0;

  /**
   * Value of baseline of current text line.
   * @type {number}
   * @private
   */
  this.currentBaseLine_ = 0;

  /**
   * Y offset of current line.
   * @type {number}
   * @private
   */
  this.currentDy_ = 0;

  /**
   * Text Lines.
   * @type {!Array.<Array.<acgraph.vector.TextSegment>>}
   * @private
   */
  this.textLines_ = [];

  /**
   * Length between two nearby text line.
   * @type {number|string}
   * @private
   */
  this.lineHeight_ = 1;

  /**
   * Set of the symbols which is completing text if it's out of height.
   * @type {string}
   * @private
   */
  this.ellipsis_ = acgraph.vector.Text.TextOverflow.CLIP;

  /**
   * Text indent.
   * @type {number}
   * @private
   */
  this.textIndent_ = 0;

  /**
   * Direction of text. If true - text direction right-to-left else - left-to-right.
   * @type {boolean}
   */
  this.rtl = false;

  /**
   * If true then adding of segments is stopped.
   * @type {boolean}
   * @private
   */
  this.stopAddSegments_ = false;

  /**
   * Default style for text.
   * @type {?acgraph.vector.TextStyle}
   * @private
   */
  this.defaultStyle_ = /** @type {acgraph.vector.TextStyle} **/ ({
    'fontSize': goog.global['acgraph']['fontSize'],
    'color': goog.global['acgraph']['fontColor'],
    'fontFamily': goog.global['acgraph']['fontFamily'],
    'direction': goog.global['acgraph']['textDirection'],
    'textOverflow': acgraph.vector.Text.TextOverflow.CLIP,
    'wordBreak': acgraph.vector.Text.WordBreak.NORMAL,
    'wordWrap': acgraph.vector.Text.WordWrap.NORMAL,
    'selectable': true,
    'hAlign': acgraph.vector.Text.HAlign.START
  });

  this.style_ = /** @type {acgraph.vector.TextStyle} **/ (this.defaultStyle_);

  this.textPath = null;

  goog.base(this);
};
goog.inherits(acgraph.vector.Text, acgraph.vector.Element);


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Text wrap mode.
 * @enum {string}
 */
acgraph.vector.Text.WordBreak = {
  /**
   Break words according to their usual rules.
   */
  NORMAL: 'normal',
  /**
   Don't allow word breaks for CJK text.  Non-CJK text behavior is the same as for normal.
   */
  KEEP_ALL: 'keep-all',
  /**
   Word breaks may be inserted between any character.
   */
  BREAK_ALL: 'break-all'
};


/**
 * Text wrap mode.
 * @enum {string}
 */
acgraph.vector.Text.WordWrap = {
  /**
   Indicates that lines may only break at normal word break points.
   */
  NORMAL: 'normal',
  /**
   Indicates that normally unbreakable words may be broken at arbitrary points if there are no otherwise acceptable break points in the line.
   */
  BREAK_WORD: 'break-word'
};


/**
 * Defines visibility in block, of text can't be shown in the area.
 * @enum {string}
 */
acgraph.vector.Text.TextOverflow = {
  /**
   If height and width is set and text doesn't fit - it will be clipped.
   */
  CLIP: '',
  /**
   Text is clipped too, but with ellipsis in the end.
   */
  ELLIPSIS: '...'
};


/**
 * Text HAlign.
 * @enum {string}
 */
acgraph.vector.Text.HAlign = {
  /**
   Aligns the text to the left.
   */
  LEFT: 'left',
  /**
   The same as left if direction is left-to-right and right if direction is right-to-left.
   */
  START: 'start',
  /**
   The inline contents are centered within the line box.
   */
  CENTER: 'center',
  /**
   The same as right if direction is left-to-right and left if direction is right-to-left.
   */
  END: 'end',
  /**
   Aligns the text to the right.
   */
  RIGHT: 'right'
};


/**
 * Text VAilgn.
 * @enum {string}
 */
acgraph.vector.Text.VAlign = {
  /**
   vAlign top.
   */
  TOP: 'top',
  /**
   */
  MIDDLE: 'middle',
  /**
   vAlign bottom.
   */
  BOTTOM: 'bottom'
};


/**
 * Text decoration.
 * @enum {string}
 */
acgraph.vector.Text.Decoration = {
  /**
   Blinking text. This value is not supported by some browser and is discussed in CSS3,
   animation is recommended instead.
   */
  BLINK: 'blink',
  /**
   Line through decoration.
   */
  LINE_THROUGH: 'line-through',
  /**
   Overline decoration.
   */
  OVERLINE: 'overline',
  /**
   Underline decoration.
   */
  UNDERLINE: 'underline',
  /**
   Cancels all decorations, including links underline.
   */
  NONE: 'none'
};


/**
 * Defines lowercase.
 * @enum {string}
 */
acgraph.vector.Text.FontVariant = {
  /**
   Leave lovercase as is.
   */
  NORMAL: 'normal',
  /**
   Make lowercase smaller.
   */
  SMALL_CAP: 'small-caps'
};


/**
 * Font style.
 * @enum {string}
 */
acgraph.vector.Text.FontStyle = {
  /**
   Normal.
   */
  NORMAL: 'normal',
  /**
   Italic.
   */
  ITALIC: 'italic',
  /**
   Oblique.
   */
  OBLIQUE: 'oblique'
};


/**
 * Text direction.
 * @enum {string}
 */
acgraph.vector.Text.Direction = {
  /**
   Left to right.
   */
  LTR: 'ltr',
  /**
   Right to left.
   */
  RTL: 'rtl'
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------


/**
 * Supported states. Inherited from Element and text data added.
 * @type {number}
 */
acgraph.vector.Text.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.DATA |
        acgraph.vector.Element.DirtyState.STYLE |
        acgraph.vector.Element.DirtyState.POSITION |
        acgraph.vector.Element.DirtyState.CHILDREN;


/**
 * Style.
 * @type {?acgraph.vector.TextStyle}
 * @private
 */
acgraph.vector.Text.prototype.style_ = null;


/**
 * Text.
 * @type {?string}
 * @private
 */
acgraph.vector.Text.prototype.text_ = null;


/**
 Getter for X coordinate of text.
 @param {number=} opt_value .
 @return {number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.x = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.x_ != opt_value) {
      this.x_ = opt_value;
      if (this.defragmented) this.calculateX();
      this.bounds.left = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.x_;
};


/**
 Getter for Y coordinate of text.
 @param {number=} opt_value .
 @return {number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.y = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    if (this.y_ != opt_value) {
      this.y_ = opt_value;
      if (this.defragmented) this.calculateY();
      this.bounds.top = opt_value;
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.dropBoundsCache();
    }
    return this;
  }
  return this.y_;
};


/**
 * Sets style property value. Method sets dirty state DATA and STYLE and require re-parse text.
 * If text property not have effect on text segments position then don't use this method.
 * @param {string} prop Property name.
 * @param {(boolean|string|number|null)=} opt_value Property
 * value.
 * @return {boolean|string|number|acgraph.vector.Text}
 * Returns property value if opt_value not defined else this object.
 * @protected
 */
acgraph.vector.Text.prototype.setStyleProperty = function(prop, opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value !== this.style_[prop]) {
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) this.getStage().suspend();
      this.style_[prop] = opt_value;
      this.defragmented = false;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.transformAfterChange();
      if (!stageSuspended) this.getStage().resume();
    }
    return this;
  }
  return /** @type {boolean|string|number|acgraph.vector.Text} */(this.style_[prop]);
};


/**
 * Only for IE<9 (VML). After the changes that trigger the re-defragmentation of the text, you need to re-render
 * the transformation.
 * @protected
 */
acgraph.vector.Text.prototype.transformAfterChange = function() {
  if (acgraph.getRenderer().needsReRenderOnParentTransformationChange()) {
    var tx = this.getFullTransformation();
    if (tx && !tx.isIdentity()) {
      this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    }
  }
};


/**
 Returns width.<br/>
 <b>Note:</b> it is not calculated automatically and has no default, and if it
 was not set using setter - <b>NaN</b> is returned.
 @param {(number|string|null)=} opt_value .
 @return {number|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.setStyleProperty('width') != opt_value) {
      if (!goog.isNull(opt_value))
        opt_value = (Math.max(parseFloat(opt_value), 0) || 0);
      this.width_ = opt_value;
    }
  }
  return /** @type {number|string|acgraph.vector.Text} */ (this.setStyleProperty('width', opt_value));
};


/**
 Returns height.<br/>
 <b>Note:</b> it is not calculated automatically and has no default, and if it
 was not set using setter - <b>NaN</b> is returned.
 @param {(number|string|null)=} opt_value .
 @return {number|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.setStyleProperty('height') != opt_value)
      if (!goog.isNull(opt_value))
        opt_value = (Math.max(parseFloat(opt_value), 0) || 0);
      this.height_ = opt_value;
  }
  return /** @type {number|string|acgraph.vector.Text} */ (this.setStyleProperty('height', opt_value));
};


/**
 Getter for text opacity.
 @param {number=} opt_value .
 @return {number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.opacity = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.style_['opacity'] = opt_value;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    return this;
  }
  return this.style_['opacity'];
};


/**
 Getter for text color.
 @param {string=} opt_value .
 @return {string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.color = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {
    this.style_['color'] = opt_value;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    return this;
  }
  return this.style_['color'];
};


/**
 Getter for font size of text.
 @param {(string|number)=} opt_value .
 @return {string|number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.fontSize = function(opt_value) {
  return /** @type {number|string|acgraph.vector.Text} */ (this.setStyleProperty('fontSize', opt_value));
};


/**
 Getter for font family of text.
 @param {string=} opt_value .
 @return {string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.fontFamily = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('fontFamily', opt_value));
};


/**
 Getter for text direction.
 @param {(acgraph.vector.Text.Direction|string)=} opt_value .
 @return {acgraph.vector.Text.Direction|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.direction = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('direction', /** @type {string} */(opt_value)));
};


/**
 Getter for font style of text.
 @param {(acgraph.vector.Text.FontStyle|string)=} opt_value .
 @return {acgraph.vector.Text.FontStyle|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.fontStyle = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('fontStyle', /** @type {string} */(opt_value)));
};


/**
 Getter for font variant of text.
 @param {(acgraph.vector.Text.FontVariant|string)=} opt_value .
 @return {acgraph.vector.Text.FontVariant|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.fontVariant = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('fontVariant', /** @type {string} */(opt_value)));
};


/**
 Getter for font weight of text.
 @param {(string|number)=} opt_value .
 @return {string|number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.fontWeight = function(opt_value) {
  return /** @type {number|string|acgraph.vector.Text} */ (this.setStyleProperty('fontWeight', opt_value));
};


/**
 Getter for letter spacing of text.
 @param {(string|number)=} opt_value .
 @return {string|number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.letterSpacing = function(opt_value) {
  return /** @type {number|string|acgraph.vector.Text} */ (this.setStyleProperty('letterSpacing', opt_value));
};


/**
 Getter for text decoration.
 @param {(acgraph.vector.Text.Decoration|string)=} opt_value .
 @return {acgraph.vector.Text.Decoration|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.decoration = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('decoration', /** @type {string} */(opt_value)));
};


/**
 Getter for line height of text.
 @param {(string|number)=} opt_value .
 @return {string|number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.lineHeight = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value))
    this.lineHeight_ = this.normalizeLineHeight_(opt_value);
  return /** @type {number|string|acgraph.vector.Text} */ (this.setStyleProperty('lineHeight', opt_value));
};


/**
 * Normalizes line height value.
 * @param {string|number|undefined|null} lineHeight
 * @return {(string|number)}
 * @private
 */
acgraph.vector.Text.prototype.normalizeLineHeight_ = function(lineHeight) {
  var value = parseFloat(lineHeight);
  if (isNaN(value) || value < 0) {
    return 1;
  } else {
    if (goog.isString(lineHeight) && goog.string.endsWith(lineHeight, '%'))
      return (1 + parseFloat(lineHeight) / 100);
  }
  return /** @type {string|number} */ (lineHeight);
};


/**
 Getter for text indent.
 @param {number=} opt_value .
 @return {number|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.textIndent = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) this.textIndent_ = opt_value;
  return /** @type {number|acgraph.vector.Text} */ (this.setStyleProperty('textIndent', opt_value));
};


/**
 Getter for vertical align of text.
 @param {(acgraph.vector.Text.VAlign|string)=} opt_value .
 @return {acgraph.vector.Text.VAlign|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == 'center')
      opt_value = acgraph.vector.Text.VAlign.MIDDLE;
    else {
      var validParam = false;
      goog.object.forEach(acgraph.vector.Text.VAlign, function(value) {
        if (opt_value == value) validParam = true;
      });
      if (!validParam) opt_value = acgraph.vector.Text.VAlign.TOP;
    }
  }
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('vAlign', /** @type {string} */(opt_value)));
};


/**
 Getter for horizontal align of text.
 @param {(acgraph.vector.Text.HAlign|string)=} opt_value .
 @return {acgraph.vector.Text.HAlign|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value == 'middle')
      opt_value = acgraph.vector.Text.HAlign.CENTER;
    else {
      var validParam = false;
      goog.object.forEach(acgraph.vector.Text.HAlign, function(value) {
        if (opt_value == value) validParam = true;
      });
      if (!validParam) opt_value = acgraph.vector.Text.HAlign.START;
    }
  }
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('hAlign', /** @type {string} */(opt_value)));
};


/**
 Getter for word break of text.
 @param {string=} opt_value .
 @return {string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.wordBreak = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('wordBreak', /** @type {string} */(opt_value)));
};


/**
 Getter for word wrap of text.
 @param {string=} opt_value .
 @return {string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.wordWrap = function(opt_value) {
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('wordWrap', /** @type {string} */(opt_value)));
};


/**
 Getter for font text overflow of text.
 @param {(acgraph.vector.Text.TextOverflow|string)=} opt_value .
 @return {acgraph.vector.Text.TextOverflow|string|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.textOverflow = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) this.ellipsis_ = opt_value;
  return /** @type {string|acgraph.vector.Text} */ (this.setStyleProperty('textOverflow', /** @type {string} */(opt_value)));
};


/**
 Getter for text selectable property.
 @param {boolean=} opt_value .
 @return {boolean|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.selectable = function(opt_value) {
  return /** @type {boolean|acgraph.vector.Text} */ (this.setStyleProperty('selectable', opt_value));
};


/**
 * Path for text.
 * @param {acgraph.vector.Path=} opt_value .
 * @return {acgraph.vector.Path|acgraph.vector.Text}
 */
acgraph.vector.Text.prototype.path = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.path_ = opt_value;
    if (this.getStage())
      this.path_.parent(this.getStage().getDefs());

    var stageSuspended = !this.getStage() || this.getStage().isSuspended();
    if (!stageSuspended) this.getStage().suspend();
    this.defragmented = false;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
    this.transformAfterChange();
    if (!stageSuspended) this.getStage().resume();

    return this;
  }
  return this.path_;
};


/**
 Getter for style.
 @param {acgraph.vector.TextStyle=} opt_value Style.
 @return {acgraph.vector.TextStyle|acgraph.vector.Text} Style.
 */
acgraph.vector.Text.prototype.style = function(opt_value) {
  if (goog.isDefAndNotNull(opt_value)) {

    goog.object.forEach(opt_value, function(value, key) {
      var styleName = key;
      switch (key) {
        case 'fontDecoration':
        case 'textDecoration':
          styleName = 'decoration';
          break;
        case 'fontColor':
          styleName = 'color';
          break;
        case 'fontOpacity':
          styleName = 'opacity';
          break;
      }
      this.style_[styleName] = value;
    }, this);

    this.width_ = parseFloat(this.style_['width']) || 0;
    this.height_ = parseFloat(this.style_['height']) || 0;

    if (this.style_['lineHeight']) {
      this.lineHeight_ = this.normalizeLineHeight_(this.style_['lineHeight']);
    }

    var validParam;
    var vAlign = this.style_['vAlign'];
    if (goog.isDefAndNotNull(vAlign)) {
      if (vAlign == 'center')
        this.style_['vAlign'] = acgraph.vector.Text.VAlign.MIDDLE;
      else {
        validParam = false;
        goog.object.forEach(acgraph.vector.Text.VAlign, function(value) {
          if (vAlign == value) validParam = true;
        });
        if (!validParam) this.style_['vAlign'] = acgraph.vector.Text.VAlign.TOP;
      }
    }

    var hAlign = this.style_['hAlign'];
    if (goog.isDefAndNotNull(hAlign)) {
      if (hAlign == 'middle')
        this.style_['hAlign'] = acgraph.vector.Text.HAlign.CENTER;
      else {
        validParam = false;
        goog.object.forEach(acgraph.vector.Text.HAlign, function(value) {
          if (hAlign == value) validParam = true;
        });
        if (!validParam) this.style_['hAlign'] = acgraph.vector.Text.HAlign.START;
      }
    }

    if (goog.isDefAndNotNull(this.style_['direction']))
      this.rtl = this.style_['direction'] == acgraph.vector.Text.Direction.RTL;
    if (goog.isDefAndNotNull(this.style_['textOverflow'])) this.ellipsis_ = this.style_['textOverflow'];
    if (goog.isDefAndNotNull(this.style_['textIndent'])) this.textIndent_ = this.style_['textIndent'];

    // only this for now. only pixel offset.
    // if (this.style_.textIndent) this.style_.textIndent = parseInt(this.style_.textIndent, 0);
    // for rtl - do not count textIndent.
    if (this.rtl) this.textIndent_ = 0;

    var stageSuspended = !this.getStage() || this.getStage().isSuspended();
    if (!stageSuspended) this.getStage().suspend();
    this.defragmented = false;
    this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
    this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
    this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
    this.setDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
    this.transformAfterChange();
    if (!stageSuspended) this.getStage().resume();
    return this;
  }
  return this.style_;
};


/**
 Get current text.
 @param {string=} opt_value .
 @return {string|acgraph.vector.Text} .
 */
acgraph.vector.Text.prototype.text = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.text_) {
      this.text_ = String(opt_value);
      this.htmlOn_ = false;
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) this.getStage().suspend();
      this.defragmented = false;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.transformAfterChange();
      if (!stageSuspended) this.getStage().resume();
    }
    return this;
  }
  return this.text_;
};


/**
 Get current text.
 @param {string=} opt_value .
 @return {string|acgraph.vector.Text} .
 */
acgraph.vector.Text.prototype.htmlText = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (opt_value != this.text_) {
      this.text_ = String(opt_value);
      this.htmlOn_ = true;
      var stageSuspended = !this.getStage() || this.getStage().isSuspended();
      if (!stageSuspended) this.getStage().suspend();
      this.defragmented = false;
      this.setDirtyState(acgraph.vector.Element.DirtyState.STYLE);
      this.setDirtyState(acgraph.vector.Element.DirtyState.DATA);
      this.setDirtyState(acgraph.vector.Element.DirtyState.POSITION);
      this.transformAfterChange();
      if (!stageSuspended) this.getStage().resume();
    }
    return this;
  }
  return this.text_;
};


/**
 * Initialize.
 * @private
 */
acgraph.vector.Text.prototype.init_ = function() {
  if (this.segments_.length != 0) {
    this.textLines_ = [];
    this.segments_ = [];
  }
  if (goog.isDefAndNotNull(this.style_['direction']))
    this.rtl = this.style_['direction'] == acgraph.vector.Text.Direction.RTL;
  if (goog.isDefAndNotNull(this.style_['textIndent'])) this.textIndent_ = this.style_['textIndent'];
  if (this.rtl) this.textIndent_ = 0;
  this.width_ = parseFloat(this.style_['width']) || 0;
  this.height_ = parseFloat(this.style_['height']) || 0;
  this.stopAddSegments_ = false;
  this.prevLineWidth_ = 0;
  this.currentDy_ = 0;
  this.realWidth = 0;
  this.realHeight = 0;
  this.accumulatedHeight_ = 0;
  this.currentNumberSeqBreaks_ = 0;
  this.currentLineHeight_ = 0;
  this.currentLineWidth_ = 0;
  this.currentBaseLine_ = 0;
  this.currentLine_ = [];
  this.calcX = 0;
  this.calcY = 0;
  this.textByPathBoundsCache = null;

  this.align = 'start';
  if (this.style_['hAlign']) {
    if (this.style_['direction'] == 'rtl') {
      if (goog.userAgent.GECKO || goog.userAgent.IE) {
        this.align = (this.style_['hAlign'] == acgraph.vector.Text.HAlign.END || this.style_['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
            acgraph.vector.Text.HAlign.START :
            (this.style_['hAlign'] == acgraph.vector.Text.HAlign.START || this.style_['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
                acgraph.vector.Text.HAlign.END :
                'middle';
      } else {
        this.align = (this.style_['hAlign'] == acgraph.vector.Text.HAlign.END || this.style_['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
            acgraph.vector.Text.HAlign.END :
            (this.style_['hAlign'] == acgraph.vector.Text.HAlign.START || this.style_['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
                acgraph.vector.Text.HAlign.START :
                'middle';
      }
    } else {
      this.align = (this.style_['hAlign'] == acgraph.vector.Text.HAlign.END || this.style_['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) ?
          acgraph.vector.Text.HAlign.END :
          (this.style_['hAlign'] == acgraph.vector.Text.HAlign.START || this.style_['hAlign'] == acgraph.vector.Text.HAlign.LEFT) ?
              acgraph.vector.Text.HAlign.START :
              'middle';
    }
  }

  var isWidthProp = goog.isDefAndNotNull(this.style_['width']);
  this.isWidthSet = this.path() || isWidthProp;
  var widthProp = isWidthProp ? parseFloat(this.style_['width']) : Number.POSITIVE_INFINITY;
  this.textWidthLimit = Math.max(this.path() ? Math.min(this.path().getLength(), widthProp) : this.width_, 0);
};


/** @inheritDoc */
acgraph.vector.Text.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.TEXT;
};


/**
 * This is optimized, but may be we will need it later.
 * @return {!Array.<acgraph.vector.TextSegment>} Array of text segments.
 */
acgraph.vector.Text.prototype.getSegments = function() {
  return this.segments_;
};


/**
 * Returns an array of text lines, each of lines is an array of segments in this line.
 * @return {!Array.<Array.<acgraph.vector.TextSegment>>} Array of text lines.
 */
acgraph.vector.Text.prototype.getLines = function() {
  return this.textLines_;
};


/** @inheritDoc */
acgraph.vector.Text.prototype.getBoundsWithoutTransform = function() {
  return this.bounds.clone();
};


/** @inheritDoc */
acgraph.vector.Text.prototype.getBoundsWithTransform = function(transform) {
  if (!this.defragmented) this.textDefragmentation();

  if (!transform) {
    if (this.path()) {
      if (this.textByPathBoundsCache)
        return this.textByPathBoundsCache.clone();
      else
        return this.textByPathBoundsCache = acgraph.getRenderer().measureTextDom(this);
    }
    return this.bounds.clone();
  }

  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();

  if (this.boundsCache && isSelfTransform)
    return this.boundsCache.clone();
  else if (this.absoluteBoundsCache && isFullTransform)
    return this.absoluteBoundsCache.clone();
  else {
    var bounds = this.path() ?
        this.textByPathBoundsCache ? this.textByPathBoundsCache : acgraph.getRenderer().measureTextDom(this) :
        this.bounds.clone();
    /** @type {!goog.math.Rect} */
    var rect = acgraph.math.getBoundsOfRectWithTransform(bounds, transform);
    if (isSelfTransform)
      this.boundsCache = rect.clone();
    if (isFullTransform)
      this.absoluteBoundsCache = rect.clone();
    return rect;
  }
};


/**
 * Gets bounds of current rect as is.
 * Ignores width and height set, just takes a text value and applies current style.
 * @return {goog.math.Rect} - Measure of text got by current renderer.
 */
acgraph.vector.Text.prototype.getOriginalBounds = function() {
  if (goog.isDefAndNotNull(this.text_)) {
    //Patches bounds because measure() method returns bbox's bounds.
    var measure = /** @type {goog.math.Rect} */ (acgraph.getRenderer().measure(this.text(), this.style()));
    measure.left = this.x_;
    measure.top = this.y_;
    return measure;
  }
  return new goog.math.Rect(0, 0, 0, 0);
};


/** @inheritDoc */
acgraph.vector.Text.prototype.dropBoundsCache = function() {
  goog.base(this, 'dropBoundsCache');
  this.textByPathBoundsCache = null;
};


/**
 * Checks is text html or not.
 * @return {boolean} Is text html or not.
 */
acgraph.vector.Text.prototype.isHtml = function() {
  return this.htmlOn_;
};


/**
 * Merge styles.
 * @param {...Object} var_args
 * @return {Object}
 * @private
 */
acgraph.vector.Text.prototype.mergeStyles_ = function(var_args) {
  var settingsAffectingSize = acgraph.getRenderer().settingsAffectingSize;
  var styles = arguments;
  var style = {};

  for (var j = 0, l = settingsAffectingSize.length; j < l; j++) {
    for (var i = styles.length; i--;) {
      var s = styles[i];
      if (s) {
        var prop = s[settingsAffectingSize[j]];
        if (goog.isDef(prop)) {
          style[settingsAffectingSize[j]] = prop;
          break;
        }
      }
    }
  }

  return style;
};


/**
 * Measures the text and returns it bounds.
 * @param {string} text Text for measure.
 * @param {acgraph.vector.TextSegmentStyle} segmentStyle Text segment style.
 * @return {goog.math.Rect} Bounds of text.
 * @protected
 */
acgraph.vector.Text.prototype.getTextBounds = function(text, segmentStyle) {
  var style = this.mergeStyles_(this.style_, segmentStyle);
  return acgraph.getRenderer().textBounds(text, style);
};


/**
 * Returns actual text width.
 * @return {number}
 */
acgraph.vector.Text.prototype.getTextWidth = function() {
  if (!this.defragmented) this.textDefragmentation();
  return this.realWidth;
};


/**
 * Returns actual text height.
 * @return {number}
 */
acgraph.vector.Text.prototype.getTextHeight = function() {
  if (!this.defragmented) this.textDefragmentation();
  return this.realHeight;
};


/**
 * Cuts the text to fit in the set range.
 * @param {string} text Text of text segment.
 * @param {acgraph.vector.TextSegmentStyle} style Segment style.
 * @param {number} a Value of low limit of range.
 * @param {number} b Value of high limit of range.
 * @param {goog.math.Rect} segmentBounds Segment bounds.
 * @param {boolean=} opt_ignoreByWord Ignore by word mode.
 * @return {number} Position in inbound text where it has been cut.
 * @private
 */
acgraph.vector.Text.prototype.cutTextSegment_ = function(text, style, a, b, segmentBounds, opt_ignoreByWord) {
  var subWrappedText;
  var subSegmentBounds;

  var width = b - a;
  var avgSymbolWeight = segmentBounds.width / text.length;
  var pos = Math.floor(width / avgSymbolWeight);

  subWrappedText = text.substring(0, pos);
  subSegmentBounds = this.getTextBounds(subWrappedText, style);

  while (a + subSegmentBounds.width < b && pos > 1) {
    pos++;
    subWrappedText = text.substring(0, pos);

    subSegmentBounds = this.getTextBounds(subWrappedText, style);
  }

  while (a + subSegmentBounds.width > b && pos > 1) {
    pos--;
    subWrappedText = text.substring(0, pos);
    subSegmentBounds = this.getTextBounds(subWrappedText, style);
  }

  var resultStatus = this.mergeStyles_(this.style_, style);
  var cutText = text.substring(pos, text.length);
  var cutTextWidth = segmentBounds.width - subSegmentBounds.width;
  var bounds = segmentBounds.clone();
  bounds.width = cutTextWidth;
  acgraph.getRenderer().textBounds(cutText, resultStatus, bounds);

  var isWWBreak = this.style_['wordWrap'] != acgraph.vector.Text.WordWrap.NORMAL;
  var isWBCJK = this.style_['wordBreak'] == acgraph.vector.Text.WordBreak.KEEP_ALL;
  var isWBBreak = this.style_['wordBreak'] == acgraph.vector.Text.WordBreak.BREAK_ALL;

  if (!isWBBreak && !opt_ignoreByWord) {
    var anyWhiteSpace = /\s+/g;
    var anyNonWhiteSpace = /\S+/g;
    var cjkChar = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uffef\u4e00-\u9faf\uAC00-\uD7A3\u1100–\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]+/g;

    var left = subWrappedText[subWrappedText.length - 1];
    var right = cutText[0];

    var cjkCase = !isWBCJK && (cjkChar.test(left) || cjkChar.test(right));

    if (!(anyWhiteSpace.test(left) || anyWhiteSpace.test(right) || cjkCase)) {
      if (anyWhiteSpace.test(subWrappedText)) {
        var words = subWrappedText.match(anyNonWhiteSpace);
        pos = subWrappedText.lastIndexOf(words[words.length - 1]);
      } else {
        var tt = anyNonWhiteSpace.exec(text)[0];
        if (!isWWBreak)
          pos = tt.length;
      }
    }
  }

  return pos;
};


/**
 * Creating text segment element.
 * @param {string} text Text of the text segment.
 * @param {acgraph.vector.TextSegmentStyle} style Text segment style.
 * @param {goog.math.Rect} bounds Text segment bounds.
 * @param {number=} opt_shift Shift x coordinate for the text segment.
 * @return {acgraph.vector.TextSegment} Created text segment.
 * @private
 */
acgraph.vector.Text.prototype.createSegment_ = function(text, style, bounds, opt_shift) {
  // create segment object
  var segment = new acgraph.vector.TextSegment(text, style);
  segment.baseLine = -bounds.top;
  segment.height = bounds.height;
  segment.width = bounds.width;

  if (this.textIndent_ && this.segments_.length == 0) {
    var shift = opt_shift || 0;
    this.textIndent_ = this.width_ && (this.textIndent_ + bounds.width + shift > this.width_) ?
        this.width_ - bounds.width - shift :
        this.textIndent_;
    if (this.textIndent_ < 0) this.textIndent_ = 0;
  }

  // calculate line params with newly added segment.
  this.currentLineHeight_ = Math.max(this.currentLineHeight_, bounds.height);
  this.currentLineWidth_ += bounds.width;
  if (this.segments_.length == 0) this.currentLineWidth_ += this.textIndent_;
  this.currentBaseLine_ = Math.max(this.currentBaseLine_, segment.baseLine);
  this.currentLineEmpty_ = this.currentLine_.length ? this.currentLineEmpty_ && text.length == 0 : text.length == 0;

  // add segment to the segment array and to the current line.
  this.currentLine_.push(segment);
  this.segments_.push(segment);
  // set segment parent
  segment.parent(this);

  return segment;
};


/**
 * Applying text overflow properties.
 * If set width, height and text Overflow properties of text, and text out of the height then it will
 * be cropped and joined ellipsis.
 * @param {!Array.<acgraph.vector.TextSegment>=} opt_line .
 * @private
 */
acgraph.vector.Text.prototype.applyTextOverflow_ = function(opt_line) {
  var segment, index, cutPos, textSegmentEllipsis;

  var line = /** @type {!Array.<acgraph.vector.TextSegment>} */ (opt_line || goog.array.peek(this.textLines_));
  var peekSegment = /** @type {!acgraph.vector.TextSegment} */ (goog.array.peek(line));
  var ellipsisBounds = this.getTextBounds(this.ellipsis_, peekSegment.getStyle());
  // Copy ellipsis to avoid overwriting this.ellipsis_ because "..." can be ".." (cut) when resize happened.
  var ellipsis = this.ellipsis_;

  if (ellipsisBounds.width > this.textWidthLimit) {
    cutPos = this.cutTextSegment_(this.ellipsis_, peekSegment.getStyle(), 0, this.textWidthLimit, ellipsisBounds, true);
    ellipsis = this.ellipsis_.substring(0, cutPos);
  }

  var left = this.prevLineWidth_;
  var right = this.textWidthLimit;

  if (ellipsis == '') {
    index = goog.array.indexOf(this.segments_, peekSegment) + 1;
    goog.array.splice(this.segments_, index, this.segments_.length - index);
  } else if (right - left >= ellipsisBounds.width) {
    this.currentLine_ = line;
    index = goog.array.indexOf(this.segments_, peekSegment) + 1;
    goog.array.splice(this.segments_, index, this.segments_.length - index);
    textSegmentEllipsis = this.createSegment_(ellipsis, peekSegment.getStyle(), ellipsisBounds);

    if (this.currentLine_.length == 2 && this.currentLine_[0].text == '') {
      textSegmentEllipsis.dy = this.accumulatedHeight_ - this.currentLine_[0].height;
      textSegmentEllipsis.firstInLine = true;
    }
  } else {
    var i = line.length - 1;
    var segmentBounds;
    while (!segment && i >= 0) {
      peekSegment = line[i];
      ellipsisBounds = this.getTextBounds(ellipsis, peekSegment.getStyle());
      segmentBounds = this.getTextBounds(peekSegment.text, peekSegment.getStyle());

      if (left - segmentBounds.width + ellipsisBounds.width <= this.textWidthLimit) {
        segment = peekSegment;
      }
      left -= segmentBounds.width;
      i--;
    }

    if (!segment && this.textLines_.length == 1) {
      segment = line[0];
      left -= segmentBounds.width;
    }

    if (segment) {
      this.currentLine_ = line;
      var dy = this.currentLine_[0].dy;
      right -= ellipsisBounds.width;

      index = goog.array.indexOf(line, segment);
      goog.array.splice(line, index, line.length - index);
      index = goog.array.indexOf(this.segments_, segment);
      goog.array.splice(this.segments_, index, this.segments_.length - index);

      this.currentLineHeight_ = 0;
      this.currentLineWidth_ = 0;
      this.currentBaseLine_ = 0;

      segmentBounds = this.getTextBounds(segment.text, segment.getStyle());
      cutPos = this.cutTextSegment_(segment.text, segment.getStyle(), left, right, segmentBounds, true);

      if (cutPos < 1) cutPos = 1;
      var cutText = segment.text.substring(0, cutPos);
      var segment_bounds = this.getTextBounds(cutText, segment.getStyle());

      var lastSegmentInline = this.createSegment_(cutText, segment.getStyle(), segment_bounds, ellipsisBounds.width);
      lastSegmentInline.x = segment.x;
      lastSegmentInline.y = segment.y;

      if (segment_bounds.width + ellipsisBounds.width > this.textWidthLimit) {
        cutPos = this.cutTextSegment_(this.ellipsis_, peekSegment.getStyle(), segment_bounds.width, this.textWidthLimit, ellipsisBounds, true);
        ellipsis = this.ellipsis_.substring(0, cutPos);
      }
      if (cutPos > 0) {
        textSegmentEllipsis = this.createSegment_(ellipsis, segment.getStyle(), ellipsisBounds);
        textSegmentEllipsis.x = lastSegmentInline.x + segment_bounds.width;
        textSegmentEllipsis.y = lastSegmentInline.y;
      }

      this.currentLine_[0].firstInLine = true;
      this.currentLine_[0].dy = dy;
    }
  }
  if (this.rtl && textSegmentEllipsis) {
    var firstLineSegment = this.currentLine_[0];

    textSegmentEllipsis.firstInLine = firstLineSegment.firstInLine;
    textSegmentEllipsis.x = firstLineSegment.x;
    textSegmentEllipsis.dy = firstLineSegment.dy;

    firstLineSegment.dy = 0;
    firstLineSegment.x = 0;
    firstLineSegment.firstInLine = false;

    goog.array.remove(this.segments_, textSegmentEllipsis);
    index = goog.array.indexOf(this.segments_, firstLineSegment);
    goog.array.insertAt(this.segments_, textSegmentEllipsis, index);
  }
};


/**
 * Added break line.
 */
acgraph.vector.Text.prototype.addBreak = function() {
  // if (this.currentLineEmpty_) {
  //   this.addSegment('', null, true);
  // }
  this.finalizeTextLine();

  this.currentNumberSeqBreaks_++;

  this.addSegment('', null, true);

  var height = this.currentLine_[0] ? this.currentLine_[0].height : 0;
  this.accumulatedHeight_ += goog.isString(this.lineHeight_) ?
      parseInt(this.lineHeight_, 0) + height :
      this.lineHeight_ * height;
};


/**
 * Adding text segment. Only here text wrapping is check.
 * @param {string} text Segment text without tags and EOLs.
 * @param {?acgraph.vector.TextSegmentStyle=} opt_style Segment style.
 * @param {boolean=} opt_break Whether is break.
 */
acgraph.vector.Text.prototype.addSegment = function(text, opt_style, opt_break) {
  // if "stop adding" segments flags is set - do nothing
  // this can happen if text has height, width and textOverflow set and and doesn't fit.
  if (this.stopAddSegments_) return;

  var style = opt_style || {};

  // measure the segment
  var segment_bounds = this.getTextBounds(text, style);

  // define segment offset, we need it to make textIndent for the first line.
  var shift = this.segments_.length == 0 ? this.textIndent_ : 0;

  // If text width and wordWrap are set - start putting a segement into the given bounds.
  if (this.isWidthSet) {
    // if a new segment, with all segment already in place and offsets, doesnt' fit:
    // cut characters.

    while ((this.currentLineWidth_ + segment_bounds.width + shift > this.textWidthLimit) && !this.stopAddSegments_) {
      // calculate the position where to cut.
      var cutPos = this.cutTextSegment_(text, style, shift + this.currentLineWidth_, this.textWidthLimit, segment_bounds);

      if (cutPos < 1 && (this.currentLine_.length == 0)) cutPos = 1;
      if (cutPos != 0) {
        var cutText = goog.string.trimLeft(text.substring(0, cutPos));
        segment_bounds = this.getTextBounds(cutText, style);
        this.createSegment_(cutText, style, segment_bounds);
      }

      this.finalizeTextLine();

      if (text.length == 1)
        this.stopAddSegments_ = true;

      shift = 0;

      text = goog.string.trimLeft(text.substring(cutPos, text.length));
      segment_bounds = this.getTextBounds(text, style);
    }
  }

  if (!this.stopAddSegments_ && (text.length || opt_break))
    this.createSegment_(text, style, segment_bounds);
};


/**
 * Finalizes text line.
 */
acgraph.vector.Text.prototype.finalizeTextLine = function() {
  // if there is a flag to stop adding segements - stop it.
  // this can happen if width, heigth and textOverflow are set and text doesn't fit.
  if (this.stopAddSegments_ || this.currentLine_.length == 0) return;

  var firstLine = this.textLines_.length == 0;

  // if textOverFlow (ellipsis) is set, height is set and integrated height + height of the line we finalize
  // is greater than height set - apply textOverflow.
  var endOfText = this.height_ &&
      (this.realHeight + this.currentLineHeight_ > this.height_) &&
      this.textLines_.length != 0;

  if (endOfText) {
    this.applyTextOverflow_();
    this.stopAddSegments_ = true;
  } else {
    // calculate line height.
    this.currentLineHeight_ = goog.isString(this.lineHeight_) ?
        parseInt(this.lineHeight_, 0) + this.currentLineHeight_ :
        this.lineHeight_ * this.currentLineHeight_;

    if (acgraph.getRenderer().needsAnotherBehaviourForCalcText()) {
      var shift, i, len, segment;
      var startPosition = (this.rtl && this.style_['hAlign'] == acgraph.vector.Text.HAlign.END) ||
          (!this.rtl && this.style_['hAlign'] == acgraph.vector.Text.HAlign.START) ||
          (this.style_['hAlign'] == acgraph.vector.Text.HAlign.LEFT);
      var endPosition = (this.rtl && this.style_['hAlign'] == acgraph.vector.Text.HAlign.START) ||
          (!this.rtl && this.style_['hAlign'] == acgraph.vector.Text.HAlign.END) ||
          (this.style_['hAlign'] == acgraph.vector.Text.HAlign.RIGHT);
      var middlePosition = this.style_['hAlign'] == acgraph.vector.Text.HAlign.CENTER;

      if (startPosition) {
        if (this.rtl)
          shift = 0;
        else
          shift = this.textIndent_ && firstLine ? this.textIndent_ : 0;
        for (i = 0, len = this.currentLine_.length; i < len; i++) {
          segment = this.currentLine_[i];
          segment.x = shift;
          segment.y = this.realHeight + this.currentBaseLine_ + segment.height - segment.baseLine * 1.5;
          shift += segment.width;
        }
      } else if (middlePosition) {
        shift = -this.currentLineWidth_ / 2;
        if (!this.rtl && this.textIndent_ && firstLine) shift += this.textIndent_;
        else if (this.rtl && this.textIndent_ && firstLine) shift -= 0;
        for (i = 0, len = this.currentLine_.length; i < len; i++) {
          segment = this.currentLine_[i];
          segment.x = shift + segment.width / 2;
          segment.y = this.realHeight + this.currentBaseLine_ + segment.height - segment.baseLine * 1.5;
          shift += segment.width;
        }
      } else if (endPosition) {
        if (this.rtl)
          shift = this.textIndent_ && firstLine ? -this.textIndent_ : 0;
        else
          shift = 0;
        for (i = this.currentLine_.length - 1; i >= 0; i--) {
          segment = this.currentLine_[i];
          segment.x = shift;
          segment.y = this.realHeight + this.currentBaseLine_ + segment.height - segment.baseLine * 1.5;
          shift -= segment.width;
        }
      }
    }

    var firstSegment;
    if (!firstLine) {
      // if it is not a first line - set dy and tell first segment
      // that it is the first in a line and starts a new line.
      for (var i = 0; i < this.currentLine_.length; i++) {
        if (this.currentLine_[i].text != '') {
          firstSegment = this.currentLine_[i];
          break;
        }
      }

      if (firstSegment) {
        firstSegment.firstInLine = true;
        if (!this.currentLineEmpty_) {
          if (this.accumulatedHeight_ && this.currentNumberSeqBreaks_ > 1) {
            firstSegment.dy = this.accumulatedHeight_;
          } else {
            firstSegment.dy = this.currentDy_ + this.currentBaseLine_;
          }
        }
      }
    } else {
      firstSegment = this.currentLine_[0];
      // in VML first line baseline is used to set Y for the text
      // baseLine of first segment is set as base line of the first line
      firstSegment.baseLine = this.currentBaseLine_;
      firstSegment.firstInLine = true;

      if (this.textIndent_ && this.style_['hAlign'] == acgraph.vector.Text.HAlign.CENTER) {
        firstSegment.dx = this.rtl ? -this.textIndent_ / 2 : this.textIndent_ / 2;
      }
    }

    if (this.isWidthSet && this.style_['wordWrap'] == acgraph.vector.Text.WordWrap.NORMAL &&
        this.currentLineWidth_ > this.textWidthLimit) {
      if (this.currentLine_.length > 1 && !this.currentLine_[0].text.length) {
        var index = goog.array.indexOf(this.segments_, this.currentLine_[0]);
        goog.array.removeAt(this.currentLine_, 0);
        goog.array.removeAt(this.segments_, index);
      }

      segment = goog.array.peek(this.currentLine_);
      var segment_bounds = this.getTextBounds(segment.text, segment.getStyle());

      var cutPos = this.cutTextSegment_(segment.text, segment.getStyle(), 0, this.textWidthLimit, segment_bounds, true);
      var cutText = segment.text.substring(0, cutPos);
      segment_bounds = this.getTextBounds(cutText, segment.getStyle());
      segment.text = cutText;
      segment.width = segment_bounds.width;

      this.currentLineWidth_ = segment_bounds.width;
      this.prevLineWidth_ = this.currentLineWidth_;

      this.applyTextOverflow_(this.currentLine_);
    }

    if (this.path()) {
      this.currentLine_[0].dx = this.align == 'start' ? 0 : this.align == 'middle' ?
          this.path().getLength() / 2 - this.currentLineWidth_ / 2 : this.path().getLength() - this.currentLineWidth_;
    }

    // calculate real width and height of the text.
    this.realHeight += this.currentLineHeight_;
    this.realWidth = Math.max(this.realWidth, this.currentLineWidth_);

    // set Dy, which will be applied to the next line.
    // it is equal to the height of the new line.
    this.currentDy_ = this.currentLineHeight_ - this.currentBaseLine_;

    // Save the width of the new line.
    // We need it to avoid calculating it when textOverflow is applied.
    this.prevLineWidth_ = this.currentLineWidth_;
    if (!this.currentLineEmpty_) {
      this.accumulatedHeight_ = 0;
      this.currentNumberSeqBreaks_ = 0;
    }
    // null variables and add line to the line array.
    this.currentLineEmpty_ = true;
    this.currentLineHeight_ = 0;
    this.currentLineWidth_ = 0;
    this.currentBaseLine_ = 0;
    this.textLines_.push(this.currentLine_);
    this.currentLine_ = [];
  }
};


/**
 * Calculate X coordinate.
 * @protected
 */
acgraph.vector.Text.prototype.calculateX = function() {
  this.calcX = this.x_;
  // adjust text position depenedin on hAlign anchor.
  if (this.style_['hAlign'] == acgraph.vector.Text.HAlign.START) this.calcX += this.rtl ? this.width_ : 0;
  else if (this.style_['hAlign'] == acgraph.vector.Text.HAlign.CENTER) this.calcX += this.width_ / 2;
  else if (this.style_['hAlign'] == acgraph.vector.Text.HAlign.END) this.calcX += this.rtl ? 0 : this.width_;
  else if (this.style_['hAlign'] == acgraph.vector.Text.HAlign.RIGHT) this.calcX += this.width_;
  //  else if (this.style_['hAlign'] == acgraph.vector.Text.HAlign.LEFT) this.calcX += 0;
};


/**
 * Calculate Y coordinate.
 * @protected
 */
acgraph.vector.Text.prototype.calculateY = function() {
  if (this.path()) {
    if (this.style_['vAlign']) {
      var firstSegment = this.segments_[0];
      if (this.style_['vAlign'] == acgraph.vector.Text.VAlign.MIDDLE)
        firstSegment.dy += firstSegment.baseLine - this.realHeight / 2;
      else if (this.style_['vAlign'] == acgraph.vector.Text.VAlign.BOTTOM)
        firstSegment.dy += firstSegment.baseLine - this.realHeight;
      else if (this.style_['vAlign'] == acgraph.vector.Text.VAlign.TOP)
        firstSegment.dy += firstSegment.baseLine;
    }
  } else {
    this.calcY = this.y_ + (this.segments_.length == 0 ? 0 : this.segments_[0].baseLine);
    // adjust text position depenedin on hAlign anchor.
    if (this.style_['vAlign'] && this.realHeight < this.style_['height']) {
      if (this.style_['vAlign'] == acgraph.vector.Text.VAlign.MIDDLE) this.calcY += this.height_ / 2 - this.realHeight / 2;
      else if (this.style_['vAlign'] == acgraph.vector.Text.VAlign.BOTTOM) this.calcY += this.height_ - this.realHeight;
    }
  }
};


/**
 * Parsing text to segments and lines. Defining final bound of the text.
 */
acgraph.vector.Text.prototype.textDefragmentation = function() {
  this.init_();

  var text, i, segment;
  if (this.text_ == null) return;

  if (this.htmlOn_) {
    acgraph.utils.HTMLParser.getInstance().parseText(this);
  } else {
    var q = /\n/g;
    this.text_ = goog.string.canonicalizeNewlines(goog.string.normalizeSpaces(this.text_));
    var textArr = this.text_.split(q);

    if (textArr.length == 1 && !goog.isDef(this.style_['width']) && !this.path()) {
      if (!this.domElement()) {
        this.createDom(true);
      }
      if (this.hasDirtyState(acgraph.vector.Element.DirtyState.STYLE))
        this.renderStyle();

      segment = new acgraph.vector.TextSegment(this.text_, {});
      this.currentLine_.push(segment);
      this.segments_.push(segment);
      segment.parent(this);

      if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA))
        this.renderData();

      var bounds = acgraph.getRenderer().getBBox(this.domElement(), this.text_, this.style_);

      segment.baseLine = -bounds.top;
      segment.height = bounds.height;
      segment.width = bounds.width;

      // calculate line params with newly added segment.
      this.currentLineHeight_ = bounds.height;
      this.currentLineWidth_ = bounds.width + this.textIndent_;
      this.currentBaseLine_ = segment.baseLine;
      this.currentLineEmpty_ = this.text_.length == 0;

      this.finalizeTextLine();
      this.currentNumberSeqBreaks_++;
      var height = this.currentLine_[0] ? this.currentLine_[0].height : 0;
      this.accumulatedHeight_ += goog.isString(this.lineHeight_) ?
          parseInt(this.lineHeight_, 0) + height :
          this.lineHeight_ * height;

    } else {
      for (i = 0; i < textArr.length; i++) {
        text = goog.string.trimLeft(textArr[i]);
        if (goog.isDefAndNotNull(text)) {
          if (text == '') {
            this.addBreak();
          } else {
            this.addSegment(text);
            this.addBreak();
          }
        }
      }
    }
  }

  if (this.textIndent_ && this.textLines_.length > 0) {
    var line = this.textLines_[0];
    segment = line[0];
    if (this.rtl) {
      if (!this.style_['hAlign'] ||
          this.style_['hAlign'] == acgraph.vector.Text.HAlign.START ||
          this.style_['hAlign'] == acgraph.vector.Text.HAlign.RIGHT)
        segment.dx -= this.textIndent_;
    } else {
      if (!this.style_['hAlign'] ||
          this.style_['hAlign'] == acgraph.vector.Text.HAlign.START ||
          this.style_['hAlign'] == acgraph.vector.Text.HAlign.LEFT)
        segment.dx += this.textIndent_;
    }
  }

  // set text width and height. they are either set or calculated.
  if (!this.style_['width']) this.width_ = this.realWidth;
  if (!this.style_['height']) this.height_ = this.realHeight;

  this.calculateX();
  this.calculateY();

  // text bounds.
  this.bounds = new goog.math.Rect(this.x_, this.y_, this.width_, this.height_);
  this.defragmented = true;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Text.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createTextElement();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Text.prototype.renderInternal = function() {
  // if data is unsynced - update it
  if (!this.defragmented) this.textDefragmentation();

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN))
    this.renderTextPath();

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.STYLE))
    this.renderStyle();

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA))
    this.renderData();

  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.POSITION))
    this.renderPosition();

  goog.base(this, 'renderInternal');
};


/**
 * Render text path.
 */
acgraph.vector.Text.prototype.renderTextPath = function() {
  if (this.path_ && !this.textPath) {
    this.textPath = acgraph.getRenderer().createTextPathElement();
  } else if (!this.path_) {
    goog.dom.removeNode(this.textPath);
    this.textPath = null;
  }
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
};


/**
 * Apply text properties to his DOM element
 */
acgraph.vector.Text.prototype.renderPosition = function() {
  for (var i = 0, len = this.segments_.length; i < len; i++) {
    this.segments_[i].setTextSegmentPosition();
  }
  acgraph.getRenderer().setTextPosition(this);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.POSITION);
};


/**
 * Apply text properties to his DOM element
 */
acgraph.vector.Text.prototype.renderStyle = function() {
  // Apply data to DOM element
  acgraph.getRenderer().setTextProperties(this);
  // Set unsync data flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.STYLE);
};


/**
 * Text segments rendering.
 */
acgraph.vector.Text.prototype.renderData = function() {
  if (this.domElement())
    goog.dom.removeChildren(this.domElement());

  if (this.textPath) {
    goog.dom.removeChildren(this.textPath);
    goog.dom.appendChild(this.domElement(), this.textPath);
  }

  for (var i = 0, len = this.segments_.length; i < len; i++) {
    this.segments_[i].renderData();
  }
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


/** @inheritDoc */
acgraph.vector.Text.prototype.renderTransformation = function() {
  // Resolve transformation unsync
  acgraph.getRenderer().setTextTransformation(this);

  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Text.prototype.deserialize = function(data) {
  this.x(data['x']).y(data['y']).style(data['style']);
  data['html'] ? this.htmlText(data['text']) : this.text(data['text']);
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.Text.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');
  data['type'] = 'text';
  data['x'] = this.x();
  data['y'] = this.y();
  data['html'] = this.htmlOn_;
  data['text'] = this.text();
  data['style'] = this.style();
  return data;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Text.prototype.disposeInternal = function() {
  goog.disposeAll(this.segments_);
  delete this.segments_;
  delete this.textLines_;
  delete this.bounds;
  delete this.bounds;
  goog.base(this, 'disposeInternal');
};


//exports
(function() {
  var proto = acgraph.vector.Text.prototype;
  goog.exportSymbol('acgraph.vector.Text', acgraph.vector.Text);
  proto['text'] = proto.text;
  proto['style'] = proto.style;
  proto['htmlText'] = proto.htmlText;
  proto['x'] = proto.x;
  proto['y'] = proto.y;
  proto['fontSize'] = proto.fontSize;
  proto['color'] = proto.color;
  proto['fontFamily'] = proto.fontFamily;
  proto['direction'] = proto.direction;
  proto['fontStyle'] = proto.fontStyle;
  proto['fontVariant'] = proto.fontVariant;
  proto['fontWeight'] = proto.fontWeight;
  proto['letterSpacing'] = proto.letterSpacing;
  proto['decoration'] = proto.decoration;
  proto['opacity'] = proto.opacity;
  proto['lineHeight'] = proto.lineHeight;
  proto['textIndent'] = proto.textIndent;
  proto['vAlign'] = proto.vAlign;
  proto['hAlign'] = proto.hAlign;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['getTextHeight'] = proto.getTextHeight;
  proto['getTextWidth'] = proto.getTextWidth;
  proto['wordWrap'] = proto.wordWrap;
  proto['wordBreak'] = proto.wordBreak;
  proto['textOverflow'] = proto.textOverflow;
  proto['selectable'] = proto.selectable;
})();
