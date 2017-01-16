goog.provide('acgraph.events.BrowserEvent');

goog.require('goog.events.Event');



/**
 * Encapsulates browser event for acgraph.
 * @param {goog.events.BrowserEvent} e Type or normalized browser event or event
 *     arguments hash map to initialize this event.
 * @param {acgraph.vector.Stage} stage The stage.
 * @constructor
 * @extends {goog.events.Event}
 */
acgraph.events.BrowserEvent = function(e, stage) {
  goog.base(this, e.type);

  this['target'] = acgraph.getWrapperForDOM(/** @type {Element} **/(e.target), stage) || e.target;
  this['relatedTarget'] = acgraph.getWrapperForDOM(/** @type {Element} **/(e.relatedTarget || null), stage) || e.relatedTarget;
  this['offsetX'] = e.offsetX;
  this['offsetY'] = e.offsetY;
  this['clientX'] = e.clientX;
  this['clientY'] = e.clientY;
  this['screenX'] = e.screenX;
  this['screenY'] = e.screenY;
  this['button'] = e.isButton(goog.events.BrowserEvent.MouseButton.LEFT) ?
      acgraph.events.BrowserEvent.MouseButton.LEFT :
      e.isButton(goog.events.BrowserEvent.MouseButton.MIDDLE) ?
          acgraph.events.BrowserEvent.MouseButton.MIDDLE :
          e.isButton(goog.events.BrowserEvent.MouseButton.RIGHT) ?
              acgraph.events.BrowserEvent.MouseButton.RIGHT :
              acgraph.events.BrowserEvent.MouseButton.NONE;
  this['actionButton'] = e.isMouseActionButton();
  this['keyCode'] = e.keyCode;
  this['charCode'] = e.charCode;
  this['ctrlKey'] = e.ctrlKey;
  this['altKey'] = e.altKey;
  this['shiftKey'] = e.shiftKey;
  this['metaKey'] = e.metaKey;
  this['platformModifierKey'] = e.platformModifierKey;
  /**
   * Goog browser event.
   * @type {goog.events.BrowserEvent}
   * @private
   */
  this.event_ = e;
};
goog.inherits(acgraph.events.BrowserEvent, goog.events.Event);


/**
 * Normalized button constants for the mouse.
 * @enum {string}
 */
acgraph.events.BrowserEvent.MouseButton = {
  LEFT: 'left',
  MIDDLE: 'middle',
  RIGHT: 'right',
  NONE: 'none'
};


/**
 * Prevents DOM event default action.
 */
acgraph.events.BrowserEvent.prototype.preventDefault = function() {
  goog.base(this, 'preventDefault');
  this.event_.preventDefault();
};


/**
 * Stops both DOM and wrapper event propagation.
 */
acgraph.events.BrowserEvent.prototype.stopPropagation = function() {
  goog.base(this, 'stopPropagation');
  this.event_.stopPropagation();
};


/**
 * Stops event propagation (doesn't stop original DOM event propagation).
 */
acgraph.events.BrowserEvent.prototype.stopWrapperPropagation = function() {
  goog.events.Event.prototype.stopPropagation.call(this);
};


/**
 * Whether this has an "action"-producing mouse button.
 *
 * By definition, this includes left-click on windows/linux, and left-click
 * without the ctrl key on Macs.
 *
 * @return {boolean} The result.
 */
acgraph.events.BrowserEvent.prototype.isMouseActionButton = function() {
  return this.event_.isMouseActionButton();
};


/**
 * Returns original event.
 * @return {goog.events.BrowserEvent}
 */
acgraph.events.BrowserEvent.prototype.getOriginalEvent = function() {
  return this.event_;
};

//exports
(function() {
  var proto = acgraph.events.BrowserEvent.prototype;
  proto['stopPropagation'] = proto.stopPropagation;
  proto['stopWrapperPropagation'] = proto.stopWrapperPropagation;
  proto['preventDefault'] = proto.preventDefault;
})();
