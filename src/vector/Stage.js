goog.provide('acgraph.vector.Stage');

goog.require('acgraph.error');
goog.require('acgraph.events.BrowserEvent');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.utils.exporting');
goog.require('acgraph.vector.Circle');
goog.require('acgraph.vector.Clip');
goog.require('acgraph.vector.Defs');
goog.require('acgraph.vector.Ellipse');
goog.require('acgraph.vector.HatchFill');
goog.require('acgraph.vector.ILayer');
goog.require('acgraph.vector.Image');
goog.require('acgraph.vector.Layer');
goog.require('acgraph.vector.Path');
goog.require('acgraph.vector.PatternFill');
goog.require('acgraph.vector.Rect');
goog.require('acgraph.vector.Text');
goog.require('acgraph.vector.UnmanagedLayer');
goog.require('goog.Uri.QueryData');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.Listenable');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Map');
goog.require('goog.style');



/**
 This class provide tools for cross-browser display with the single interface for
 both (SVG and VML).
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.create}.
 <p><b>Note:</b><br>
 acgraph.vector.Stage delegates all work with DOM elements, style and attributes
 to its renderer. You can get renderer using <a href="acgraph.vector.Stage#.getRenderer">getRenderer
 </a> method.<br/>
 <strong>Note:</strong> Renderer is a singleton must not contain own fields.
 </p><p>
 <b>Rendering:</b><br/>
 acgraph.vector.Stage has the <code>rootLayer_</code> private field of <a href="acgraph.vector.Layer">Layer</a>
 type. All layers and elements you add to a stage go there, so rendering and other stuff happens
 when this layer is rendered.
 </p>
 @see acgraph.create
 @name acgraph.vector.Stage
 @param {(Element|string)=} opt_container Container. Can be set later.
 @param {(number|string)=} opt_width Stage width in pixels.
 @param {(number|string)=} opt_height Stage width in pixels.
 @constructor
 @extends {goog.events.EventTarget}
 @implements {acgraph.vector.ILayer}
 @implements {goog.events.Listenable}
 */
acgraph.vector.Stage = function(opt_container, opt_width, opt_height) {
  goog.base(this);

  this.renderAsync_ = goog.bind(this.renderAsync_, this);
  this.checkSize_ = goog.bind(this.checkSize_, this);

  /**
   * Event handler of the stage.
   * @type {goog.events.EventHandler}
   * @private
   */
  this.eventHandler_ = new goog.events.EventHandler(this);

  /**
   * Wrapper container DOM element.
   * @type {!Element}
   * @private
   */
  this.internalContainer_ = goog.dom.createDom(goog.dom.TagName.DIV, {style: 'position:relative;left:0;top:0;overflow:hidden;'});

  /**
   * Root DOM element of stage object.
   * Root DOM element of stage object can't be null, it is created
   * in constructor using #createDomElement method.
   * @type {Element}
   * @private
   */
  this.domElement_ = acgraph.getRenderer().createStageElement();
  acgraph.register(this);
  acgraph.getRenderer().setStageSize(this.domElement_, '100%', '100%');
  //We need set 'display: block' for <svg> element to prevent scrollbar on 100% height of parent container (see DVF-620)
  goog.style.setStyle(this.domElement_, 'display', 'block');
  // Add class for check anychart-ui.css attached. (DVF-1619)
  goog.dom.classlist.add(this.domElement_, 'anychart-ui-support');
  goog.dom.appendChild(this.internalContainer_, this.domElement_);

  /**
   * Array of clips that should be rendered when stage is rendering.
   * @type {Array.<acgraph.vector.Clip>}
   * @private
   */
  this.clipsToRender_ = [];

  /**
   * Container to store elements which can be reused by reference in other elements.
   * For SVG ({@link http://www.w3.org/TR/SVG/struct.html#DefsElement=|Defs})
   * For VML ({@link http://www.w3.org/TR/NOTE-VML#_Toc416858387|ShapeType})
   * @type {!acgraph.vector.Defs}
   * @private
   */
  this.defs_ = this.createDefs();
  this.defs_.createDom();
  acgraph.getRenderer().appendChild(this.domElement_, this.defs_.domElement());

  /**
   * Root layer for Stage. All layer and elements added to stage go in this layer.
   * So all rendering and other stuff happens here.
   * @type {!acgraph.vector.Layer}
   * @private
   */
  this.rootLayer_ = new acgraph.vector.Layer();
  this.rootLayer_.setParent(this).render();
  acgraph.getRenderer().appendChild(this.domElement_, this.rootLayer_.domElement());
  acgraph.getRenderer().createMeasurement();

  this.eventHandler_.listen(this.domElement(), [
    goog.events.EventType.MOUSEDOWN,
    goog.events.EventType.MOUSEOVER,
    goog.events.EventType.MOUSEOUT,
    goog.events.EventType.CLICK,
    goog.events.EventType.DBLCLICK,
    goog.events.EventType.TOUCHSTART,
    goog.events.EventType.TOUCHEND,
    goog.events.EventType.TOUCHCANCEL,
    goog.events.EventType.MSPOINTERDOWN,
    goog.events.EventType.MSPOINTERUP,
    goog.events.EventType.POINTERDOWN,
    goog.events.EventType.POINTERUP,
    goog.events.EventType.CONTEXTMENU
  ], this.handleMouseEvent_, false);

  this.setWidth_(opt_width || '100%');
  this.setHeight_(opt_height || '100%');
  this.container_ = goog.dom.getElement(opt_container || null);
  if (this.container_)
    this.updateContainer_();
  this.checkSize_(true, true);

  this.resume();
};
goog.inherits(acgraph.vector.Stage, goog.events.EventTarget);


//region --- Enums and consts
//----------------------------------------------------------------------------------------------------------------------
//
//  Enums and consts
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Errors.
 * @enum {string}
 */
acgraph.vector.Stage.Error = {
  CONTAINER_SHOULD_BE_DEFINED: 'Container to render stage should be defined',
  STAGE_SHOULD_HAVE_DOM_ELEMENT: 'Stage should have dom element',
  IN_RENDERING_PROCESS: 'Stage already in rendering process'
};


/**
 * DOM changes. Used for to assign quotas.
 * @enum {number}
 */
acgraph.vector.Stage.DomChangeType = {
  /**
   * Creating element
   */
  ELEMENT_CREATE: 1,
  /**
   * Adding child
   */
  ELEMENT_ADD: 2,
  /**
   * Removing child
   */
  ELEMENT_REMOVE: 3,
  /**
   * Apply fill
   */
  APPLY_FILL: 4,
  /**
   * Apply stroke
   */
  APPLY_STROKE: 5
};


/**
 * Stage events
 * @enum {string}
 */
acgraph.vector.Stage.EventType = {
  /** Rendering start */
  RENDER_START: 'renderstart',

  /** Rendering end */
  RENDER_FINISH: 'renderfinish',

  /** Fires when resize event occurs */
  STAGE_RESIZE: 'stageresize',

  /** Fires when image loader finished loading all images */
  STAGE_RENDERED: 'stagerendered'
};


/**
 * Export types.
 * @enum {string}
 */
acgraph.vector.Stage.ExportType = {
  SVG: 'svg',
  JPG: 'jpg',
  PNG: 'png',
  PDF: 'pdf'
};


/**
 * This is a lsh (<< - left shift) second argument to convert simple HANDLED_EVENT_TYPES code to a
 * CAPTURE HANDLED_EVENT_TYPES code.
 * @type {number}
 */
acgraph.vector.Stage.HANDLED_EVENT_TYPES_CAPTURE_SHIFT = 12;


//endregion
//region --- Properties
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Actual pixel stage width. Anything displayed on stage must be within this
 * range or it will be clipped.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.width_ = NaN;


/**
 * Actual pixel stage height. Anything displayed on stage must be within this
 * range or it will be clipped.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.height_ = NaN;


/**
 * Contains fixed width value. If the width is set in percent - contains NaN.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.fixedWidth_ = NaN;


/**
 * Contains fixed height value. If the height is set in percent - contains NaN.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.fixedHeight_ = NaN;


/**
 * Current width settings.
 * @type {number|string}
 * @private
 */
acgraph.vector.Stage.prototype.currentWidth_ = NaN;


/**
 * Current height settings.
 * @type {number|string}
 * @private
 */
acgraph.vector.Stage.prototype.currentHeight_ = NaN;


/**
 * Max resize reaction delay.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.maxResizeDelay_ = 100;


/**
 * Resize timeout handler.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.checkSizeTimer_ = NaN;


/**
 * The number of DOM changes done in one rendering frame. Used in async rendering to count quotas
 * of DOM operations in one rendering frame.
 * @type {number}
 * @protected
 */
acgraph.vector.Stage.prototype.currentDomChangesCount = 0;


// todo (Anton Saukh): Automatic quota assignment depending on performance.
/**
 * Maximum number of DOM changes in one frame. Used in async rendering as the quota.
 * @type {number}
 * @protected
 */
acgraph.vector.Stage.prototype.maxDomChanges = 500;


/**
 * Path to radial gradient image. VML renderer required.
 * @type {string}
 *
 */
acgraph.vector.Stage.prototype['pathToRadialGradientImage'] = 'RadialGradient.png';


/**
 * Stage id (id attribute of DOM element).
 * @type {string|undefined}
 * @private
 */
acgraph.vector.Stage.prototype.id_ = undefined;


/**
 * Rendering mode (>0 - suspended, 0 - instant)
 * Initially we suspend to render root layer and stage,
 * then release.
 * @type {number}
 * @private
 */
acgraph.vector.Stage.prototype.suspended_ = 1;


/**
 * Container DOM element.
 * @type {Element}
 * @private
 */
acgraph.vector.Stage.prototype.container_ = null;


/**
 * Title element. A subnode.
 * @type {?Element}
 */
acgraph.vector.Stage.prototype.titleElement = null;


/**
 * Text of title.
 * @type {string|null|undefined}
 * @private
 */
acgraph.vector.Stage.prototype.titleVal_ = void 0;


/**
 * Desc element. A subnode.
 * @type {?Element}
 */
acgraph.vector.Stage.prototype.descElement = null;


/**
 * Text of desc.
 * @type {string|null|undefined}
 * @private
 */
acgraph.vector.Stage.prototype.descVal_ = void 0;


/**
 * If the stage is in async mode.
 * @type {boolean}
 * @private
 */
acgraph.vector.Stage.prototype.asyncMode_ = false;


/**
 * Whether the stage is in process of rendering.
 * @type {boolean}
 * @private
 */
acgraph.vector.Stage.prototype.isRendering_ = false;


//endregion
//region --- Published methods
//------------------------------------------------------------------------------
//
//  Published methods
//
//------------------------------------------------------------------------------
/**
 Gets stage identifier. If it was not set, than it will be generated.
 @param {string=} opt_value Custom id.
 @return {(!acgraph.vector.Stage|string)} Returns element identifier.
 */
acgraph.vector.Stage.prototype.id = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var id = opt_value || '';
    if (this.id_ !== id) {
      this.id_ = id;
      acgraph.getRenderer().setId(this, this.id_);
    }
    return this;
  }
  if (!goog.isDef(this.id_))
    this.id(acgraph.utils.IdGenerator.getInstance().generateId(this));
  return /** @type {string} */(this.id_);
};


/**
 Returns self. We need this method to sync layer and stage api.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.getStage = function() {
  return this;
};


/**
 Returns self. We need this method to sync layer and stage api.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.parent = function() {
  return this;
};


/**
 Returns stage root DOM element.
 @return {Element} Stage root DOM element.
 */
acgraph.vector.Stage.prototype.domElement = function() {
  return this.domElement_;
};


/**
 * If opt_value defined then it will be set as stage width else returns current stage width.
 * Stage width can be defined as pixel or percent value.
 * @param {(string|number)=} opt_value Width of stage.
 * @return {number|acgraph.vector.Stage} Width of stage.
 *
 */
acgraph.vector.Stage.prototype.width = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.setWidth_(opt_value)) {
      this.checkSize_(true);
      // it seems that we have no need to initialize rendering here
      // this.render();
    }
    return this;
  }
  return this.width_ || 0;
};


/**
 * If opt_value defined then it will be set as stage height else returns current stage height.
 * Stage height can be defined as pixel or percent value.
 * @param {(string|number)=} opt_value Height of stage.
 * @return {number|acgraph.vector.Stage} Height of stage.
 */
acgraph.vector.Stage.prototype.height = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.setHeight_(opt_value)) {
      this.checkSize_(true);
      // it seems that we have no need to initialize rendering here
      // this.render();
    }
    return this;
  }
  return this.height_ || 0;
};


/**
 * Stage resize. Anything drawn on stage must fit in it
 * So any part that doesn't fit will be clipped.
 * @param {number|string} width Width.
 * @param {number|string} height Height.
 */
acgraph.vector.Stage.prototype.resize = function(width, height) {
  var widthChanged = this.setWidth_(width);
  var heightChanged = this.setHeight_(height);
  if (widthChanged || heightChanged) {
    this.checkSize_(true);
    // it seems that we have no need to initialize rendering here
    // this.render();
  }
};


/**
 * Getter and setter for max delay in milliseconds between the container resize and
 * the stage reaction on it.
 * @param {number=} opt_value
 * @return {number|acgraph.vector.Stage}
 */
acgraph.vector.Stage.prototype.maxResizeDelay = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var val = parseFloat(opt_value);
    if (val >= 0) {
      if (this.maxResizeDelay_ > val && !isNaN(this.checkSizeTimer_))
        clearTimeout(this.checkSizeTimer_);
      this.maxResizeDelay_ = val;
      this.checkSize_(true);
    }
    return this;
  }
  return this.maxResizeDelay_;
};


/**
 Returns DOM element where everything is drawn upon rendering.
 @param {(Element|string)=} opt_value Container element.
 @return {Element|acgraph.vector.Stage} Stage.
 */
acgraph.vector.Stage.prototype.container = function(opt_value) {
  if (goog.isDef(opt_value)) {
    var container = goog.dom.getElement(opt_value || null);
    if (this.container_ != container) {
      this.container_ = container;
      this.updateContainer_();
      this.checkSize_(true);
      this.render();
    }
    return this;
  }
  return this.container_ ? this.internalContainer_ : null;
};


/**
 * Returns stage container element.
 * @return {Element}
 */
acgraph.vector.Stage.prototype.getContainerElement = function() {
  return this.container_;
};


/**
 * Returns wrapper div that contains.
 * @return {!Element}
 */
acgraph.vector.Stage.prototype.getDomWrapper = function() {
  return this.internalContainer_;
};


/**
 Suspends rendering (changes instant to suspended).<br/>
 When Stage is in this state changes do not affect DOM.<br/>
 To wake Stage up from this state you need to invoke {@link acgraph.vector.Stage#resume}.<br/>
 Suspended rendering is much faster than instant, when there are a lot of operations with Stage.
 @return {acgraph.vector.Stage} Stage.
 */
acgraph.vector.Stage.prototype.suspend = function() {
  this.suspended_++;
  return this;
};


/**
 Removes Suspend state and applies all changes in sync (if any).<br/>
 Read more at {@link acgraph.vector.Stage#suspend}.
 @param {boolean=} opt_force
 @return {acgraph.vector.Stage} Stage.
 */
acgraph.vector.Stage.prototype.resume = function(opt_force) {
  this.suspended_ = opt_force ? 0 : Math.max(this.suspended_ - 1, 0);
  this.render();
  return this;
};


/**
 * Getter and setter for the stage rendering mode. If set to true - stage is rendered in async manner allowing the
 * page to interact while the rendering is in process. In this mode you should listen the RENDER_FINISH or
 * STAGE_RENDERED event on the stage.
 * @param {boolean=} opt_value
 * @return {acgraph.vector.Stage|boolean}
 */
acgraph.vector.Stage.prototype.asyncMode = function(opt_value) {
  if (goog.isDef(opt_value)) {
    this.asyncMode_ = !!opt_value;
    return this;
  }
  return this.asyncMode_;
};


/**
 Returns rendering state (true - suspended, false - instant
 @return {boolean} Rendering state.
 */
acgraph.vector.Stage.prototype.isSuspended = function() {
  return !!this.suspended_;
};


/**
 Indicates if stage is in rendering process.
 @return {boolean} State of rendering process.
 */
acgraph.vector.Stage.prototype.isRendering = function() {
  return this.isRendering_;
};


/**
 * Gets/sets element's title value.
 * @param {?string=} opt_value - Value to be set.
 * @return {(string|null|!acgraph.vector.Stage|undefined)} - Current value or itself for method chaining.
 */
acgraph.vector.Stage.prototype.title = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.titleVal_ != opt_value) {
      this.titleVal_ = opt_value;
      acgraph.getRenderer().setTitle(this, this.titleVal_);
    }
    return this;
  } else {
    return this.titleVal_;
  }
};


/**
 * Gets/sets element's desc value.
 * @param {?string=} opt_value - Value to be set.
 * @return {(string|null|!acgraph.vector.Stage|undefined)} - Current value or itself for method chaining.
 */
acgraph.vector.Stage.prototype.desc = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.descVal_ != opt_value) {
      this.descVal_ = opt_value;
      acgraph.getRenderer().setDesc(this, this.descVal_);
    }
    return this;
  } else {
    return this.descVal_;
  }
};


/**
 Returns stage visibility.
 @param {boolean=} opt_isVisible Visibility.
 @return {!acgraph.vector.Stage|boolean} Returns self for method chaining, if
 opt_visible is set, current state otherwise.
 */
acgraph.vector.Stage.prototype.visible = function(opt_isVisible) {
  if (arguments.length == 0) return /** @type {boolean} */ (this.rootLayer_.visible());
  this.rootLayer_.visible(opt_isVisible);
  return this;
};


/**
 Returns Stage JSON. Serializes stage and all its object in JSON.
 @param {Object=} opt_value .
 @return {acgraph.vector.Stage|Object} JSON data of stage.
 */
acgraph.vector.Stage.prototype.data = function(opt_value) {
  if (arguments.length == 0) {
    return this.serialize();
  } else {
    var primitive;
    var type = opt_value['type'];
    if (!type) this.deserialize(opt_value);
    else {
      switch (type) {
        case 'rect':
          primitive = this.rect();
          break;
        case 'circle':
          primitive = this.circle();
          break;
        case 'ellipse':
          primitive = this.ellipse();
          break;
        case 'image':
          primitive = this.image();
          break;
        case 'text':
          primitive = this.text();
          break;
        case 'path':
          primitive = this.path();
          break;
        case 'layer':
          primitive = this.layer();
          break;
        default:
          primitive = null;
          break;
      }
    }

    if (primitive) primitive.deserialize(opt_value);
    return this;
  }
};


/**
 Removes everything.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.remove = function() {
  return /** @type {!acgraph.vector.Stage} */(this.container(null));
};


/**
 Returns X of top left corner.
 @return {number} X of top left corner.
 */
acgraph.vector.Stage.prototype.getX = function() {
  return 0;
};


/**
 Returns Y of top left corner.
 @return {number} Y of top left corner.
 */
acgraph.vector.Stage.prototype.getY = function() {
  return 0;
};


/**
 Returns bounds.
 @return {!goog.math.Rect} Bounds.
 */
acgraph.vector.Stage.prototype.getBounds = function() {
  return new goog.math.Rect(0, 0, /** @type {number} */ (this.width()), /** @type {number} */ (this.height()));
};


/**
 Clips a stage.
 Works only after render() is invoked.<br/>
 Read more at: {@link acgraph.vector.Element#clip}.
 @param {(goog.math.Rect|acgraph.vector.Clip)=} opt_value Clipping rectangle.
 @return {acgraph.vector.Element|goog.math.Rect|acgraph.vector.Clip} {@link acgraph.vector.Stage} for method chaining
 or {@link goog.math.Rect} clipping rectangle.
 */
acgraph.vector.Stage.prototype.clip = function(opt_value) {
  return this.rootLayer_.clip(opt_value);
};


//endregion
//region --- Internal methods
//------------------------------------------------------------------------------
//
//  Internal methods
//
//------------------------------------------------------------------------------
/**
 * Returns type prefix.
 * @return {acgraph.utils.IdGenerator.ElementTypePrefix} Type prefix.
 */
acgraph.vector.Stage.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.STAGE;
};


/**
 * Returns root layer element.
 * @return {!acgraph.vector.Layer} Root layer element.
 */
acgraph.vector.Stage.prototype.getRootLayer = function() {
  return this.rootLayer_;
};


/**
 * Tell root layer that child was removed from DOM (moved to another layer).
 * @param {acgraph.vector.Element} child Removed child.
 */
acgraph.vector.Stage.prototype.notifyRemoved = function(child) {
  this.rootLayer_.notifyRemoved(child);
};


/**
 * Tell layer that child clipping rectangle has changed.
 */
acgraph.vector.Stage.prototype.childClipChanged = goog.nullFunction;


/**
 * Method that handles events cached by eventHandler_.
 * @param {boolean=} opt_directCall
 * @param {boolean=} opt_silent
 * @private
 */
acgraph.vector.Stage.prototype.checkSize_ = function(opt_directCall, opt_silent) {
  if (opt_directCall && !isNaN(this.checkSizeTimer_))
    clearTimeout(this.checkSizeTimer_);
  this.checkSizeTimer_ = NaN;
  var width, height;
  var isDynamicWidth = isNaN(this.fixedWidth_);
  var isDynamicHeight = isNaN(this.fixedHeight_);
  var isDynamicSize = isDynamicWidth || isDynamicHeight;
  var detachedOrHidden;
  if (isDynamicSize) {
    var size = this.container_ ? goog.style.getContentBoxSize(this.container_) : new goog.math.Size(NaN, NaN);
    size.width = Math.max(size.width || 0, 0);
    size.height = Math.max(size.height || 0, 0);
    detachedOrHidden = !size.width && !size.height;
    width = isDynamicWidth ? size.width : this.fixedWidth_;
    height = isDynamicHeight ? size.height : this.fixedHeight_;
  } else {
    width = this.fixedWidth_;
    height = this.fixedHeight_;
    detachedOrHidden = false;
  }
  if ((width != this.width_ || height != this.height_) && !detachedOrHidden) {
    this.width_ = width;
    this.height_ = height;
    if (!opt_silent)
      this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RESIZE);
  }
  if (this.container_ && isDynamicSize) {
    this.checkSizeTimer_ = setTimeout(this.checkSize_, this.maxResizeDelay_);
  }
};


/**
 * @param {*} width
 * @return {boolean}
 * @private
 */
acgraph.vector.Stage.prototype.setWidth_ = function(width) {
  if (this.currentWidth_ != width) {
    var num = parseFloat(width);
    if (!isNaN(num)) {
      this.currentWidth_ = goog.isNumber(width) ? width : String(width);
      this.fixedWidth_ = (goog.isString(width) && goog.string.endsWith(width, '%')) ? NaN : num;
      goog.style.setWidth(this.internalContainer_, this.currentWidth_);
      return true;
    }
  }
  return false;
};


/**
 * @param {*} height
 * @return {boolean}
 * @private
 */
acgraph.vector.Stage.prototype.setHeight_ = function(height) {
  if (this.currentHeight_ != height) {
    var num = parseFloat(height);
    if (!isNaN(num)) {
      this.currentHeight_ = goog.isNumber(height) ? height : String(height);
      this.fixedHeight_ = (goog.isString(height) && goog.string.endsWith(height, '%')) ? NaN : num;
      goog.style.setHeight(this.internalContainer_, this.currentHeight_);
      return true;
    }
  }
  return false;
};


/**
 * Create container for reusable elements.
 * @return {!acgraph.vector.Defs} Defs Element.
 * @protected
 */
acgraph.vector.Stage.prototype.createDefs = goog.abstractMethod;


/**
 * Returns Defs object.
 * @return {!acgraph.vector.Defs} Defs object.
 */
acgraph.vector.Stage.prototype.getDefs = function() {
  return this.defs_;
};


/**
 TODO: We need to create method to clear SVG because there is no sence to clear defs only.<br/>
 Destroy all content (e.g. gradients, some fill and etc.) in defs node.
 @deprecated used only in AnyChartHTML5 v6.
 */
acgraph.vector.Stage.prototype.clearDefs = function() {
  this.defs_.clear();
};


/**
 * Updates clip or add to array to update on render.
 * @param {acgraph.vector.Clip} clip Clip to update or clip that should be updated on render.
 */
acgraph.vector.Stage.prototype.addClipForRender = function(clip) {
  if (!this.isSuspended()) {
    clip.render();
  } else {
    this.clipsToRender_.push(clip);
  }
};


/**
 * Updates clip.
 * @param {acgraph.vector.Clip} clip Clip that should be updated on render.
 */
acgraph.vector.Stage.prototype.removeClipFromRender = function(clip) {
  goog.array.remove(this.clipsToRender_, clip);
};


/**
 * Deserialize JSON data and apply it to Stage.
 * @param {Object} data Data for deserialization.
 */
acgraph.vector.Stage.prototype.deserialize = function(data) {
  this.width(data['width']);
  this.height(data['height']);
  data['type'] = 'layer';
  this.getRootLayer().deserialize(data);
  this.getRootLayer().id('');
  if ('id' in data)
    this.id(data['id']);
};


/**
 * Serialize Stage to JSON data.
 * @return {Object} Serialized stage. JSON data.
 */
acgraph.vector.Stage.prototype.serialize = function() {
  var data = this.getRootLayer().serialize();
  if (this.id_) data['id'] = this.id_;
  data['width'] = this.currentWidth_;
  data['height'] = this.currentHeight_;
  delete data['type'];
  return data;
};


/**
 * Returns stage client position relative to the viewport. If the stage is not in DOM returns (0, 0).
 * @return {!goog.math.Coordinate}
 */
acgraph.vector.Stage.prototype.getClientPosition = function() {
  return this.internalContainer_ ? goog.style.getClientPosition(this.internalContainer_) : new goog.math.Coordinate(0, 0);
};


//endregion
//region --- Rendering infrastructure
//------------------------------------------------------------------------------
//
//  Rendering infrastructure
//
//------------------------------------------------------------------------------
/**
 * Method used in sync rendering, it allows to do any number of changes in DOM.
 * @see acgraph.vector.Stage#acquireDomChanges
 * @param {number} wantedCount Maximal number of changes to be allowed.
 * @return {number} Number of changes allowed.
 * @private
 */
acgraph.vector.Stage.prototype.acquireDomChangesSync_ = function(wantedCount) {
  this.currentDomChangesCount += wantedCount;
  return wantedCount;
};


/**
 * Method used in async rendring. Tries to get a quota to make changes in DOM.
 * Returns a quota.
 *
 * @see acgraph.vector.Stage#acquireDomChanges
 * @param {number} wantedCount Maximal number of changes to be done.
 * @return {number} Number of changes allowed.
 * @private
 */
acgraph.vector.Stage.prototype.acquireDomChangesAsync_ = function(wantedCount) {
  /** @type {number} */
  var allowed = Math.min(this.maxDomChanges - this.currentDomChangesCount, wantedCount);
  this.currentDomChangesCount += allowed;
  return allowed;
};


/**
 * DOM changes quota mask. You can try to get a quota using this method,
 * and it will return allowed number, taking in account remainder of quota in the current frame.
 * Depending on rendering type it can be either
 * {@link acgraph.vector.Stage#acquireDomChangesAsync_} (for async), or
 * {@link acgraph.vector.Stage#acquireDomChangesSync_} value (for sync).
 * It has initial value because it is used in constructor, when root layer is rendered.
 * @param {number} wantedCount Maximal number of changes to be done.
 * @return {number} Number of changes allowed.
 */
acgraph.vector.Stage.prototype.acquireDomChanges =
    acgraph.vector.Stage.prototype.acquireDomChangesSync_;


/**
 * Tries to reserve one exact typed DOM change.
 * @param {acgraph.vector.Stage.DomChangeType} changeType Change type.
 * @return {boolean} Allowed or not.
 */
acgraph.vector.Stage.prototype.acquireDomChange = function(changeType) {
  // Here we suppose that the DOM operation is an operation of CREATE, ADD and REMOVE
  // because the filling and stroking in SVG adds attributes, not subnodes.
  if (changeType == acgraph.vector.Stage.DomChangeType.ELEMENT_CREATE ||
      changeType == acgraph.vector.Stage.DomChangeType.ELEMENT_ADD ||
      changeType == acgraph.vector.Stage.DomChangeType.ELEMENT_REMOVE)
    return this.acquireDomChanges(1) > 0;
  return true;
};


/**
 * Tries to reserve no more than one third of all available changes.
 * When rendering is async there is no sence in creating all elements and then hit the limit
 * of adding - it is better to take into account that adding will require the same number
 * of operations as creation.
 * @return {number} Number of changes allowed.
 */
acgraph.vector.Stage.prototype.blockChangesForAdding = function() {
  /** @type {number} */
  var wanted = Math.floor(Math.max(this.maxDomChanges - this.currentDomChangesCount, 0) / 3);
  return this.acquireDomChanges(wanted);
};


/**
 * Counts unused DOM changes.
 * @param {number} allowed The number of allowed changes.
 * @param {number} made The number of changes done.
 */
acgraph.vector.Stage.prototype.releaseDomChanges = function(allowed, made) {
  this.currentDomChangesCount -= allowed - made;
};


/**
 * Renders the stage with selected method if it is not suspended.
 */
acgraph.vector.Stage.prototype.render = function() {
  if (!this.suspended_) {
    if (this.container_ && !this.isRendering_) {
      this.isRendering_ = true;
      this.dispatchEvent(acgraph.vector.Stage.EventType.RENDER_START);
      this.currentDomChangesCount = 0;
      if (this.asyncMode_) {
        this.acquireDomChanges = this.acquireDomChangesAsync_;
        setTimeout(this.renderAsync_, 0);
      } else {
        this.acquireDomChanges = this.acquireDomChangesSync_;
        this.renderInternal();
        if (this.isDirty()) {
          throw acgraph.error.getErrorMessage(acgraph.error.Code.DIRTY_AFTER_SYNC_RENDER);
        }
        this.finishRendering_();
      }
    }
  }
};


/**
 * Inserts stage internal container into proper container.
 * @private
 */
acgraph.vector.Stage.prototype.updateContainer_ = function() {
  if (this.container_) {
    if (this.internalContainer_.parentNode != this.container_)
      goog.dom.appendChild(this.container_, this.internalContainer_);
  } else {
    goog.dom.removeNode(this.internalContainer_);
  }
};


/**
 * Async rendering method.
 * @private
 */
acgraph.vector.Stage.prototype.renderAsync_ = function() {
  // Calling internal rendering.
  this.renderInternal();
  // If state is still dirty, make browser handle the sequence of events and call again.
  if (this.isDirty())
    setTimeout(this.renderAsync_, 0);
  else
    this.finishRendering_();
};


/**
 * This method must be overloaded in descendants to implement stage rendering logic.
 * @protected
 */
acgraph.vector.Stage.prototype.renderInternal = function() {
  if (this.clipsToRender_ && this.clipsToRender_.length) {
    for (var i = 0; i < this.clipsToRender_.length; i++) {
      var clip = this.clipsToRender_[i];
      if (clip.isDirty())
        clip.render();
    }
    this.clipsToRender_.length = 0;
  }

  if (this.rootLayer_.isDirty())
    this.rootLayer_.render();

  if (this.credits) {
    this.credits().render();
  }
};


/**
 * Executes code that should be executed on rendering finish.
 * @private
 */
acgraph.vector.Stage.prototype.finishRendering_ = function() {
  this.isRendering_ = false;
  this.dispatchEvent(acgraph.vector.Stage.EventType.RENDER_FINISH);

  var imageLoader = acgraph.getRenderer().getImageLoader();
  var isImageLoading = acgraph.getRenderer().isImageLoading();
  if (imageLoader && isImageLoading) {
    if (!this.imageLoadingListener_)
      this.imageLoadingListener_ = goog.events.listenOnce(imageLoader, goog.net.EventType.COMPLETE, function(e) {
        this.imageLoadingListener_ = null;
        if (!this.isRendering_)
          this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RENDERED);
      }, false, this);
  } else {
    this.dispatchEvent(acgraph.vector.Stage.EventType.STAGE_RENDERED);
  }
};


/**
 * Set sync state.
 * @param {acgraph.vector.Element.DirtyState} state State.
 */
acgraph.vector.Stage.prototype.setDirtyState = function(state) {
};


/**
 * Checks if layer has any state unsynced.
 * @return {boolean} Are there any unsynced states.
 */
acgraph.vector.Stage.prototype.isDirty = function() {
  return this.rootLayer_.isDirty();
};


/**
 * Checks if element has unsync state.
 * Only for interface.
 * @param {acgraph.vector.Element.DirtyState} state State check.
 * @return {boolean} If element has unsync state.
 */
acgraph.vector.Stage.prototype.hasDirtyState = function(state) {
  return this.rootLayer_.hasDirtyState(state);
};


//endregion
//region --- Sharing and export
//------------------------------------------------------------------------------
//
//  Sharing and export
//
//------------------------------------------------------------------------------
/**
 * Shares url.
 * @param {acgraph.vector.Stage.ExportType} type Type.
 * @param {Object} data Data to send.
 * @param {boolean} asBase64 Whether to share as base64.
 * @param {boolean} saveAndShare Whether to save file and share link, or return base64 string.
 * @param {function(string)} onSuccess Function that will be called on success.
 * @param {function(string)=} opt_onError Function that will be called on error.
 * @private
 */
acgraph.vector.Stage.prototype.shareUrl_ = function(type, data, asBase64, saveAndShare, onSuccess, opt_onError) {
  if (asBase64)
    data['responseType'] = 'base64';
  if (saveAndShare)
    data['save'] = true;
  var onError = opt_onError || goog.nullFunction;
  /** @param {goog.events.Event} event */
  var property = saveAndShare ? 'url' : 'result';
  var callback = function(event) {
    var xhr = /** @type {goog.net.XhrIo} */ (event.target);
    if (xhr.isSuccess()) {
      onSuccess(/** @type {string} */ (xhr.getResponseJson()[property]));
    } else {
      onError(xhr.getLastError());
    }
  };

  data = goog.Uri.QueryData.createFromMap(new goog.structs.Map(data));
  goog.net.XhrIo.send(acgraph.exportServer + '/' + type, callback, 'POST', data.toString());
};


/**
 * @param {Object} data Object with data.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 * @private
 */
acgraph.vector.Stage.prototype.addPngData_ = function(data, opt_width, opt_height, opt_quality, opt_filename) {
  data['data'] = this.toSvg(opt_width, opt_height);
  data['dataType'] = 'svg';
  data['responseType'] = 'file';
  if (goog.isDef(opt_width)) data['width'] = opt_width;
  if (goog.isDef(opt_height)) data['height'] = opt_height;
  if (goog.isDef(opt_quality)) data['quality'] = opt_quality;
  if (goog.isDef(opt_filename)) data['file-name'] = opt_filename;
};


/**
 * Share current stage as png and return link to shared image.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.shareAsPng = function(onSuccess, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPngData_(data, opt_width, opt_height, opt_quality, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PNG, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * @param {Object} data Object with data.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 * @private
 */
acgraph.vector.Stage.prototype.addJpgData_ = function(data, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  data['data'] = this.toSvg(opt_width, opt_height);
  data['dataType'] = 'svg';
  data['responseType'] = 'file';
  if (goog.isDef(opt_width)) data['width'] = opt_width;
  if (goog.isDef(opt_height)) data['height'] = opt_height;
  if (goog.isDef(opt_quality)) data['quality'] = opt_quality;
  if (goog.isDef(opt_forceTransparentWhite)) data['force-transparent-white'] = opt_forceTransparentWhite;
  if (goog.isDef(opt_filename)) data['file-name'] = opt_filename;
};


/**
 * Share current stage as jpg and return link to shared image.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.shareAsJpg = function(onSuccess, opt_onError, opt_asBase64, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addJpgData_(data, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.JPG, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * @param {Object} data Object with data.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 * @private
 */
acgraph.vector.Stage.prototype.addSvgData_ = function(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  data['data'] = this.toSvg(opt_paperSizeOrWidth, opt_landscapeOrHeight);
  data['dataType'] = 'svg';
  data['responseType'] = 'file';
  if (goog.isDef(opt_filename)) data['file-name'] = opt_filename;
};


/**
 * Share current stage as svg and return link to shared image.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.shareAsSvg = function(onSuccess, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addSvgData_(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.SVG, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * @param {Object} data Object with data.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Landscape or height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 * @private
 */
acgraph.vector.Stage.prototype.addPdfData_ = function(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var formatSize = null;
  var svgStr;

  if (goog.isDef(opt_paperSizeOrWidth)) {
    if (goog.isNumber(opt_paperSizeOrWidth)) {
      data['pdf-width'] = opt_paperSizeOrWidth;
      data['pdf-height'] = goog.isNumber(opt_landscapeOrHeight) ? opt_landscapeOrHeight : this.height();
    } else if (goog.isString(opt_paperSizeOrWidth)) {
      data['pdf-size'] = opt_paperSizeOrWidth || acgraph.vector.PaperSize.A4;
      data['landscape'] = !!opt_landscapeOrHeight;
      formatSize = acgraph.utils.exporting.PdfPaperSize[data['pdf-size']];
      if (data['landscape'])
        formatSize = {
          width: formatSize.height,
          height: formatSize.width
        };
    } else {
      data['pdf-width'] = this.width();
      data['pdf-height'] = this.height();
    }
  } else {
    data['pdf-width'] = this.width();
    data['pdf-height'] = this.height();
  }

  if (goog.isDef(opt_x)) data['pdf-x'] = opt_x;
  if (goog.isDef(opt_y)) data['pdf-y'] = opt_y;
  if (goog.isDef(opt_filename)) data['file-name'] = opt_filename;

  if (formatSize) {
    var proportionalSize = acgraph.math.fitWithProportion(formatSize.width, formatSize.height, /** @type {number} */(this.width()), /** @type {number} */(this.height()));
    proportionalSize[0] -= opt_x || 0;
    proportionalSize[1] -= opt_y || 0;
    svgStr = this.toSvg(proportionalSize[0], proportionalSize[1]);
  } else {
    svgStr = this.toSvg(data['pdf-width'], data['pdf-height']);
  }

  data['data'] = svgStr;
  data['dataType'] = 'svg';
  data['responseType'] = 'file';
};


/**
 * Share current stage as pdf and return link to shared image.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {boolean=} opt_asBase64 Share as base64 file.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Landscape or height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.shareAsPdf = function(onSuccess, opt_onError, opt_asBase64, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPdfData_(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PDF, data, !!opt_asBase64, true, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Returns base64 string for png.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 */
acgraph.vector.Stage.prototype.getPngBase64String = function(onSuccess, opt_onError, opt_width, opt_height, opt_quality) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPngData_(data, opt_width, opt_height, opt_quality);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PNG, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Returns base64 string for jpg.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 */
acgraph.vector.Stage.prototype.getJpgBase64String = function(onSuccess, opt_onError, opt_width, opt_height, opt_quality, opt_forceTransparentWhite) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addJpgData_(data, opt_width, opt_height, opt_quality, opt_forceTransparentWhite);
    this.shareUrl_(acgraph.vector.Stage.ExportType.JPG, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Returns base64 string for svg.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
acgraph.vector.Stage.prototype.getSvgBase64String = function(onSuccess, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addSvgData_(data, opt_paperSizeOrWidth, opt_landscapeOrHeight);
    this.shareUrl_(acgraph.vector.Stage.ExportType.SVG, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Returns base64 string for pdf.
 * @param {function(string)} onSuccess Function that will be called when sharing will complete.
 * @param {function(string)=} opt_onError Function that will be called when sharing will complete.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Landscape or height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 */
acgraph.vector.Stage.prototype.getPdfBase64String = function(onSuccess, opt_onError, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var data = {};
    this.addPdfData_(data, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y);
    this.shareUrl_(acgraph.vector.Stage.ExportType.PDF, data, true, false, onSuccess, opt_onError);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Save current stage as PNG Image.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.saveAsPng = function(opt_width, opt_height, opt_quality, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addPngData_(options, opt_width, opt_height, opt_quality, opt_filename);
    acgraph.sendRequestToExportServer(acgraph.exportServer + '/png', options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Save current stage as PNG Image.
 * @param {number=} opt_width Image width.
 * @param {number=} opt_height Image height.
 * @param {number=} opt_quality Image quality in ratio 0-1.
 * @param {boolean=} opt_forceTransparentWhite Define, should we force transparent to white background.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.saveAsJpg = function(opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addJpgData_(options, opt_width, opt_height, opt_quality, opt_forceTransparentWhite, opt_filename);
    acgraph.sendRequestToExportServer(acgraph.exportServer + '/jpg', options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Save current stage as PDF Document.
 * @param {(number|string)=} opt_paperSizeOrWidth Any paper format like 'a0', 'tabloid', 'b4', etc.
 * @param {(number|boolean)=} opt_landscapeOrHeight Landscape or height.
 * @param {number=} opt_x Offset X.
 * @param {number=} opt_y Offset Y.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.saveAsPdf = function(opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addPdfData_(options, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_x, opt_y, opt_filename);
    acgraph.sendRequestToExportServer(acgraph.exportServer + '/pdf', options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Save stage as SVG Image.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 * @param {string=} opt_filename file name to save.
 */
acgraph.vector.Stage.prototype.saveAsSvg = function(opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename) {
  var type = acgraph.type();
  if (type == acgraph.StageType.SVG) {
    var options = {};
    this.addSvgData_(options, opt_paperSizeOrWidth, opt_landscapeOrHeight, opt_filename);
    acgraph.sendRequestToExportServer(acgraph.exportServer + '/svg', options);
  } else {
    alert(acgraph.error.getErrorMessage(acgraph.error.Code.FEATURE_NOT_SUPPORTED_IN_VML));
  }
};


/**
 * Print stage.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
acgraph.vector.Stage.prototype.print = function(opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  acgraph.utils.exporting.print(this, opt_paperSizeOrWidth, opt_landscapeOrHeight);
};


/**
 * Returns SVG string if type of content SVG otherwise returns empty string.
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string|number)=} opt_landscapeOrHeight Landscape or height.
 * @return {string}
 */
acgraph.vector.Stage.prototype.toSvg = function(opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var type = acgraph.type();
  if (type != acgraph.StageType.SVG) return '';

  var result = '';

  if (goog.isDef(opt_paperSizeOrWidth) || goog.isDef(opt_landscapeOrHeight)) {
    var size = acgraph.vector.normalizePageSize(opt_paperSizeOrWidth, opt_landscapeOrHeight);
    var sourceDiv = goog.dom.getParentElement(this.domElement());
    var sourceWidth = goog.style.getStyle(sourceDiv, 'width');
    var sourceHeight = goog.style.getStyle(sourceDiv, 'height');

    this.resize(size.width, size.height);

    result = this.serializeToString_(this.domElement());

    this.resize(sourceWidth, sourceHeight);
  } else {
    acgraph.getRenderer().setStageSize(this.domElement(),
        /** @type {number|string} */(this.width()),
        /** @type {number|string} */(this.height()));
    result = this.serializeToString_(this.domElement());
    acgraph.getRenderer().setStageSize(this.domElement(), '100%', '100%');
  }

  return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + result;
};


/**
 * @param {Element} node
 * @return {string}
 * @private
 */
acgraph.vector.Stage.prototype.serializeToString_ = function(node) {
  var result = '';

  if (node) {
    var serializer = new XMLSerializer();
    result = serializer.serializeToString(node);
  }

  return result;
};


//endregion
//region --- Elements constructors
//------------------------------------------------------------------------------
//
//  Elements constructors
//
//------------------------------------------------------------------------------
/**
 Invokes {@link acgraph.vector.Layer} constructor<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.
 @return {!acgraph.vector.Layer} {@link acgraph.vector.Layer} for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Stage.prototype.layer = acgraph.vector.Layer.prototype.layer;


/**
 Invokes {@link acgraph.vector.UnmanagedLayer} constructor<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.
 @return {!acgraph.vector.UnmanagedLayer} {@link acgraph.vector.UnmanagedLayer} for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Stage.prototype.unmanagedLayer = acgraph.vector.Layer.prototype.unmanagedLayer;


/**
 Invokes {@link acgraph.vector.Text} constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.
 @param {number=} opt_x X-coordinate (Left) of left top corner of text bounds.
 @param {number=} opt_y Y-coordinate (Top) of left top corner of text bounds.
 @param {string=} opt_text Text.
 @param {acgraph.vector.TextStyle=} opt_style Text style. Read more at {@link acgraph.vector.Text#style}.
 @return {!acgraph.vector.Text} {@link acgraph.vector.Text} for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Stage.prototype.text = acgraph.vector.Layer.prototype.text;


/**
 Invokes {@link acgraph.vector.Text} and applies {@link acgraph.vector.Text#htmlText} method
 to parse HTML.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.
 @param {number=} opt_x X-coordinate (Left) of left top corner of text bounds.
 @param {number=} opt_y Y-coordinate (Top) of left top corner of text bounds.
 @param {string=} opt_text Text.
 @param {acgraph.vector.TextStyle=} opt_style Text style. Read more at {@link acgraph.vector.Text#style}.
 @return {!acgraph.vector.Text} {@link acgraph.vector.Text} for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Stage.prototype.html = acgraph.vector.Layer.prototype.html;


/**
 Invokes {@link acgraph.vector.Rect} constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.
 @param {number=} opt_x X (Left) coordinate of top-left corner.
 @param {number=} opt_y Y (Top) coordinate of top-left corner.
 @param {number=} opt_width Width.
 @param {number=} opt_height Height.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} for method chaining.
 */
acgraph.vector.Stage.prototype.rect = acgraph.vector.Layer.prototype.rect;


/**
 Invokes {@link acgraph.vector.Image} constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.
 @param {string=} opt_src IRI (Internationalized Resource Identifiers) for image source.
 @param {number=} opt_x X coordinate of left-top corner image.
 @param {number=} opt_y Y coordinate of left-top corner image.
 @param {number=} opt_width Width of image bounds.
 @param {number=} opt_height Height of image bounds.
 @return {acgraph.vector.Image} Image object instance.
 */
acgraph.vector.Stage.prototype.image = acgraph.vector.Layer.prototype.image;


/**
 Draws rectangle with rounded corners.<br/>
 Read more at {@link acgraph.vector.primitives.roundedRect}
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} for method chaining.
 */
acgraph.vector.Stage.prototype.roundedRect = acgraph.vector.Layer.prototype.roundedRect;


/**
 Draws rectangle with inner rounded corners.<br/>
 Read more at {@link acgraph.vector.primitives.roundedInnerRect}
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} for method chaining.
 */
acgraph.vector.Stage.prototype.roundedInnerRect = acgraph.vector.Layer.prototype.roundedInnerRect;


/**
 Draws rectangle with truncated corners.<br/>
 Read more at {@link acgraph.vector.primitives.truncatedRect}
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} for method chaining.
 */
acgraph.vector.Stage.prototype.truncatedRect = acgraph.vector.Layer.prototype.truncatedRect;


/**
 Invokes {@link acgraph.vector.Circle} constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.<br/>
 Read more at: {@link acgraph.vector.Circle}
 @param {number=} opt_cx Center X, in pixels.
 @param {number=} opt_cy Center Y, in pixels.
 @param {number=} opt_radius Radius, in pixels.
 @return {!acgraph.vector.Circle} {@link acgraph.vector.Circle} for method chaining.
 */
acgraph.vector.Stage.prototype.circle = acgraph.vector.Layer.prototype.circle;


/**
 Invokes {@link acgraph.vector.Ellipse} constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.<br/>
 Read more at: {@link acgraph.vector.Ellipse}
 @param {number=} opt_cx Center X, in pixels.
 @param {number=} opt_cy Center Y, in pixels.
 @param {number=} opt_rx X radius, in pixels.
 @param {number=} opt_ry Y raduis, in pixels.
 @return {!acgraph.vector.Ellipse} {@link acgraph.vector.Ellipse} for method chaining.
 */
acgraph.vector.Stage.prototype.ellipse = acgraph.vector.Layer.prototype.ellipse;


/**
 Invokes {@link acgraph.vector.Path} constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.<br/>
 Read more at Path: {@link acgraph.vector.Path}
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} for method chaining.
 */
acgraph.vector.Stage.prototype.path = acgraph.vector.Layer.prototype.path;


/**
 Draws multi-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @param {number} innerRadius .
 @param {number} numberOfSpikes .
 @param {number=} opt_startDegrees .
 @param {number=} opt_curvature .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.star = acgraph.vector.Layer.prototype.star;


/**
 Draws four-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star4}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.star4 = acgraph.vector.Layer.prototype.star4;


/**
 Draws five-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star5}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.star5 = acgraph.vector.Layer.prototype.star5;


/**
 Draws six-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star6}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.star6 = acgraph.vector.Layer.prototype.star6;


/**
 Draws seven-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star7}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.star7 = acgraph.vector.Layer.prototype.star7;


/**
 Draws ten-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star10}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.star10 = acgraph.vector.Layer.prototype.star10;


/**
 Draws a triangle heading upwards set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleUp}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.triangleUp = acgraph.vector.Layer.prototype.triangleUp;


/**
 Draws a triangle heading downwards set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleDown}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.triangleDown = acgraph.vector.Layer.prototype.triangleDown;


/**
 Draws a triangle heading rightwards set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleRight}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.triangleRight = acgraph.vector.Layer.prototype.triangleRight;


/**
 Draws a triangle heading leftwards set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleLeft}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.triangleLeft = acgraph.vector.Layer.prototype.triangleLeft;


/**
 Draws a diamond set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.diamond}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.diamond = acgraph.vector.Layer.prototype.diamond;


/**
 Draws a cross set by it's circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.cross}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.cross = acgraph.vector.Layer.prototype.cross;


/**
 Draws a diagonal cross set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.diagonalCross}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.diagonalCross = acgraph.vector.Layer.prototype.diagonalCross;


/**
 Draws a thick horizontal line set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.hLine}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.hLine = acgraph.vector.Layer.prototype.hLine;


/**
 Draws a thick vertical line set by it circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.vLine}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.vLine = acgraph.vector.Layer.prototype.vLine;


/**
 Draws arc as pie chart element.<br/>
 Read more at {@link acgraph.vector.primitives.pie}
 @param {number} cx .
 @param {number} cy .
 @param {number} r .
 @param {number} start .
 @param {number} extent .
 @return {!acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.pie = acgraph.vector.Layer.prototype.pie;


/**
 Draws arc as donut chart element.<br/>
 Read more at {@link acgraph.vector.primitives.donut}
 @param {number} cx .
 @param {number} cy .
 @param {number} outerR .
 @param {number} innerR .
 @param {number} start .
 @param {number} extent .
 @return {acgraph.vector.Path} .
 */
acgraph.vector.Stage.prototype.donut = acgraph.vector.Layer.prototype.donut;


/**
 * Creates a clip element.
 * @param {(number|Array.<number>|goog.math.Rect|Object|null)=} opt_leftOrRect Left coordinate of bounds
 * or rect or array or object representing bounds.
 * @param {number=} opt_top Top coordinate.
 * @param {number=} opt_width Width of the rect.
 * @param {number=} opt_height Height of the rect.
 * @return {acgraph.vector.Clip} Clip element.
 */
acgraph.vector.Stage.prototype.createClip = function(opt_leftOrRect, opt_top, opt_width, opt_height) {
  return new acgraph.vector.Clip(this, opt_leftOrRect, opt_top, opt_width, opt_height);
};


/**
 Invokes {@link acgraph.vector.PatternFill}.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.<br/>
 Read more at: {@link acgraph.vector.PatternFill}
 @param {!goog.math.Rect} bounds Bounds of pattern. Defines size and offset of pattern.
 @return {!acgraph.vector.PatternFill} {@link acgraph.vector.PatternFill} for method chaining.
 */
acgraph.vector.Stage.prototype.pattern = function(bounds) {
  return new acgraph.vector.PatternFill(bounds);
};


/**
 Invokes {@link acgraph.vector.HatchFill} constructor, if there is no such hatchfill
 in defs. If it already exist - returns an instance.<br/>
 <strong>Note:</strong><br>acgraph.vector.Stage doesn't delete objects you create.
 You must delete them yourself after you finish using them.<br/>
 Read more at: {@link acgraph.vector.HatchFill}
 @param {acgraph.vector.HatchFill.HatchFillType=} opt_type Type of hatch fill.
 @param {string=} opt_color Hatch color COMBINED WITH OPACITY.
 @param {number=} opt_thickness Hatch fill thickness.
 @param {number=} opt_size Hatch fill size.
 @return {!acgraph.vector.HatchFill} {@link acgraph.vector.HatchFill} for method chaining.
 */
acgraph.vector.Stage.prototype.hatchFill = function(opt_type, opt_color, opt_thickness, opt_size) {
  return acgraph.hatchFill(opt_type, opt_color, opt_thickness, opt_size);
};


//endregion
//region --- Children management
//------------------------------------------------------------------------------
//
//  Children management
//
//------------------------------------------------------------------------------
/**
 Similar to {@link acgraph.vector.Layer#numChildren}
 @return {number} Number of stage children.
 */
acgraph.vector.Stage.prototype.numChildren = function() {
  // Delegate to root layer
  return this.rootLayer_.numChildren();
};


/**
 Adds element.<br/>
 Similar to {@link acgraph.vector.Layer#addChild}
 @param {!acgraph.vector.Element} element Element.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.addChild = function(element) {
  // Delegate to root layer
  this.rootLayer_.addChild(element);
  return this;
};


/**
 Adds element by index.<br/>
 Similar to {@link acgraph.vector.Layer#addChildAt}
 @param {!acgraph.vector.Element} element Element.
 @param {number} index Child index.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.addChildAt = function(element, index) {
  // Delegate to root layer
  this.rootLayer_.addChildAt(element, index);
  return this;
};


/**
 Returns element by index.<br/>
 Similar to {@link acgraph.vector.Layer#getChildAt}
 @param {number} index Child index.
 @return {acgraph.vector.Element} Element or null.
 */
acgraph.vector.Stage.prototype.getChildAt = function(index) {
  // Delegate to root layer
  return this.rootLayer_.getChildAt(index);
};


/**
 Removes element.<br/>
 Similar to {@link acgraph.vector.Layer#removeChild}
 @param {acgraph.vector.Element} element Element.
 @return {acgraph.vector.Element} Removed element.
 */
acgraph.vector.Stage.prototype.removeChild = function(element) {
  return this.rootLayer_.removeChild(element);
};


/**
 Removes element by index.<br/>
 Similar to {@link acgraph.vector.Layer#removeChildAt}
 @param {number} index Index.
 @return {acgraph.vector.Element} Removed element.
 */
acgraph.vector.Stage.prototype.removeChildAt = function(index) {
  // Delegate to root layer
  return this.rootLayer_.removeChildAt(index);
};


/**
 Removes all elements.<br/>
 Similar to {@link acgraph.vector.Layer#removeChildren}
 @return {!Array.<acgraph.vector.Element>} Array of removed elements.
 */
acgraph.vector.Stage.prototype.removeChildren = function() {
  // Delegate to root layer
  return this.rootLayer_.removeChildren();
};


/**
 Similar to {@link acgraph.vector.Layer#hasChild}
 @param {acgraph.vector.Element} element Element to check.
 @return {boolean} Is there such element in stage or not.
 */
acgraph.vector.Stage.prototype.hasChild = function(element) {
  // Delegate to root layer
  return this.rootLayer_.hasChild(element);
};


/**
 Returns index of a child.
 Similar to {@link acgraph.vector.Layer#indexOfChild}
 @param {acgraph.vector.Element} element Element.
 @return {number} Index or -1.
 */
acgraph.vector.Stage.prototype.indexOfChild = function(element) {
  // Delegate to root layer
  return this.rootLayer_.indexOfChild(element);
};


/**
 Swaps two children.
 Similar to {@link acgraph.vector.Layer#swapChildren}
 @param {acgraph.vector.Element} element1 First child.
 @param {acgraph.vector.Element} element2 Second child.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.swapChildren = function(element1, element2) {
  this.rootLayer_.swapChildren(element1, element2);
  return this;
};


/**
 Swaps two children.
 Similar to {@link acgraph.vector.Layer#swapChildrenAt}
 @param {number} index1 First child or id.
 @param {number} index2 Second child or id.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.swapChildrenAt = function(index1, index2) {
  this.rootLayer_.swapChildrenAt(index1, index2);
  return this;
};


/**
 Applies function to all children.
 Similar to {@link acgraph.vector.Layer#forEachChild}
 @param {function(acgraph.vector.Element):void} callback Callback.
 @param {Object=} opt_this This element.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.forEachChild = function(callback, opt_this) {
  // Delegate to root layer
  this.rootLayer_.forEachChild(callback, opt_this);
  return this;
};


//endregion
//region --- Transformations
//------------------------------------------------------------------------------
//
//  Transformations
//
//------------------------------------------------------------------------------
/**
 Rotates root layer.<br/>
 Read more at: {@link acgraph.vector.Element#rotate}.
 @param {number} degrees Rotation angle.
 @param {number=} opt_cx Rotaion X.
 @param {number=} opt_cy Rotaion Y.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.rotate = function(degrees, opt_cx, opt_cy) {
  this.rootLayer_.rotate(degrees, opt_cx, opt_cy);
  return this;
};


/**
 Rotates root layer around an anchor.<br/>
 Read more at: {@link acgraph.vector.Element#rotateByAnchor}.
 @param {number} degrees Rotation angle.
 @param {(acgraph.vector.Anchor|string)=} opt_anchor Rotation anchor.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.rotateByAnchor = function(degrees, opt_anchor) {
  this.rootLayer_.rotateByAnchor(degrees, opt_anchor);
  return this;
};


/**
 Rotates root layer around a point.<br/>
 Read more at: {@link acgraph.vector.Element#setRotation}.
 @param {number} degrees Rotation angle.
 @param {number=} opt_cx Rotation X.
 @param {number=} opt_cy Rotation Y.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.setRotation = function(degrees, opt_cx, opt_cy) {
  this.rootLayer_.setRotation(degrees, opt_cx, opt_cy);
  return this;
};


/**
 Rotates root layer around an anchor.<br/>
 Read more at: {@link acgraph.vector.Element#setRotationByAnchor}.
 @param {number} degrees Rotation angle.
 @param {(acgraph.vector.Anchor|string)=} opt_anchor Rotation anchor.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.setRotationByAnchor = function(degrees, opt_anchor) {
  this.rootLayer_.setRotationByAnchor(degrees, opt_anchor);
  return this;
};


/**
 Moves root layer taking transformation into account.
 Movement happens in root layer coordinates.<br/>
 Read more at: {@link acgraph.vector.Element#translate}.
 @param {number} tx X offset.
 @param {number} ty Y offset.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.translate = function(tx, ty) {
  this.rootLayer_.translate(tx, ty);
  return this;
};


/**
 Sets top left corner coordinates of root layer (with transformation,
 in parent coordinate system).<br/>
 Read more at: {@link acgraph.vector.Element#setPosition}.
 @param {number} x X of top left corner.
 @param {number} y Y of top left corner.
 @return {!acgraph.vector.Stage} Returns self for chaining.
 */
acgraph.vector.Stage.prototype.setPosition = function(x, y) {
  this.rootLayer_.setPosition(x, y);
  return this;
};


/**
 Scales root layer in parent coordinates system. Scaling center is set in the parent system too.<br/>
 Read more at: {@link acgraph.vector.Element#scale}.
 @param {number} sx Scale X.
 @param {number} sy Scale Y.
 @param {number=} opt_cx Scale center X.
 @param {number=} opt_cy Scale center Y.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.scale = function(sx, sy, opt_cx, opt_cy) {
  this.rootLayer_.scale(sx, sy, opt_cx, opt_cy);
  return this;
};


/**
 Scales root layer in parent coordinates system. Scaling center is set
 by root layer anchor.<br/>
 Read more at: {@link acgraph.vector.Element#scaleByAnchor}.
 @param {number} sx Scale X.
 @param {number} sy Scale Y.
 @param {(acgraph.vector.Anchor|string)=} opt_anchor Scaling center anchor.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.scaleByAnchor = function(sx, sy, opt_anchor) {
  this.rootLayer_.scaleByAnchor(sx, sy, opt_anchor);
  return this;
};


/**
 Combines current transformation with another. Combination is done by
 multiplying matrix to the right.<br/>
 Read more at: {@link acgraph.vector.Element#appendTransformationMatrix}.
 @param {number} m00 Scale X.
 @param {number} m10 Shear Y.
 @param {number} m01 Shear X.
 @param {number} m11 Scale Y.
 @param {number} m02 Translate X.
 @param {number} m12 Translate Y.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.appendTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.rootLayer_.appendTransformationMatrix(m00, m10, m01, m11, m02, m12);
  return this;
};


/**
 Sets transformation matrix.<br/>
 Read more at: {@link acgraph.vector.Element#setTransformationMatrix}.
 @param {number} m00 Scale X.
 @param {number} m10 Shear Y.
 @param {number} m01 Shear X.
 @param {number} m11 Scale Y.
 @param {number} m02 Translate X.
 @param {number} m12 Translate Y.
 @return {!acgraph.vector.Stage} {@link acgraph.vector.Stage} for method chaining.
 */
acgraph.vector.Stage.prototype.setTransformationMatrix = function(m00, m10, m01, m11, m02, m12) {
  this.rootLayer_.setTransformationMatrix(m00, m10, m01, m11, m02, m12);
  return this;
};


/**
 Returns rotation angle in degrees.<br/>
 Read more at: {@link acgraph.vector.Element#getRotationAngle}.
 @return {number} Rotation angle.
 */
acgraph.vector.Stage.prototype.getRotationAngle = function() {
  return this.rootLayer_.getRotationAngle();
};


/**
 Returns current transformation matrix: [
 {number} m00 Scale X.
 {number} m10 Shear Y.
 {number} m01 Shear X.
 {number} m11 Scale Y.
 {number} m02 Translate X.
 {number} m12 Translate Y.
 ]<br/>
 Read more at: {@link acgraph.vector.Element#getTransformationMatrix}.
 @return {Array.<number>} Transformation matrix.
 */
acgraph.vector.Stage.prototype.getTransformationMatrix = function() {
  return this.rootLayer_.getTransformationMatrix();
};


/**
 * Retirns full transformation (own and parent concatenated) which is always null.
 * @return {goog.math.AffineTransform} Full transformation.
 */
acgraph.vector.Stage.prototype.getFullTransformation = function() {
  return null;
};


//endregion
//region --- Events management
//------------------------------------------------------------------------------
//
//  Events management
//
//------------------------------------------------------------------------------
/**
 * Dispatches an event (or event like object) and calls all listeners
 * listening for events of this type. The type of the event is decided by the
 * type property on the event object.
 *
 * If any of the listeners returns false OR calls preventDefault then this
 * function will return false.  If one of the capture listeners calls
 * stopPropagation, then the bubble listeners won't fire.
 *
 * @param {goog.events.EventLike} e Event object.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false) this will also return false.
 */
acgraph.vector.Stage.prototype.dispatchEvent = function(e) {
  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = e.toLowerCase();
  } else if ('type' in e) {
    e.type = String(e.type).toLowerCase();
  }
  return goog.base(this, 'dispatchEvent', e);
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned. Note that if the existing listener is a one-off listener
 * (registered via listenOnce), it will no longer be a one-off
 * listener after a call to listen().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
acgraph.vector.Stage.prototype.listen = function(type, listener, opt_useCapture, opt_listenerScope) {
  return /** @type {!goog.events.ListenableKey} */(goog.base(this, 'listen', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};


/**
 * Adds an event listener that is removed automatically after the
 * listener fired once.
 *
 * If an existing listener already exists, listenOnce will do
 * nothing. In particular, if the listener was previously registered
 * via listen(), listenOnce() will not turn the listener into a
 * one-off listener. Similarly, if there is already an existing
 * one-off listener, listenOnce does not modify the listeners (it is
 * still a once listener).
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {!goog.events.ListenableKey} Unique key for the listener.
 * @template SCOPE,EVENTOBJ
 */
acgraph.vector.Stage.prototype.listenOnce = function(type, listener, opt_useCapture, opt_listenerScope) {
  return /** @type {!goog.events.ListenableKey} */(goog.base(this, 'listenOnce', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope));
};


/**
 * Removes an event listener which was added with listen() or listenOnce().
 *
 * @param {!goog.events.EventId.<EVENTOBJ>|string} type The event type id.
 * @param {function(this:SCOPE, EVENTOBJ):(boolean|undefined)} listener Callback
 *     method.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {SCOPE=} opt_listenerScope Object in whose scope to call
 *     the listener.
 * @return {boolean} Whether any listener was removed.
 * @template SCOPE,EVENTOBJ
 */
acgraph.vector.Stage.prototype.unlisten = function(type, listener, opt_useCapture, opt_listenerScope) {
  return goog.base(this, 'unlisten', String(type).toLowerCase(), listener, opt_useCapture, opt_listenerScope);
};


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen().
 *
 * @param {goog.events.ListenableKey} key The key returned by
 *     listen() or listenOnce().
 * @return {boolean} Whether any listener was removed.
 */
acgraph.vector.Stage.prototype.unlistenByKey;


/**
 * Removes all listeners from this listenable. If type is specified,
 * it will only remove listeners of the particular type. otherwise all
 * registered listeners will be removed.
 *
 * @param {string=} opt_type Type of event to remove, default is to
 *     remove all types.
 * @return {number} Number of listeners removed.
 */
acgraph.vector.Stage.prototype.removeAllListeners = function(opt_type) {
  if (goog.isDef(opt_type)) opt_type = String(opt_type).toLowerCase();
  return goog.base(this, 'removeAllListeners', opt_type);
};


/**
 * Events redispatcher.
 * @param {goog.events.BrowserEvent} e
 * @private
 */
acgraph.vector.Stage.prototype.handleMouseEvent_ = function(e) {
  var event = new acgraph.events.BrowserEvent(e, this);
  if (event['target'] instanceof acgraph.vector.Element) {
    var el = /** @type {acgraph.vector.Element} */(event['target']);
    el.dispatchEvent(event);
    var type = event['type'];
    if (event.defaultPrevented) e.preventDefault();
    // we do the binding and unbinding of event only if relatedTarget doesn't belong to the same stage
    if (!(event['relatedTarget'] instanceof acgraph.vector.Element) ||
        (/** @type {acgraph.vector.Element} */(event['relatedTarget'])).getStage() != this) {
      if (type == acgraph.events.EventType.MOUSEOVER) {
        this.eventHandler_.listen(goog.dom.getDocument(), acgraph.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false);
      } else if (type == acgraph.events.EventType.MOUSEOUT) {
        this.eventHandler_.unlisten(goog.dom.getDocument(), acgraph.events.EventType.MOUSEMOVE, this.handleMouseEvent_, false);
      }
    }
    switch (type) {
      case acgraph.events.EventType.MOUSEDOWN:
        this.eventHandler_.listen(goog.dom.getDocument(), acgraph.events.EventType.MOUSEUP, this.handleMouseEvent_, false);
        break;
      case acgraph.events.EventType.MOUSEUP:
        this.eventHandler_.unlisten(goog.dom.getDocument(), acgraph.events.EventType.MOUSEUP, this.handleMouseEvent_, false);
        break;
      case acgraph.events.EventType.TOUCHSTART:
        this.eventHandler_.listen(goog.dom.getDocument(), acgraph.events.EventType.TOUCHMOVE, this.handleMouseEvent_, false);
        break;
      case acgraph.events.EventType.TOUCHEND:
        this.eventHandler_.unlisten(goog.dom.getDocument(), acgraph.events.EventType.TOUCHMOVE, this.handleMouseEvent_, false);
        break;
      case goog.events.EventType.POINTERDOWN:
        this.eventHandler_.listen(goog.dom.getDocument(), goog.events.EventType.POINTERMOVE, this.handleMouseEvent_, false);
        break;
      case goog.events.EventType.POINTERUP:
        this.eventHandler_.unlisten(goog.dom.getDocument(), goog.events.EventType.POINTERMOVE, this.handleMouseEvent_, false);
        break;
    }
  }
};


//endregion
//region --- Disposing and export
//------------------------------------------------------------------------------
//
//  Disposing and export
//
//------------------------------------------------------------------------------
/**
 Disposes Stage. Removes it from parent layer, nulls links, removes from DOM.
 */
acgraph.vector.Stage.prototype.dispose = function() {
  acgraph.vector.Stage.base(this, 'dispose');
};


/** @inheritDoc */
acgraph.vector.Stage.prototype.disposeInternal = function() {
  acgraph.vector.Stage.base(this, 'disposeInternal');

  goog.dispose(this.eventHandler_);
  this.eventHandler_ = null;

  goog.dispose(this.rootLayer_);
  this.renderInternal();
  delete this.rootLayer_;

  goog.dispose(this.defs_);
  delete this.defs_;

  acgraph.unregister(this);

  goog.dom.removeNode(this.internalContainer_);
  this.container_ = null;
  delete this.internalContainer_;
  this.domElement_ = null;

  if (this.credits_) {
    this.credits_.dispose();
    this.credits_ = null;
  }
};


//exports
/** @suppress {deprecated} */
(function() {
  var proto = acgraph.vector.Stage.prototype;
  goog.exportSymbol('acgraph.vector.Stage', acgraph.vector.Stage);
  proto['id'] = proto.id;
  proto['container'] = proto.container;
  proto['getContainerElement'] = proto.getContainerElement;
  proto['getDomWrapper'] = proto.getDomWrapper;
  proto['maxResizeDelay'] = proto.maxResizeDelay;
  proto['dispose'] = proto.dispose;
  proto['getBounds'] = proto.getBounds;
  proto['layer'] = proto.layer;
  proto['unmanagedLayer'] = proto.unmanagedLayer;
  proto['circle'] = proto.circle;
  proto['ellipse'] = proto.ellipse;
  proto['rect'] = proto.rect;
  proto['truncatedRect'] = proto.truncatedRect;
  proto['roundedRect'] = proto.roundedRect;
  proto['roundedInnerRect'] = proto.roundedInnerRect;
  proto['path'] = proto.path;
  proto['star'] = proto.star;
  proto['star4'] = proto.star4;
  proto['star5'] = proto.star5;
  proto['star6'] = proto.star6;
  proto['star7'] = proto.star7;
  proto['star10'] = proto.star10;
  proto['diamond'] = proto.diamond;
  proto['triangleUp'] = proto.triangleUp;
  proto['triangleDown'] = proto.triangleDown;
  proto['triangleRight'] = proto.triangleRight;
  proto['triangleLeft'] = proto.triangleLeft;
  proto['cross'] = proto.cross;
  proto['diagonalCross'] = proto.diagonalCross;
  proto['hLine'] = proto.hLine;
  proto['vLine'] = proto.vLine;
  proto['pie'] = proto.pie;
  proto['donut'] = proto.donut;
  proto['text'] = proto.text;
  proto['html'] = proto.html;
  proto['image'] = proto.image;
  proto['data'] = proto.data;
  proto['saveAsPNG'] = proto.saveAsPng;
  proto['saveAsJPG'] = proto.saveAsJpg;
  proto['saveAsPDF'] = proto.saveAsPdf;
  proto['saveAsSVG'] = proto.saveAsSvg;
  proto['saveAsPng'] = proto.saveAsPng;
  proto['saveAsJpg'] = proto.saveAsJpg;
  proto['saveAsPdf'] = proto.saveAsPdf;
  proto['saveAsSvg'] = proto.saveAsSvg;
  proto['shareAsPng'] = proto.shareAsPng;
  proto['shareAsJpg'] = proto.shareAsJpg;
  proto['shareAsPdf'] = proto.shareAsPdf;
  proto['shareAsSvg'] = proto.shareAsSvg;
  proto['getPngBase64String'] = proto.getPngBase64String;
  proto['getJpgBase64String'] = proto.getJpgBase64String;
  proto['getSvgBase64String'] = proto.getSvgBase64String;
  proto['getPdfBase64String'] = proto.getPdfBase64String;
  proto['print'] = proto.print;
  proto['toSvg'] = proto.toSvg;
  proto['pattern'] = proto.pattern;
  proto['hatchFill'] = proto.hatchFill;
  proto['clearDefs'] = proto.clearDefs;
  proto['numChildren'] = proto.numChildren;
  proto['addChild'] = proto.addChild;
  proto['addChildAt'] = proto.addChildAt;
  proto['removeChild'] = proto.removeChild;
  proto['removeChildAt'] = proto.removeChildAt;
  proto['removeChildren'] = proto.removeChildren;
  proto['swapChildren'] = proto.swapChildren;
  proto['swapChildrenAt'] = proto.swapChildrenAt;
  proto['getChildAt'] = proto.getChildAt;
  proto['hasChild'] = proto.hasChild;
  proto['forEachChild'] = proto.forEachChild;
  proto['indexOfChild'] = proto.indexOfChild;
  proto['getX'] = proto.getX;
  proto['getY'] = proto.getY;
  proto['width'] = proto.width;
  proto['height'] = proto.height;
  proto['getBounds'] = proto.getBounds;
  proto['resize'] = proto.resize;
  proto['asyncMode'] = proto.asyncMode;
  proto['resume'] = proto.resume;
  proto['suspend'] = proto.suspend;
  proto['isRendering'] = proto.isRendering;
  proto['isSuspended'] = proto.isSuspended;
  proto['remove'] = proto.remove;
  proto['domElement'] = proto.domElement;
  proto['visible'] = proto.visible;
  proto['rotate'] = proto.rotate;
  proto['rotateByAnchor'] = proto.rotateByAnchor;
  proto['setRotation'] = proto.setRotation;
  proto['setRotationByAnchor'] = proto.setRotationByAnchor;
  proto['translate'] = proto.translate;
  proto['setPosition'] = proto.setPosition;
  proto['scale'] = proto.scale;
  proto['scaleByAnchor'] = proto.scaleByAnchor;
  proto['appendTransformationMatrix'] = proto.appendTransformationMatrix;
  proto['setTransformationMatrix'] = proto.setTransformationMatrix;
  proto['getRotationAngle'] = proto.getRotationAngle;
  proto['getTransformationMatrix'] = proto.getTransformationMatrix;
  proto['clip'] = proto.clip;
  proto['createClip'] = proto.createClip;
  proto['parent'] = proto.parent;
  proto['getStage'] = proto.getStage;
  proto['listen'] = proto.listen;
  proto['listenOnce'] = proto.listenOnce;
  proto['unlisten'] = proto.unlisten;
  proto['unlistenByKey'] = proto.unlistenByKey;
  proto['removeAllListeners'] = proto.removeAllListeners;
  proto['title'] = proto.title;
  proto['desc'] = proto.desc;
  goog.exportSymbol('acgraph.events.EventType.RENDER_START', acgraph.vector.Stage.EventType.RENDER_START);
  goog.exportSymbol('acgraph.events.EventType.RENDER_FINISH', acgraph.vector.Stage.EventType.RENDER_FINISH);
  goog.exportSymbol('acgraph.vector.Stage.EventType.STAGE_RESIZE', acgraph.vector.Stage.EventType.STAGE_RESIZE);
  goog.exportSymbol('acgraph.vector.Stage.EventType.STAGE_RENDERED', acgraph.vector.Stage.EventType.STAGE_RENDERED);
})();
//endregion
