goog.provide('acgraph.utils.HTMLParser');

goog.require('goog.object');



/**
 * HTML parser.
 * @constructor
 */
acgraph.utils.HTMLParser = function() {
};
goog.addSingletonGetter(acgraph.utils.HTMLParser);


//----------------------------------------------------------------------------------------------------------------------
//
//  Enums
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * The set of states of deterministic finite automaton (DFA).
 * @enum {number}
 */
acgraph.utils.HTMLParser.State = {
  /**
   * A start state. Characterized by the fact that DFA just reads a text segment and decides what state to take.
   */
  READ_TEXT: 1,

  /**
   * The state of reading a tag.
   */
  READ_TAG: 2,

  /**
   * The state of reading a closing tag.
   */
  READ_CLOSE_TAG: 3,

  /**
   * The state of reading a tag attributes.
   */
  READ_ATTRIBUTES: 4,

  /**
   * The state of the space-symbol has been found while reading an attribute.
   */
  ATTR_SPACE: 5,

  /**
   * The state of expectation of single or double quote.
   */
  EXPECTING_QUOTE: 6,

  /**
   * The state of simulation of reading a contents of the quotes.
   * Under the current task: reading of attributes that differ of "style".
   */
  READ_EMPTY_QUOTES: 7,

  /**
   * The state while expecting a quote but not going to read a contents of the quotes.
   * This state precedes a READ_EMPTY_QUOTES state.
   */
  EXPECTING_EMPTY_QUOTE: 8,

  /**
   * The state of reading a contents of the quotes.
   */
  READ_QUOTES: 9,

  /**
   * The state of reading an attribute when quotes are absent.
   *
   * Sample1: <span style=font-weight:bold>Some text</span>
   * Text must be bold.
   *
   * Sample2: <span style=font-weight:bold;font-style:italic>Some text</span>
   * Text must be bold and italic.
   *
   * Sample3: <span style=font-weight:bold; font-style:italic>Some text</span>
   * Text must be only bold because of space in style without quotes.
   */
  READ_MISSING_QUOTES: 10,

  /**
   * The state of simulation of reading an attribute when quotes are absent (see READ_MISSING_QUOTES)
   */
  READ_MISSING_EMPTY_QUOTES: 11,

  /**
   * The state of reading a style value ('bold' for 'font-weight:bold').
   */
  READ_QUOTES_VALUE: 12,

  /**
   * The state of reading a style value when quotes are missing.
   */
  READ_MISSING_QUOTES_VALUE: 13,

  /**
   * The state of reading a html entity (like &nbsp; or &#160;)
   * NOTE:
   *  - String like '&nbsp;' is a space.
   *  - String like '&nbsp' is a space as well.
   *  - String like '&nbspQ' must be interpreted like ' Q'.
   *  - String like '&#160;' is a space.
   *  - String like '&#160' is also a space.
   *  - String like '$unknown;' is just a string '&unknown;'
   *  - String like '&#919191911919' is unknown symbol as is.
   */
  READ_ENTITY: 14
};


/**
 * Map of named entities and their codes.
 * Entities are taken from here: http://stackoverflow.com/questions/1354064/how-to-convert-characters-to-html-entities-using-plain-javascript
 * @enum {number}
 */
acgraph.utils.HTMLParser.NamedEntities = {
  'quot': 34,
  'amp': 38,
  'apos': 39,
  'lt': 60,
  'gt': 62,
  'nbsp': 160,
  'iexcl': 161,
  'cent': 162,
  'pound': 163,
  'curren': 164,
  'yen': 165,
  'brvbar': 166,
  'sect': 167,
  'uml': 168,
  'copy': 169,
  'ordf': 170,
  'laquo': 171,
  'not': 172,
  'shy': 173,
  'reg': 174,
  'macr': 175,
  'deg': 176,
  'plusmn': 177,
  'sup2': 178,
  'sup3': 179,
  'acute': 180,
  'micro': 181,
  'para': 182,
  'middot': 183,
  'cedil': 184,
  'sup1': 185,
  'ordm': 186,
  'raquo': 187,
  'frac14': 188,
  'frac12': 189,
  'frac34': 190,
  'iquest': 191,
  'Agrave': 192,
  'Aacute': 193,
  'Acirc': 194,
  'Atilde': 195,
  'Auml': 196,
  'Aring': 197,
  'AElig': 198,
  'Ccedil': 199,
  'Egrave': 200,
  'Eacute': 201,
  'Ecirc': 202,
  'Euml': 203,
  'Igrave': 204,
  'Iacute': 205,
  'Icirc': 206,
  'Iuml': 207,
  'ETH': 208,
  'Ntilde': 209,
  'Ograve': 210,
  'Oacute': 211,
  'Ocirc': 212,
  'Otilde': 213,
  'Ouml': 214,
  'times': 215,
  'Oslash': 216,
  'Ugrave': 217,
  'Uacute': 218,
  'Ucirc': 219,
  'Uuml': 220,
  'Yacute': 221,
  'THORN': 222,
  'szlig': 223,
  'agrave': 224,
  'aacute': 225,
  'acirc': 226,
  'atilde': 227,
  'auml': 228,
  'aring': 229,
  'aelig': 230,
  'ccedil': 231,
  'egrave': 232,
  'eacute': 233,
  'ecirc': 234,
  'euml': 235,
  'igrave': 236,
  'iacute': 237,
  'icirc': 238,
  'iuml': 239,
  'eth': 240,
  'ntilde': 241,
  'ograve': 242,
  'oacute': 243,
  'ocirc': 244,
  'otilde': 245,
  'ouml': 246,
  'divide': 247,
  'oslash': 248,
  'ugrave': 249,
  'uacute': 250,
  'ucirc': 251,
  'uuml': 252,
  'yacute': 253,
  'thorn': 254,
  'yuml': 255,
  'OElig': 338,
  'oelig': 339,
  'Scaron': 352,
  'scaron': 353,
  'Yuml': 376,
  'fnof': 402,
  'circ': 710,
  'tilde': 732,
  'Alpha': 913,
  'Beta': 914,
  'Gamma': 915,
  'Delta': 916,
  'Epsilon': 917,
  'Zeta': 918,
  'Eta': 919,
  'Theta': 920,
  'Iota': 921,
  'Kappa': 922,
  'Lambda': 923,
  'Mu': 924,
  'Nu': 925,
  'Xi': 926,
  'Omicron': 927,
  'Pi': 928,
  'Rho': 929,
  'Sigma': 931,
  'Tau': 932,
  'Upsilon': 933,
  'Phi': 934,
  'Chi': 935,
  'Psi': 936,
  'Omega': 937,
  'alpha': 945,
  'beta': 946,
  'gamma': 947,
  'delta': 948,
  'epsilon': 949,
  'zeta': 950,
  'eta': 951,
  'theta': 952,
  'iota': 953,
  'kappa': 954,
  'lambda': 955,
  'mu': 956,
  'nu': 957,
  'xi': 958,
  'omicron': 959,
  'pi': 960,
  'rho': 961,
  'sigmaf': 962,
  'sigma': 963,
  'tau': 964,
  'upsilon': 965,
  'phi': 966,
  'chi': 967,
  'psi': 968,
  'omega': 969,
  'thetasym': 977,
  'upsih': 978,
  'piv': 982,
  'ensp': 8194,
  'emsp': 8195,
  'thinsp': 8201,
  'zwnj': 8204,
  'zwj': 8205,
  'lrm': 8206,
  'rlm': 8207,
  'ndash': 8211,
  'mdash': 8212,
  'lsquo': 8216,
  'rsquo': 8217,
  'sbquo': 8218,
  'ldquo': 8220,
  'rdquo': 8221,
  'bdquo': 8222,
  'dagger': 8224,
  'Dagger': 8225,
  'bull': 8226,
  'hellip': 8230,
  'permil': 8240,
  'prime': 8242,
  'Prime': 8243,
  'lsaquo': 8249,
  'rsaquo': 8250,
  'oline': 8254,
  'frasl': 8260,
  'euro': 8364,
  'image': 8465,
  'weierp': 8472,
  'real': 8476,
  'trade': 8482,
  'alefsym': 8501,
  'larr': 8592,
  'uarr': 8593,
  'rarr': 8594,
  'darr': 8595,
  'harr': 8596,
  'crarr': 8629,
  'lArr': 8656,
  'uArr': 8657,
  'rArr': 8658,
  'dArr': 8659,
  'hArr': 8660,
  'forall': 8704,
  'part': 8706,
  'exist': 8707,
  'empty': 8709,
  'nabla': 8711,
  'isin': 8712,
  'notin': 8713,
  'ni': 8715,
  'prod': 8719,
  'sum': 8721,
  'minus': 8722,
  'lowast': 8727,
  'radic': 8730,
  'prop': 8733,
  'infin': 8734,
  'ang': 8736,
  'and': 8743,
  'or': 8744,
  'cap': 8745,
  'cup': 8746,
  'int': 8747,
  'there4': 8756,
  'sim': 8764,
  'cong': 8773,
  'asymp': 8776,
  'ne': 8800,
  'equiv': 8801,
  'le': 8804,
  'ge': 8805,
  'sub': 8834,
  'sup': 8835,
  'nsub': 8836,
  'sube': 8838,
  'supe': 8839,
  'oplus': 8853,
  'otimes': 8855,
  'perp': 8869,
  'sdot': 8901,
  'lceil': 8968,
  'rceil': 8969,
  'lfloor': 8970,
  'rfloor': 8971,
  'lang': 9001,
  'rang': 9002,
  'loz': 9674,
  'spades': 9824,
  'clubs': 9827,
  'hearts': 9829,
  'diams': 9830
};


/**
 * Instance of Text.
 * @type {acgraph.vector.Text}
 */
acgraph.utils.HTMLParser.prototype.textElement = null;


//----------------------------------------------------------------------------------------------------------------------
//
//  Methods
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Initializes values for fields.
 * @private
 */
acgraph.utils.HTMLParser.prototype.init_ = function() {
  /** @type {Array.<?acgraph.vector.TextSegmentStyle>} */
  this.styleStack = [];

  /** @type {Array.<string>} */
  this.tagNameStack = [];

  /** @type {string} */
  this.tagName = '';

  /** @type {string} */
  this.closeTagName = '';

  /** @type {string} */
  this.attrName = '';

  /** @type {string} */
  this.quoteSymbol = '\'';

  /** @type {string} */
  this.styleKey = '';

  /** @type {string} */
  this.styleValue = '';

  /** @type {string} */
  this.segmentText = '';

  /** @type {?acgraph.vector.TextSegmentStyle} */
  this.style = null;

  this.textElement = null;

  /** @type {acgraph.utils.HTMLParser.State} */
  this.state = acgraph.utils.HTMLParser.State.READ_TEXT;

  /** @type {boolean} */
  this.haveSpace = false;

  /** @type {string} */
  this.entity = '';

  /** @type {boolean} */
  this.isNamedEntity = true;

  /**
   * For html entities purposes: if semicolon must be interpreted as part of entity.
   * @type {boolean}
   */
  this.ignoreSemicolon = false;

};


/**
 * Used in addStyleData_() and in addTagStyleData_() for style initialization: if style is null but we're trying to
 * create it with unacceptable value (something like <span style="qwer: asdf">) then style will not be created.
 * We can't have not null but empty object.
 * @private
 */
acgraph.utils.HTMLParser.prototype.prepareStyle_ = function() {
  if (!this.style) { //If style is null then we try to clone it from previous style from stack. If stack is empty - create new style object.
    this.style = /** @type {acgraph.vector.TextSegmentStyle} */ (this.styleStack.length ?
        goog.object.clone(this.styleStack[this.styleStack.length - 1]) : {});
  }
};


/**
 * Adds or updates a style data based on a tag into a current style (case when the tag means a style itself: <b>, <i>, etc).
 * Ignores unacceptable values.
 * @param {string} key Tag name.
 * @private
 */
acgraph.utils.HTMLParser.prototype.addTagStyleData_ = function(key) {
  switch (key) {
    case 'b':
    case 'strong':
      this.prepareStyle_();
      this.style.fontWeight = 'bold';
      break;

    case 'i':
    case 'em':
      this.prepareStyle_();
      this.style.fontStyle = 'italic';
      break;
  }
};


/**
 * Adds or updates a style data based on a 'style' attribute into a current style (style='text-weight:bold').
 * Ignores unacceptable values.
 * The default values are taken from here: <a href='http://htmlbook.ru/css/'>http://htmlbook.ru/css/</a>
 * @param {string} key Style key.
 * @param {(string|number)=} opt_value The value that should be set up to the style by the key.
 * @private
 */
acgraph.utils.HTMLParser.prototype.addStyleData_ = function(key, opt_value) {
  switch (key) {
    case 'font-style':
      this.prepareStyle_();
      this.style.fontStyle = /** @type {string} */ (opt_value || 'normal');
      break;

    case 'font-variant':
      this.prepareStyle_();
      this.style.fontVariant = /** @type {string} */ (opt_value || 'normal');
      break;

    case 'font-family':
      this.prepareStyle_();
      this.style.fontFamily = /** @type {string} */ (opt_value || goog.global['acgraph']['fontFamily']);
      break;

    case 'font-size':
      this.prepareStyle_();
      this.style.fontSize = /** @type {string|number} */ (opt_value || goog.global['acgraph']['fontSize']);
      break;

    case 'font-weight':
      this.prepareStyle_();
      this.style.fontWeight = /** @type {string|number} */ (opt_value || 'normal');
      break;

    case 'color':
      this.prepareStyle_();
      this.style.color = /** @type {string} */ (opt_value || goog.global['acgraph']['color']);
      break;

    case 'letter-spacing':
      this.prepareStyle_();
      this.style.letterSpacing = /** @type {string} */ (opt_value || 'normal');
      break;

    case 'text-decoration':
      this.prepareStyle_();
      this.style.decoration = /** @type {string} */ (opt_value || 'none');
      break;

    case 'opacity':
      this.prepareStyle_();
      this.style.opacity = /** @type {number} */ ((goog.isDefAndNotNull(opt_value)) ? parseFloat(opt_value) : 1);
      break;
  }
};


/**
 * Gets the text and correct style for it and calls addSegment(). Resets values when it ends.
 * @private
 */
acgraph.utils.HTMLParser.prototype.doSegment_ = function() {
  if (this.segmentText != '') {
    var st = this.styleStack.length ? this.styleStack[this.styleStack.length - 1] : null;
    this.textElement.addSegment(this.segmentText, st);
    this.segmentText = '';
    this.haveSpace = false;
  }
};


/**
 * Handles the closing of the closing tag.
 * @private
 */
acgraph.utils.HTMLParser.prototype.closeTag_ = function() {
  var tag = this.tagNameStack.length ? this.tagNameStack[this.tagNameStack.length - 1] : null;
  if (this.closeTagName == tag) {
    this.doSegment_();
    this.styleStack.pop();
    this.tagNameStack.pop();
    this.tagName = '';
  }

  this.closeTagName = '';
  this.state = acgraph.utils.HTMLParser.State.READ_TEXT;
};


/**
 * Fills the style stack at the close of an opening tag.
 * @param {acgraph.utils.HTMLParser.State} nextState Next state that DFA should take after the tag finalization.
 * @param {boolean=} opt_resetAttrName Flag that indicates whether an attrName should be reset.
 * @private
 */
acgraph.utils.HTMLParser.prototype.finalizeTagStyle_ = function(nextState, opt_resetAttrName) {
  this.addTagStyleData_(this.tagName);
  this.tagNameStack.push(this.tagName);
  this.styleStack.push(this.style);

  if (opt_resetAttrName) this.attrName = '';
  this.tagName = '';
  this.style = null;
  this.state = nextState;
};


/**
 * Completes reading and applying of the style.
 * @param {acgraph.utils.HTMLParser.State} nextState Next state that DFA should take after the style is applied.
 * @param {boolean=} opt_resetAttrName Flag that indicates whether an attrName should be reset.
 * @private
 */
acgraph.utils.HTMLParser.prototype.finalizeStyle_ = function(nextState, opt_resetAttrName) {
  this.addStyleData_(this.styleKey, this.styleValue || '');
  this.styleKey = '';
  this.styleValue = '';

  if (opt_resetAttrName) this.attrName = '';
  this.state = nextState;
};


/**
 * The mixture of finalizeTagStyle_() and finalizeStyle_() without excess actions.
 * Used in case of immediate completion of reading of the tag.
 * @param {acgraph.utils.HTMLParser.State} nextState Next state that DFA should take after the style is applied.
 * @private
 */
acgraph.utils.HTMLParser.prototype.finalizeStyleAndTag_ = function(nextState) {
  this.addTagStyleData_(this.tagName);
  this.addStyleData_(this.styleKey, this.styleValue || '');

  this.tagNameStack.push(this.tagName);
  this.styleStack.push(this.style);

  this.tagName = '';
  this.style = null;
  this.attrName = '';
  this.styleKey = '';
  this.styleValue = '';

  this.state = nextState;
};


/**
 * Finalizes entity.
 * @param {acgraph.utils.HTMLParser.State} nextState - Next state that DFA should take after the style is applied.
 * @param {string} lastSymbol - Last symbol to be added.
 * @private
 */
acgraph.utils.HTMLParser.prototype.finalizeEntity_ = function(nextState, lastSymbol) {
  var code;
  if (this.isNamedEntity) {
    var entityCode = acgraph.utils.HTMLParser.NamedEntities[this.entity];
    if (goog.isDef(entityCode)) {
      code = entityCode;
    } else {
      this.segmentText += '&' + this.entity + lastSymbol;
    }
  } else {
    if (this.entity) {
      code = parseInt(this.entity, 10);
    } else {
      this.segmentText += '&#' + lastSymbol;
    }
  }

  lastSymbol = (lastSymbol == ';' ? '' : lastSymbol);
  if (code) this.segmentText += (String.fromCharCode(code) + lastSymbol);
  this.state = nextState;
  this.entity = '';
  this.isNamedEntity = true;
};


//TODO (A. Kudryavtsev) 1) Anton S. said that string += char is resource-demanding operation. It should be replaced and optimized.
//TODO (A. Kudryavtsev) 2) But it seems that http://jsperf.com/array-join-vs-string-connect and http://jsperf.com/join-concat/2 suggest the opposite.
//TODO (A. Kudryavtsev) 3) The description of the metod should be improved.
/**
 * Parses a given string, assuming that it is HTML. Breaks the tree-like structure of HTML into a linear
 * sequence of segments – pieces of original text with the same style.
 * Then each piece with the associated style is passed to the acgraph.utils.HTMLParser.addSegment() method.
 * More about styles and text: {@see https://anychart.atlassian.net/wiki/pages/viewpage.action?pageId=360497}.
 * Supported tags: {@see https://anychart.atlassian.net/wiki/pages/viewpage.action?pageId=360563}.
 * The styles available in the “style” attribute of the “span” node correspond with the fields of the acgraph.utils.Text.TextSegmentStyle type.
 * As a matter of fact, all possible stylization of a segment are also taken from fields of this type.
 *
 * The parser should tolerate tag mistakes: for example, the string
 *
 * " 1 <b> 2 <b> 3 <i> 4 </b> 5 </i> 6 "
 *
 * should be interpreted in the same way as the string
 *
 * " 1 <b> 2 <b> 3 <i> 4  5 </i> 6 </b></b>"
 *
 * and the following segments should be returned:
 *
 * 1) " 1 " – empty style
 * 2) " 2 " – bold
 * 3) " 3 " – bold
 * 4) " 4  5 " – bold, italic
 * 5) " 6 " – bold
 *
 * A few delicate moments:
 * 1) Merging segments #2 and #3 because they have the same style is even better, but not necessary.
 * 2) Space normalization like in HTML: for the time being let us accept that we do not normalize unprintable symbols,
 *     so there are two spaces in the segment #5. Normalizing everything is the best option, but all this stuff has quite
 *     a strict logic.
 *
 * @param {acgraph.vector.Text} textElem HTML string to be parsed.
 */
acgraph.utils.HTMLParser.prototype.parseText = function(textElem) {
  this.init_();

  this.textElement = textElem;
  var text = textElem.text();
  var l = text.length, i = -1;
  var s = acgraph.utils.HTMLParser.State;
  var symbol;

  var isSpace = false;
  var isNotLetter = false;

  /**
   * Flag that indicates that all content of the tag will be ignored.
   * @type {boolean}
   */
  var ignoreUntilClose = false;

  /**
   * Starting a symbol-by-symbol passage for incoming string.
   */
  while (++i < l) {
    symbol = text.charAt(i);

    /** Correct test for if the symbol is space.*/
    isSpace = /\xa0|\s/.test(symbol);

    /** If the current symbol is the letter of the Latin alphabet.*/
    isNotLetter = /[^a-zA-Z]/.test(symbol);

    switch (this.state) {

      // Start state.
      case s.READ_TEXT:
        if (symbol == '<') {
          this.state = s.READ_TAG;
          break;
        }

        if (this.haveSpace && isSpace) break;

        if (symbol == '&') {
          this.state = s.READ_ENTITY;
          break;
        }

        if (this.ignoreSemicolon) {
          this.ignoreSemicolon = false;
          if (symbol == ';') break;
        }

        this.segmentText += symbol;
        this.haveSpace = isSpace;
        break;


      //Reading html entity.
      case s.READ_ENTITY:

        if (this.isNamedEntity && !this.entity && symbol == '#') { //This construction allows to set namedEntity-flag only once.
          this.isNamedEntity = false;
          break;
        }

        if (symbol == '&') {//Got construction like '&....&'. Just start reading anew.
          this.finalizeEntity_(s.READ_ENTITY, '');
          break;
        }

        var isNotLetterOrDigit = /(_|\W)/.test(symbol); //Whether current symbol is not letter and not digit.
        if (isNotLetterOrDigit) {
          var openTag = symbol == '<';
          var nextState = openTag ? s.READ_TAG : s.READ_TEXT;
          this.finalizeEntity_(nextState, openTag ? '' : symbol);
          break;
        }

        var isDigit = /\d/.test(symbol); //If symbol is digit.
        if (!this.isNamedEntity && !isDigit) {//Got a letter while reading a '&#nnn'-entity. Here it can't be something except the letter.
          this.finalizeEntity_(s.READ_TEXT, symbol);
          break;
        }

        this.entity += symbol;

        //This allows to process '&nbspq' correctly.
        if (acgraph.utils.HTMLParser.NamedEntities[this.entity]) {
          this.ignoreSemicolon = true;
          this.finalizeEntity_(s.READ_TEXT, '');
        }

        break;


      //State of reading the tag.
      case s.READ_TAG:

        if (ignoreUntilClose) {
          if (symbol != '>') break;
          if (this.tagName == 'br')
            this.textElement.addBreak();
          this.tagName = '';
          ignoreUntilClose = false;
          this.state = s.READ_TEXT;
          break;
        }

        if (!this.tagName && symbol == '<') { //Got the string looking like '<<' - we send the first angle bracket to the segmentText.
          //Also we take as the fact that the second angle bracket is the beginning of new tag (state doesn't change).
          this.segmentText += '<';
          break;
        }

        if (!this.tagName && isNotLetter && symbol != '/') { //Got the string like '<%' - non-letter symbol after an angle bracket.
          //We take as a fact that the tag is not opened - it's just a string looking like 'st1 <% st2', where '%' is any non-letter symbol and not '/'.
          this.segmentText += ('<' + symbol);
          this.state = s.READ_TEXT;
          break;
        }

        if (!this.tagName && symbol == '/') {  //If got string looking like '</' - the beginning of closing tag.
          this.state = s.READ_CLOSE_TAG;
          break;
        }

        if (this.tagName == 'br' && symbol == '>') { //If we've got '<br>'.
          this.textElement.addBreak();
          this.tagName = '';
          this.state = s.READ_TEXT;
          break;
        }

        if (this.tagName == 'br' && (symbol == '/' || isSpace)) { //If we've got '<br/' or '<br '.
          ignoreUntilClose = true;
          break;
        }

        if (this.tagName) {
          this.doSegment_();
        }

        if (!!this.tagName && isSpace) { //String looking like '<tag '. Preparing to read an attributes.
          this.state = s.READ_ATTRIBUTES;
          break;
        }

        if (symbol == '>') {//The end of opening tag.
          this.finalizeTagStyle_(s.READ_TEXT);
          break;
        }

        this.tagName += symbol.toLowerCase();
        break;


      //State of reading the closing tag ('</tag>').
      case s.READ_CLOSE_TAG:
        if (ignoreUntilClose) {
          if (symbol != '>') break;

          this.closeTag_();
          ignoreUntilClose = false;
          break;
        }

        if (!this.closeTagName && isNotLetter) { //Got the string like '</%' - non-letter symbol after the closing tag was opened.
          //Taking as a fact that we have just a string looking like 'st1 </% st2'.
          this.segmentText += '</' + symbol;
          this.state = s.READ_TEXT;
          break;
        }

        if (!!this.closeTagName && isSpace) {//Got the string looking like '</tag '.
          //Since that here can be written anything. We're just waiting for a closing angle bracket.
          ignoreUntilClose = true;
          break;
        }

        if (symbol == '>') {
          this.closeTag_();
          ignoreUntilClose = false;
          break;
        }

        this.closeTagName += symbol.toLowerCase();
        break;


      //The state of reading an attributes.
      case s.READ_ATTRIBUTES:
        if (ignoreUntilClose) {
          if (symbol != '>') break;
          this.finalizeTagStyle_(s.READ_TEXT, true);
          ignoreUntilClose = false;
          break;
        }

        if (symbol == '>') { //Tag is over - starting to read the text.
          this.finalizeTagStyle_(s.READ_TEXT, true);
          break;
        }

        if (isSpace) {
          this.state = s.ATTR_SPACE;
          break;
        }

        if (symbol == '=') {
          if (this.attrName)
            this.state = this.attrName == 'style' ? s.EXPECTING_QUOTE : s.EXPECTING_EMPTY_QUOTE;
          break;
        }

        this.attrName += symbol.toLowerCase();
        break;


      //The state when we've found a space while reading an attributes.
      case s.ATTR_SPACE:
        if (symbol == '>') { //Tag is over - starting to read the text.
          this.finalizeTagStyle_(s.READ_TEXT, true);
          break;
        }

        if (isSpace) break; //Ignoring additional spaces.

        if (!!this.attrName && !isNotLetter) { //String like '<tag attr b' , i.e. attr presents, space presents but letter-symbol is found.
          this.attrName = symbol;
          this.state = s.READ_ATTRIBUTES;
          break;
        }

        if (symbol == '=') {
          if (this.attrName)
            this.state = this.attrName == 'style' ? s.EXPECTING_QUOTE : s.EXPECTING_EMPTY_QUOTE;
          break;
        }

        this.attrName += symbol;
        this.state = s.READ_ATTRIBUTES;
        break;


      //The state of expectation of the quote. All quotes' content would be read.
      case s.EXPECTING_QUOTE:
        if (isSpace) break; //Ignoring spaces.

        if (symbol == '>') { //Tag is over, reading the text.
          this.finalizeTagStyle_(s.READ_TEXT, true);
          break;
        }

        if (symbol == '\'' || symbol == '"') { //Found an opening quote (single or double).
          this.quoteSymbol = symbol;
          this.state = s.READ_QUOTES;
          break;
        }

        //We didn't find a closing bracket, as well as quotes, but non-space symbol is found.
        this.styleKey = symbol; //We're waiting for quote. styleKey can be safely replaced with symbol.
        this.state = s.READ_MISSING_QUOTES;
        break;


      //The state of expectation of the quote. All quotes' content would be ignored.
      case s.EXPECTING_EMPTY_QUOTE:
        if (isSpace) break;

        if (symbol == '>') {
          this.attrName = '';
          this.tagName = '';
          this.state = s.READ_TEXT;
          break;
        }

        if (symbol == '\'' || symbol == '"') { //Found an opening quote (single or double).
          this.quoteSymbol = symbol;
          this.state = s.READ_EMPTY_QUOTES;
          break;
        }

        //We didn't find a closing bracket, as well as quotes, but non-space symbol is found.
        //We don't actually read. So we don't fucking care about losing a symbol.
        this.state = s.READ_MISSING_EMPTY_QUOTES;
        break;


      //The state of reading of quotes' content. Reading a key of style (Key for 'font-weight:bold' is 'font-weight').
      case s.READ_QUOTES:
        if (isSpace) break;

        if (symbol == this.quoteSymbol) { //Found a closing quote that corresponds to an opening one.
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }

        if (symbol == ':') {
          this.state = s.READ_QUOTES_VALUE;
          break;
        }

        this.styleKey += symbol.toLowerCase();
        break;


      //The state of reading of quotes' content. Reading a value of style (Value for 'font-weight:bold' is 'bold').
      case s.READ_QUOTES_VALUE:
        if (isSpace) break;

        if (symbol == this.quoteSymbol) { //Found a closing quote that corresponds to an opening one.
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }

        if (symbol == ';') {
          this.finalizeStyle_(s.READ_QUOTES);
          break;
        }

        this.styleValue += symbol.toLowerCase();
        break;


      //Quotes reading simulation.
      case s.READ_EMPTY_QUOTES:
        if (symbol == this.quoteSymbol) { //Found a closing quote that corresponds to an opening one.
          this.attrName = '';
          this.state = s.READ_ATTRIBUTES;
          break;
        }

        //That's all. We don't do anything more.
        break;


      //State of reading a style without quotes. Reading a key of style (Key for 'font-weight:bold' is 'font-weight').
      case s.READ_MISSING_QUOTES:
        if (isSpace) {
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }

        if (symbol == '>') {
          this.finalizeStyleAndTag_(s.READ_TEXT);
          break;
        }

        if (symbol == ':') {
          this.state = s.READ_MISSING_QUOTES_VALUE;
          break;
        }

        this.styleKey += symbol;
        break;


      //Attribute reading simulation.
      case s.READ_MISSING_EMPTY_QUOTES:
        if (isSpace) {
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }

        if (symbol == '>') {
          this.finalizeTagStyle_(s.READ_TEXT);
          break;
        }
        break;


      //State of reading a style without quotes. Reading a value of style (Value for 'font-weight:bold' is 'bold').
      case s.READ_MISSING_QUOTES_VALUE:
        if (isSpace) {
          ignoreUntilClose = true;
          this.finalizeStyle_(s.READ_ATTRIBUTES, true);
          break;
        }

        if (symbol == '>') {
          this.finalizeStyleAndTag_(s.READ_TEXT);
          break;
        }

        if (symbol == ';') {
          this.finalizeStyle_(s.READ_MISSING_QUOTES);
          break;
        }

        this.styleValue += symbol.toLowerCase();
        break;


      //Parsing error.
      default:
        throw 'Error while parsing HTML: Symbol \'' + symbol + '\', position: ' + (i - 1);

    }
  }

  this.doSegment_(); //Cleaning up the remaining texts and tags if not all tags are closed after the input line is over.
  this.textElement.finalizeTextLine(); //Parsing complete.
};

