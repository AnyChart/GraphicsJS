goog.provide('acgraph.events.DragEvent');
goog.provide('acgraph.events.Dragger');

goog.require('acgraph.math.Rect');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * A class that allows mouse or touch-based dragging (moving) of an element
 *
 * @param {acgraph.vector.Element} target The element that will be dragged.
 * @param {Element=} opt_handle An optional handle to control the drag, if null
 *     the target is used.
 * @param {acgraph.math.Rect=} opt_limits Object containing left, top, width,
 *     and height.
 *
 * @extends {goog.events.EventTarget}
 * @constructor
 */
acgraph.events.Dragger = function(target, opt_handle, opt_limits) {
  goog.events.EventTarget.call(this);
  this.acelement = target;
  var parent = this.acelement.parent();
  this.parentTx_ = parent ? parent.getFullTransformation() : null;
  this.reversiveParentTx_ = this.parentTx_ ? this.parentTx_.createInverse() : null;
  this.target = this.acelement.domElement();
  this.handle = opt_handle || this.target;
  this.limits = opt_limits || new goog.math.Rect(NaN, NaN, NaN, NaN);

  this.document_ = goog.dom.getOwnerDocument(this.target);
  this.eventHandler_ = new goog.events.EventHandler(this);
  this.registerDisposable(this.eventHandler_);

  // Add listener. Do not use the event handler here since the event handler is
  // used for listeners added and removed during the drag operation.
  acgraph.events.listen(this.handle,
      [acgraph.events.EventType.TOUCHSTART, acgraph.events.EventType.MOUSEDOWN],
      this.startDrag, false, this);
};
goog.inherits(acgraph.events.Dragger, goog.events.EventTarget);


/**
 * Whether setCapture is supported by the browser.
 * @type {boolean}
 * @private
 */
acgraph.events.Dragger.HAS_SET_CAPTURE_ =
    // IE and Gecko after 1.9.3 has setCapture
    // WebKit does not yet: https://bugs.webkit.org/show_bug.cgi?id=27330
    goog.userAgent.IE ||
    goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9.3');


/**
 * Reference to drag target element.
 * @type {Element}
 */
acgraph.events.Dragger.prototype.target;


/**
 * Reference to the handler that initiates the drag.
 * @type {Element}
 */
acgraph.events.Dragger.prototype.handle;


/**
 * Object representing the limits of the drag region.
 * @type {acgraph.math.Rect}
 */
acgraph.events.Dragger.prototype.limits;


/**
 * Whether the element is rendered right-to-left. We initialize this lazily.
 * @type {boolean|undefined}
 * @private
 */
acgraph.events.Dragger.prototype.rightToLeft_;


/**
 * Current x position of mouse or touch relative to viewport.
 * @type {number}
 */
acgraph.events.Dragger.prototype.clientX = 0;


/**
 * Current y position of mouse or touch relative to viewport.
 * @type {number}
 */
acgraph.events.Dragger.prototype.clientY = 0;


/**
 * The x position where the first mousedown or touchstart occurred.
 * @type {number}
 */
acgraph.events.Dragger.prototype.startX = 0;


/**
 * The y position where the first mousedown or touchstart occurred.
 * @type {number}
 */
acgraph.events.Dragger.prototype.startY = 0;


/**
 * Current x position of drag relative to target's parent.
 * @type {number}
 */
acgraph.events.Dragger.prototype.deltaX = 0;


/**
 * Current y position of drag relative to target's parent.
 * @type {number}
 */
acgraph.events.Dragger.prototype.deltaY = 0;


/**
 * The current page scroll value.
 * @type {goog.math.Coordinate}
 */
acgraph.events.Dragger.prototype.pageScroll;


/**
 * Whether dragging is currently enabled.
 * @type {boolean}
 * @private
 */
acgraph.events.Dragger.prototype.enabled_ = true;


/**
 * Whether object is currently being dragged.
 * @type {boolean}
 * @private
 */
acgraph.events.Dragger.prototype.dragging_ = false;


/**
 * The amount of distance, in pixels, after which a mousedown or touchstart is
 * considered a drag.
 * @type {number}
 * @private
 */
acgraph.events.Dragger.prototype.hysteresisDistanceSquared_ = 0;


/**
 * Timestamp of when the mousedown or touchstart occurred.
 * @type {number}
 * @private
 */
acgraph.events.Dragger.prototype.mouseDownTime_ = 0;


/**
 * Reference to a document object to use for the events.
 * @type {Document}
 * @private
 */
acgraph.events.Dragger.prototype.document_;


/**
 * The SCROLL event target used to make drag element follow scrolling.
 * @type {EventTarget}
 * @private
 */
acgraph.events.Dragger.prototype.scrollTarget_;


/**
 * Whether IE drag events cancelling is on.
 * @type {boolean}
 * @private
 */
acgraph.events.Dragger.prototype.ieDragStartCancellingOn_ = false;


/**
 * Whether the dragger implements the changes described in http://b/6324964,
 * making it truly RTL.  This is a temporary flag to allow clients to transition
 * to the new behavior at their convenience.  At some point it will be the
 * default.
 * @type {boolean}
 * @private
 */
acgraph.events.Dragger.prototype.useRightPositioningForRtl_ = false;


/**
 * Turns on/off true RTL behavior.  This should be called immediately after
 * construction.  This is a temporary flag to allow clients to transition
 * to the new component at their convenience.  At some point true will be the
 * default.
 * @param {boolean} useRightPositioningForRtl True if "right" should be used for
 *     positioning, false if "left" should be used for positioning.
 */
acgraph.events.Dragger.prototype.enableRightPositioningForRtl =
    function(useRightPositioningForRtl) {
  this.useRightPositioningForRtl_ = useRightPositioningForRtl;
};


/**
 * Returns the event handler, intended for subclass use.
 * @return {goog.events.EventHandler} The event handler.
 */
acgraph.events.Dragger.prototype.getHandler = function() {
  return this.eventHandler_;
};


/**
 * Sets (or reset) the Drag value after a Dragger is created.
 * @param {acgraph.math.Rect?} value Object containing left, top, width,
 *     height for new Dragger value. If target is right-to-left and
 *     enableRightPositioningForRtl(true) is called, then rect is interpreted as
 *     right, top, width, and height.
 */
acgraph.events.Dragger.prototype.setLimits = function(value) {
  this.limits = value || new acgraph.math.Rect(NaN, NaN, NaN, NaN);
};


/**
 * Sets/gets the distance the user has to drag the element before a drag operation is
 * started.
 * @param {number=} opt_value The number of pixels after which a mousedown and
 *     move is considered a drag.
 * @return {number|acgraph.events.Dragger} The number of pixels after which a mousedown and
 *     move is considered a drag or itself if opt_value defined.
 */
acgraph.events.Dragger.prototype.hysteresis = function(opt_value) {
  if (arguments.length == 1) {
    this.hysteresisDistanceSquared_ = Math.pow(opt_value, 2);
    return this;
  }
  return Math.sqrt(this.hysteresisDistanceSquared_);
};


/**
 * Sets the SCROLL event target to make drag element follow scrolling.
 *
 * @param {EventTarget} value The event target that dispatches SCROLL
 *     events.
 */
acgraph.events.Dragger.prototype.setScrollTarget = function(value) {
  this.scrollTarget_ = value;
};


/**
 * Enables cancelling of built-in IE drag events.
 * @param {boolean} value Whether to enable cancelling of IE
 *     dragstart event.
 */
acgraph.events.Dragger.prototype.setCancelIeDragStart = function(value) {
  this.ieDragStartCancellingOn_ = value;
};


/**
 * If opt_value defined set whether dragger is enabled otherwise returns enabled state.
 * @param {boolean=} opt_value Whether dragger is enabled.
 * @return {boolean|acgraph.events.Dragger} Whether the dragger is enabled or itself if opt_value defined.
 */
acgraph.events.Dragger.prototype.enabled = function(opt_value) {
  if (arguments.length == 1) {
    this.enabled_ = /** @type {boolean} */ (opt_value);
    return this;
  }
  return this.enabled_;
};


/** @override */
acgraph.events.Dragger.prototype.disposeInternal = function() {
  acgraph.events.Dragger.superClass_.disposeInternal.call(this);
  acgraph.events.unlisten(this.handle,
      [acgraph.events.EventType.TOUCHSTART, acgraph.events.EventType.MOUSEDOWN],
      this.startDrag, false, this);
  this.cleanUpAfterDragging_();

  this.target = null;
  this.handle = null;
};


/**
 * Whether the DOM element being manipulated is rendered right-to-left.
 * @return {boolean} True if the DOM element is rendered right-to-left, false
 *     otherwise.
 * @private
 */
acgraph.events.Dragger.prototype.isRightToLeft_ = function() {
  if (!goog.isDef(this.rightToLeft_)) {
    this.rightToLeft_ = goog.style.isRightToLeft(this.target);
  }
  return this.rightToLeft_;
};


/**
 * Event handler that is used to start the drag
 * @param {goog.events.BrowserEvent} e Event object.
 */
acgraph.events.Dragger.prototype.startDrag = function(e) {
  var isMouseDown = e.type == acgraph.events.EventType.MOUSEDOWN;
  //This mess can prevent cancellation of drag start.
  //todo: review
  e.preventDefault();

  // Dragger.startDrag() can be called by AbstractDragDrop with a mousemove
  // event and IE does not report pressed mouse buttons on mousemove. Also,
  // it does not make sense to check for the button if the user is already
  // dragging.

  if (this.enabled_ && !this.dragging_ && (!isMouseDown || e.isMouseActionButton())) {
    this.maybeReinitTouchEvent_(e);
    if (this.hysteresisDistanceSquared_ == 0) {
      if (this.fireDragStart_(e)) {
        this.dragging_ = true;
        e.preventDefault();
      } else {
        // If the start drag is cancelled, don't setup for a drag.
        return;
      }
    } else {
      // Need to preventDefault for hysteresis to prevent page getting selected.
      e.preventDefault();
    }
    this.setupDragHandlers();

    this.clientX = this.startX = e.clientX;
    this.clientY = this.startY = e.clientY;
    this.deltaX = this.acelement.getX();
    this.deltaY = this.acelement.getY();

    this.pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();

    this.mouseDownTime_ = goog.now();
  } else {
    this.dispatchEvent(acgraph.events.EventType.DRAG_EARLY_CANCEL);
  }
};


/**
 * Sets up event handlers when dragging starts.
 * @protected
 */
acgraph.events.Dragger.prototype.setupDragHandlers = function() {
  var doc = this.document_;
  var docEl = doc.documentElement;
  // Use bubbling when we have setCapture since we got reports that IE has
  // problems with the capturing events in combination with setCapture.
  var useCapture = !acgraph.events.Dragger.HAS_SET_CAPTURE_;

  this.eventHandler_.listen(doc,
      [acgraph.events.EventType.TOUCHMOVE, acgraph.events.EventType.MOUSEMOVE],
      this.handleMove_, useCapture);
  this.eventHandler_.listen(doc,
      [acgraph.events.EventType.TOUCHEND, acgraph.events.EventType.MOUSEUP],
      this.endDrag, useCapture);

  if (acgraph.events.Dragger.HAS_SET_CAPTURE_) {
    docEl.setCapture(false);
    this.eventHandler_.listen(docEl,
                              goog.events.EventType.LOSECAPTURE,
                              this.endDrag);
  } else {
    // Make sure we stop the dragging if the window loses focus.
    // Don't use capture in this listener because we only want to end the drag
    // if the actual window loses focus. Since blur events do not bubble we use
    // a bubbling listener on the window.
    this.eventHandler_.listen(goog.dom.getWindow(doc),
                              goog.events.EventType.BLUR,
                              this.endDrag);
  }

  if (goog.userAgent.IE && this.ieDragStartCancellingOn_) {
    // Cancel IE's 'ondragstart' event.
    this.eventHandler_.listen(doc, goog.events.EventType.DRAGSTART,
                              goog.events.Event.preventDefault);
  }

  if (this.scrollTarget_) {
    this.eventHandler_.listen(this.scrollTarget_, goog.events.EventType.SCROLL,
                              this.onScroll_, useCapture);
  }
};


/**
 * Fires a acgraph.events.EventType.DRAG_START event.
 * @param {goog.events.BrowserEvent} e Browser event that triggered the drag.
 * @return {boolean} False iff preventDefault was called on the DragEvent.
 * @private
 */
acgraph.events.Dragger.prototype.fireDragStart_ = function(e) {
  return this.acelement.dispatchEvent(new acgraph.events.DragEvent(
      acgraph.events.EventType.DRAG_START, this, e.clientX, e.clientY, e));
};


/**
 * Unregisters the event handlers that are only active during dragging, and
 * releases mouse capture.
 * @private
 */
acgraph.events.Dragger.prototype.cleanUpAfterDragging_ = function() {
  this.eventHandler_.removeAll();
  if (acgraph.events.Dragger.HAS_SET_CAPTURE_) {
    this.document_.releaseCapture();
  }
};


/**
 * Event handler that is used to end the drag.
 * @param {goog.events.BrowserEvent} e Event object.
 * @param {boolean=} opt_dragCanceled Whether the drag has been canceled.
 */
acgraph.events.Dragger.prototype.endDrag = function(e, opt_dragCanceled) {
  this.cleanUpAfterDragging_();

  if (this.dragging_) {
    this.maybeReinitTouchEvent_(e);
    this.dragging_ = false;

    var x = this.limitX(this.deltaX);
    var y = this.limitY(this.deltaY);
    var dragCanceled = opt_dragCanceled ||
        e.type == acgraph.events.EventType.TOUCHCANCEL;
    this.acelement.dispatchEvent(new acgraph.events.DragEvent(
        acgraph.events.EventType.DRAG_END, this, e.clientX, e.clientY, e, x, y,
        dragCanceled));
  } else {
    this.acelement.dispatchEvent(acgraph.events.EventType.DRAG_EARLY_CANCEL);
  }
};


/**
 * Re-initializes the event with the first target touch event or, in the case
 * of a stop event, the last changed touch.
 * @param {goog.events.BrowserEvent} e A TOUCH... event.
 * @private
 */
acgraph.events.Dragger.prototype.maybeReinitTouchEvent_ = function(e) {
  var type = e.type;

  if (type == acgraph.events.EventType.TOUCHSTART ||
      type == acgraph.events.EventType.TOUCHMOVE) {
    e.init(e.getBrowserEvent().targetTouches[0], e.currentTarget);
  } else if (type == acgraph.events.EventType.TOUCHEND ||
             type == acgraph.events.EventType.TOUCHCANCEL) {
    e.init(e.getBrowserEvent().changedTouches[0], e.currentTarget);
  }
};


/**
 * Event handler that is used on mouse / touch move to update the drag
 * @param {goog.events.BrowserEvent} e Event object.
 * @private
 */
acgraph.events.Dragger.prototype.handleMove_ = function(e) {
  if (this.enabled_) {
    this.maybeReinitTouchEvent_(e);
    // dx in right-to-left cases is relative to the right.
    var sign = this.useRightPositioningForRtl_ && this.isRightToLeft_() ? -1 : 1;
    var dx = sign * (e.clientX - this.clientX);
    var dy = e.clientY - this.clientY;
    this.clientX = e.clientX;
    this.clientY = e.clientY;

    if (!this.dragging_) {
      var diffX = this.startX - this.clientX;
      var diffY = this.startY - this.clientY;
      var distance = diffX * diffX + diffY * diffY;
      if (distance > this.hysteresisDistanceSquared_) {
        if (this.fireDragStart_(e)) {
          this.dragging_ = true;
        } else {
          // DragListGroup disposes of the dragger if BEFOREDRAGSTART is
          // canceled.
          if (!this.isDisposed()) {
            this.endDrag(e);
          }
          return;
        }
      }
    }

    var parent = this.acelement.parent();
    var tx = parent ? parent.getFullTransformation() : null;
    if (this.parentTx_ != tx) {
      this.parentTx_ = tx;
      this.reversiveParentTx_ = this.parentTx_ ? this.parentTx_.createInverse() : null;
    }

    this.calculatePosition_(dx, dy);

    if (this.dragging_) {
      var x = this.limitX(this.deltaX);
      var y = this.limitY(this.deltaY);
      var rv = this.acelement.dispatchEvent(new acgraph.events.DragEvent(
          acgraph.events.EventType.DRAG_BEFORE, this, e.clientX, e.clientY,
          e, x, y));

      // Only do the defaultAction and dispatch drag event if predrag didn't
      // prevent default
      if (rv) {
        this.doDrag(e, x, y, false);
        e.preventDefault();
      }
    }
  }
};


/**
 * Calculates the drag position.
 *
 * @param {number} dx The horizontal movement delta.
 * @param {number} dy The vertical movement delta.
 * @private
 */
acgraph.events.Dragger.prototype.calculatePosition_ = function(dx, dy) {
  // Update the position for any change in body scrolling
  var pageScroll = goog.dom.getDomHelper(this.document_).getDocumentScroll();
  dx += pageScroll.x - this.pageScroll.x;
  dy += pageScroll.y - this.pageScroll.y;
  this.pageScroll = pageScroll;

  if (this.reversiveParentTx_) {
    var point = [dx, dy, 0, 0];
    this.reversiveParentTx_.transform(point, 0, point, 0, 2);
    dx = point[0] - point[2];
    dy = point[1] - point[3];
  }

  this.deltaX += dx;
  this.deltaY += dy;
};


/**
 * Event handler for scroll target scrolling.
 * @param {goog.events.BrowserEvent} e The event.
 * @private
 */
acgraph.events.Dragger.prototype.onScroll_ = function(e) {
  this.calculatePosition_(0, 0);
  e.clientX = this.clientX;
  e.clientY = this.clientY;
  this.doDrag(e, this.limitX(this.deltaX), this.limitY(this.deltaY), true);
};


/**
 * @param {goog.events.BrowserEvent} e The closure object
 *     representing the browser event that caused a drag event.
 * @param {number} x The new horizontal position for the drag element.
 * @param {number} y The new vertical position for the drag element.
 * @param {boolean} dragFromScroll Whether dragging was caused by scrolling
 *     the associated scroll target.
 * @protected
 */
acgraph.events.Dragger.prototype.doDrag = function(e, x, y, dragFromScroll) {
  this.defaultAction(x, y);
  this.acelement.dispatchEvent(new acgraph.events.DragEvent(
      acgraph.events.EventType.DRAG, this, e.clientX, e.clientY, e, x, y));
};


/**
 * Returns the 'real' value after limits are applied (allows for some
 * limits to be undefined).
 * @param {number} value X-coordinate to limit.
 * @return {number} The 'real' X-coordinate after limits are applied.
 */
acgraph.events.Dragger.prototype.limitX = function(value) {
  var rect = this.limits;
  var left = !isNaN(rect.left) ? rect.left : null;
  var width = !isNaN(rect.width) ? rect.width : 0;
  var maxX = left != null ? left + width - this.acelement.getWidth() : Infinity;
  var minX = left != null ? left : -Infinity;
  return Math.min(maxX, Math.max(minX, value));
};


/**
 * Returns the 'real' value after limits are applied (allows for some
 * limits to be undefined).
 * @param {number} value Y-coordinate to limit.
 * @return {number} The 'real' Y-coordinate after limits are applied.
 */
acgraph.events.Dragger.prototype.limitY = function(value) {
  var rect = this.limits;
  var top = !isNaN(rect.top) ? rect.top : null;
  var height = !isNaN(rect.height) ? rect.height : 0;
  var maxY = top != null ? top + height - this.acelement.getHeight() : Infinity;
  var minY = top != null ? top : -Infinity;
  return Math.min(maxY, Math.max(minY, value));
};


/**
 * Overridable function for handling the default action of the drag behaviour.
 * Normally this is simply moving the element to x,y though in some cases it
 * might be used to resize the layer.  This is basically a shortcut to
 * implementing a default on drag event handler.
 * @param {number} x X-coordinate for target element. In right-to-left, x this
 *     is the number of pixels the target should be moved to from the right.
 * @param {number} y Y-coordinate for target element.
 */
acgraph.events.Dragger.prototype.defaultAction = function(x, y) {
  this.acelement.setPosition(x, y);
};


/**
 * @return {boolean} Whether the dragger is currently in the midst of a drag.
 */
acgraph.events.Dragger.prototype.isDragging = function() {
  return this.dragging_;
};



/**
 * Object representing a drag event
 * @param {string} type Event type.
 * @param {acgraph.events.Dragger} dragobj Drag object initiating event.
 * @param {number} clientX X-coordinate relative to the viewport.
 * @param {number} clientY Y-coordinate relative to the viewport.
 * @param {goog.events.BrowserEvent} browserEvent The closure object
 *   representing the browser event that caused this drag event.
 * @param {number=} opt_actX Optional actual x for drag if it has been limited.
 * @param {number=} opt_actY Optional actual y for drag if it has been limited.
 * @param {boolean=} opt_dragCanceled Whether the drag has been canceled.
 * @constructor
 * @extends {goog.events.Event}
 */
acgraph.events.DragEvent = function(type, dragobj, clientX, clientY, browserEvent, opt_actX, opt_actY, opt_dragCanceled) {
  goog.events.Event.call(this, type);

  /**
   * X-coordinate relative to the viewport
   * @type {number}
   */
  this.clientX = clientX;

  /**
   * Y-coordinate relative to the viewport
   * @type {number}
   */
  this.clientY = clientY;

  /**
   * The closure object representing the browser event that caused this drag
   * event.
   * @type {goog.events.BrowserEvent}
   */
  this.browserEvent = browserEvent;

  /**
   * The real x-position of the drag if it has been limited
   * @type {number}
   */
  this.left = goog.isDef(opt_actX) ? opt_actX : dragobj.deltaX;

  /**
   * The real y-position of the drag if it has been limited
   * @type {number}
   */
  this.top = goog.isDef(opt_actY) ? opt_actY : dragobj.deltaY;

  /**
   * Reference to the drag object for this event
   * @type {acgraph.events.Dragger}
   */
  this.dragger = dragobj;

  /**
   * Whether drag was canceled with this event. Used to differentiate between
   * a legitimate drag END that can result in an action and a drag END which is
   * a result of a drag cancelation. For now it can happen 1) with drag END
   * event on FireFox when user drags the mouse out of the window, 2) with
   * drag END event on IE7 which is generated on MOUSEMOVE event when user
   * moves the mouse into the document after the mouse button has been
   * released, 3) when TOUCHCANCEL is raised instead of TOUCHEND (on touch
   * events).
   * @type {boolean}
   */
  this.dragCanceled = !!opt_dragCanceled;
};
goog.inherits(acgraph.events.DragEvent, goog.events.Event);
