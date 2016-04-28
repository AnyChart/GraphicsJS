goog.provide('acgraph.events');
goog.provide('acgraph.events.EventType');

goog.require('goog.events');

/**
 * A namespace of all global functions of the ACGraph event model.
 * @namespace
 * @name acgraph.events
 */


/**
 * Adds an event listener for an event to a DOM node or to an implementing object.
 * {@link goog.events.EventTarget}. The listener can be added to an object once, and if it is added one more time,
 * its key will be returned.<br/>
 * <b>Note</b> Notice that if the existing listener is one-off (added
 * using listenOnce), it will cease to be such after calling the listen() method.
 * @param {goog.events.ListenableType} src The object to attach the event listener to.
 * @param {string|Array.<string>} type The type of event or the array of types.
 * @param {((function(?):?)|{handleEvent:(function(?):?)}|null)} listener The event listener or the object with the handleEvent function.
 * @param {boolean=} opt_capt [false] Calls event handling in the capture phase (“false” by default).
 * @param {Object=} opt_handler The element in scope of which the listener is called.
 * @return {goog.events.Key} The unique key for the event listener.
 */
acgraph.events.listen = goog.events.listen;


/**
 * Adds an event listener for a certain event to a DOM node or to an implementing object.
 * {@link goog.events.EventTarget}. <b>After the event is called, its handler will be deleted.</b><br>
 * If the event handler being added already exists, listenOnce will do nothing. <br/>
 * <b>Note</b> In particular, if the handler is already registered using listen(), listenOnce()
 * <b>will not</b> make it one-off. Similarly, if a one-off listener already exists,
 * listenOnce will not change it (it wil remain one-off).
 * @param {goog.events.ListenableType} src The object to attach the event listener to.
 * @param {string|Array.<string>} type The type of event or the array of types.
 * @param {((function(?):?)|{handleEvent:(function(?):?)}|null)} listener The event listener.
 * @param {boolean=} opt_capt [false] Calls event handling in the capture phase.
 * @param {Object=} opt_handler The element in scope of which the listener is called.
 * @return {goog.events.Key} The unique key for the event listener.
 */
acgraph.events.listenOnce = goog.events.listenOnce;


/**
 * Removes a listener added using listen() or listenOnce() methods.
 * @param {goog.events.ListenableType} src The object on which to stop listening to the event.
 * @param {string|Array.<string>} type The type of event or the array of types of events you want to stop listening to.
 * @param {((function(?):?)|{handleEvent:(function(?):?)}|null)} listener The listener to be removed.
 * @param {boolean=} opt_capt In DOM-compatible browsers this parameter defines if the listener is called in the capture or in the bubble phase of the event.
 * @param {Object=} opt_handler The element in scope of which the listener is called.
 * @return {?boolean} Shows if the removed listener existed.
 */
acgraph.events.unlisten = goog.events.unlisten;


/**
 * Removes an event listener which was added with listen() by the key
 * returned by listen() or listenOnce().
 * @param {goog.events.Key} key The key returned by listen() for this
 *     event listener.
 * @return {boolean} indicating whether the listener was there to remove.
 */
acgraph.events.unlistenByKey = goog.events.unlistenByKey;


/**
 * Removes all listeners from an object. You can also optionally
 * remove listeners of some particular type.
 * @param {goog.events.ListenableType} obj Object to remove listeners from.
 * @param {string=} opt_type Type of event to be removed, default is all types.
 * @return {number} Number of listeners removed.
 */
acgraph.events.removeAll = goog.events.removeAll;


/**
 * Constants for event names.
 * @enum {string}
 */
acgraph.events.EventType = {
  /** Fires on click on an element. */
  CLICK: 'click',

  /** Fires on double click on an element. */
  DBLCLICK: 'dblclick',

  /** Fires when the mouse is down on an element. */
  MOUSEDOWN: 'mousedown',

  /** Fires when the mouse is up on an element. */
  MOUSEUP: 'mouseup',

  /** Fires when the mouse pointer is over an element. */
  MOUSEOVER: 'mouseover',

  /** Fires when the mouse pointer is out of an element. */
  MOUSEOUT: 'mouseout',

  /** Fires when mouse is moved on an element. */
  MOUSEMOVE: 'mousemove',

  /** Fires on touchstart. */
  TOUCHSTART: 'touchstart',

  /** Fires on touchmove. */
  TOUCHMOVE: 'touchmove',

  /** Fires on touchend. */
  TOUCHEND: 'touchend',

  /**
   * Fires when the touch is cancelled.
   * @see http://www.w3.org/TR/2011/WD-touch-events-20110505/#the-touchcancel-event
   */
  TOUCHCANCEL: 'touchcancel',

  /** Fires on tap (fast touchstart - touchend). */
  TAP: 'tap',

  // The drag action was canceled before the START event. Possible reasons:
  // disabled dragger, dragging with the right mouse button or releasing the
  // button before reaching the hysteresis distance.
  /** Fires if drag action was canceled before the START event. */
  DRAG_EARLY_CANCEL: 'earlycancel',

  /** Fires before drag. */
  DRAG_BEFORE: 'beforedrag',

  /** Fires on drag. */
  DRAG: 'drag',

  /** Fires on drag start. */
  DRAG_START: 'start',

  /** Fires on drag end. */
  DRAG_END: 'end',

  CONTEXTMENU: 'contextmenu'
};

//exports
goog.exportSymbol('acgraph.events.listen', acgraph.events.listen);
goog.exportSymbol('acgraph.events.listenOnce', acgraph.events.listenOnce);
goog.exportSymbol('acgraph.events.unlisten', acgraph.events.unlisten);
goog.exportSymbol('acgraph.events.unlistenByKey', acgraph.events.unlistenByKey);
goog.exportSymbol('acgraph.events.removeAll', acgraph.events.removeAll);
goog.exportSymbol('acgraph.events.EventType.CLICK', acgraph.events.EventType.CLICK);
goog.exportSymbol('acgraph.events.EventType.DBLCLICK', acgraph.events.EventType.DBLCLICK);
goog.exportSymbol('acgraph.events.EventType.MOUSEUP', acgraph.events.EventType.MOUSEUP);
goog.exportSymbol('acgraph.events.EventType.MOUSEDOWN', acgraph.events.EventType.MOUSEDOWN);
goog.exportSymbol('acgraph.events.EventType.MOUSEOVER', acgraph.events.EventType.MOUSEOVER);
goog.exportSymbol('acgraph.events.EventType.MOUSEOUT', acgraph.events.EventType.MOUSEOUT);
goog.exportSymbol('acgraph.events.EventType.MOUSEMOVE', acgraph.events.EventType.MOUSEMOVE);
goog.exportSymbol('acgraph.events.EventType.TOUCHSTART', acgraph.events.EventType.TOUCHSTART);
goog.exportSymbol('acgraph.events.EventType.TOUCHEND', acgraph.events.EventType.TOUCHEND);
goog.exportSymbol('acgraph.events.EventType.TOUCHCANCEL', acgraph.events.EventType.TOUCHCANCEL);
goog.exportSymbol('acgraph.events.EventType.TOUCHMOVE', acgraph.events.EventType.TOUCHMOVE);
goog.exportSymbol('acgraph.events.EventType.TAP', acgraph.events.EventType.TAP);
goog.exportSymbol('acgraph.events.EventType.DRAG', acgraph.events.EventType.DRAG);
goog.exportSymbol('acgraph.events.EventType.DRAG_START', acgraph.events.EventType.DRAG_START);
goog.exportSymbol('acgraph.events.EventType.DRAG_END', acgraph.events.EventType.DRAG_END);
goog.exportSymbol('acgraph.events.EventType.DRAG_EARLY_CANCEL', acgraph.events.EventType.DRAG_EARLY_CANCEL);
goog.exportSymbol('acgraph.events.EventType.DRAG_BEFORE', acgraph.events.EventType.DRAG_BEFORE);
