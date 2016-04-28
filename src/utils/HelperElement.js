goog.provide('acgraph.utils.HelperElement');
goog.provide('acgraph.utils.HelperElement.EventType');

goog.require('acgraph.events');
goog.require('goog.dom');
goog.require('goog.events.EventTarget');
goog.require('goog.style');
goog.require('goog.userAgent');



/**
 * This class can be used to monitor changes in container size.  Instances will
 * dispatch a {@code acgraph.utils.HelperElement.EventType.SIZECHANGE} event.
 * @param {acgraph.vector.Stage} stage
 * @param {Element} container Container in which iframe element is inserted.
 * @constructor
 * @extends {goog.events.EventTarget}
 */
acgraph.utils.HelperElement = function(stage, container) {
  goog.base(this);

  this.stage_ = stage;

  this.sizeElement_ = goog.dom.getDomHelper().createDom(
      'iframe', {
        'style': 'position:absolute; width:10%; height:10%; top: -99em; border-style:none; overflow:none;',
        'frameborder': '0',
        'tabIndex': -1,
        'aria-hidden': 'true'
      });

  this.handler_ = goog.bind(this.handleResize_, this);

  /**
   * @type {Element}
   * @private
   */
  this.form_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.formData_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.formDataType_ = null;

  /**
   * @type {Element}
   * @private
   */
  this.formResponseType_ = null;


  /**
   * @type {Object.<string, Element>}
   * @private
   */
  this.optInputsMaps_ = {};

  this.renderToContainer(container);
};
goog.inherits(acgraph.utils.HelperElement, goog.events.EventTarget);


/**
 * The event types that the ResizeMonitor fires.
 * @enum {string}
 */
acgraph.utils.HelperElement.EventType = {
  SIZECHANGE: 'sizechange'
};


/**
 * Render monitor element to value
 * @param {Element} value Container in which iframe element is inserted.
 */
acgraph.utils.HelperElement.prototype.renderToContainer = function(value) {
  if (!value) return;

  this.container_ = value;
  value.insertBefore(this.sizeElement_, value.firstChild);

  if (this.resizeTarget_)
    goog.events.unlisten(this.resizeTarget_, goog.events.EventType.RESIZE, this.handleResize_, false, this);

  if (this.resizeChecker_)
    clearInterval(this.resizeChecker_);

  //todo (blackart) plz don't remove it yet.
  //var rules = goog.cssom.getAllCssStyleRules();
  //var rule;
  //for (var i = 0, len = rules.length; i < len; i++) {
  //  rule = rules[i];
  //  if (rule.type == goog.cssom.CssRuleType.FONT_FACE) {
  //    if (!this.testDiv_) {
  //      this.testDiv_ = goog.dom.getDomHelper().createDom('span', {'style': 'position: absolute; top: -10000px; left: -10000px; border: 1px solid #000; display: inline-block; '});
  //      this.testDiv_.innerHTML = '0';
  //      value.insertBefore(this.testDiv_, value.firstChild);
  //    }
  //
  //    console.log({'style': 'font-family: ' + rule.style['fontFamily']});
  //    goog.style.setStyle(this.testDiv_, {'font-family': rule.style['fontFamily'], 'font-size': '30px'});
  //  }
  //}

  /**
   * The object that we listen to resize events on.
   * @type {Element|Window}
   * @private
   */
  var resizeTarget;

  try {
    resizeTarget = goog.dom.getFrameContentWindow(/** @type {HTMLIFrameElement} */ (this.sizeElement_));
    this.resizeTarget_ = resizeTarget;
  } catch (ignore) {
  }

  if (resizeTarget) {
    // We need to open and close the document to get Firefox 2 to work.  We must
    // not do this for IE in case we are using HTTPS since accessing the document
    // on an about:blank iframe in IE using HTTPS raises a Permission Denied
    // error.
    if (goog.userAgent.GECKO) {
      var doc = resizeTarget.document;
      doc.open();
      doc.close();
    }
    // Listen to resize event on the window inside the iframe.
    acgraph.events.listen(resizeTarget, goog.events.EventType.RESIZE, this.handleResize_, false, this);
  }

  // Check to resize event on the window inside the iframe.
  this.resizeChecker_ = setInterval(this.handler_, 200);
};


/**
 * Send form POST request on passed url with passed request params.
 * @param {string} url .
 * @param {string} data .
 * @param {string} dataType .
 * @param {string} responseType .
 * @param {Object.<string, *>=} opt_arguments .
 */
acgraph.utils.HelperElement.prototype.sendRequestToExportServer = function(url, data, dataType, responseType, opt_arguments) {
  if (!this.form_) {
    this.form_ = goog.dom.getDomHelper().createDom(goog.dom.TagName.FORM, {'method': 'POST'});
    this.formData_ = goog.dom.getDomHelper().createDom(goog.dom.TagName.INPUT, {'type': 'hidden', 'name': 'data'});
    this.formDataType_ = goog.dom.getDomHelper().createDom(goog.dom.TagName.INPUT, {'type': 'hidden', 'name': 'dataType'});
    this.formResponseType_ = goog.dom.getDomHelper().createDom(goog.dom.TagName.INPUT, {'type': 'hidden', 'name': 'responseType'});
    goog.dom.appendChild(this.domElement(), this.form_);
    goog.dom.appendChild(this.form_, this.formData_);
    goog.dom.appendChild(this.form_, this.formDataType_);
    goog.dom.appendChild(this.form_, this.formResponseType_);
  }

  //clean optional inputs from the form
  goog.object.forEach(this.optInputsMaps_, goog.dom.removeNode);

  //append optional inputs into the form
  if (goog.isDef(opt_arguments)) {
    goog.object.forEach(opt_arguments, function(value, key) {
      var input = this.optInputsMaps_[key];
      if (!input) {
        input = goog.dom.getDomHelper().createDom(goog.dom.TagName.INPUT, {'type': 'hidden', 'name': key});
        this.optInputsMaps_[key] = input;
      }
      input['value'] = value;
      goog.dom.appendChild(this.form_, input);
    }, this);
  }

  this.form_['action'] = url;
  this.formData_['value'] = data;
  this.formDataType_['value'] = dataType;
  this.formResponseType_['value'] = responseType;
  this.form_['submit']();
};


/**
 * Returns DOM Element.
 * @return {Element} DOM Element.
 */
acgraph.utils.HelperElement.prototype.domElement = function() {
  return this.sizeElement_;
};


/** @override */
acgraph.utils.HelperElement.prototype.disposeInternal = function() {
  goog.events.unlisten(this.resizeTarget_, goog.events.EventType.RESIZE, this.handleResize_, false, this);

  // Firefox 2 crashes if the iframe is removed during the unload phase.
  if (!goog.userAgent.GECKO ||
      goog.userAgent.isVersionOrHigher('1.9')) {

  }
  goog.dom.removeNode(this.sizeElement_);
  delete this.sizeElement_;
  delete this.container_;
  delete this.form_;
  delete this.formData_;
  delete this.formDataType_;
  delete this.formResponseType_;
  delete this.optInputsMaps_;
  delete this.stage_;

  goog.base(this, 'disposeInternal');
};


/**
 * Handles the onresize event of the iframe and dispatches a change event in
 * case its size really changed.
 * @param {goog.events.BrowserEvent} e The event object.
 * @private
 */
acgraph.utils.HelperElement.prototype.handleResize_ = function(e) {
  if (this.isDisposed()) return;

  var dispatchResize = false;

  // Only dispatch the event if the size of the container really changed.
  var size = goog.style.getContentBoxSize(this.container_);
  var currentWidth = size.width || 0;
  var currentHeight = size.height || 0;

  if (this.stage_.lastContainerWidth != currentWidth || this.stage_.lastContainerHeight != currentHeight) {
    var isHidden = goog.style.getComputedStyle(this.container_, 'display') == 'none';
    var parent;
    var element = this.container_;
    while (!isHidden && (parent = goog.dom.getParentElement(element))) {
      isHidden = isHidden || goog.style.getComputedStyle(parent, 'display') == 'none';
      element = parent;
    }
    if (!isHidden) {
      if (this.stage_.lastContainerWidth != currentWidth) {
        dispatchResize = true;
      }
      if (this.stage_.lastContainerHeight != currentHeight) {
        dispatchResize = true;
      }
    }
  }

  if (dispatchResize) this.dispatchEvent(acgraph.utils.HelperElement.EventType.SIZECHANGE);
};
