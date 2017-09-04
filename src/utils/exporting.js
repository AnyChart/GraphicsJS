goog.provide('acgraph.utils.exporting');
goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.style');


/**
 * Image fill modes.
 * @type {Object.<string, {width: string, height: string}>}
 */
acgraph.utils.exporting.PaperSize = {
  'usletter': {width: '215.9mm', height: '279.4mm'},
  'a0': {width: '841mm', height: '1189mm'},
  'a1': {width: '594mm', height: '841mm'},
  'a2': {width: '420mm', height: '594mm'},
  'a3': {width: '297mm', height: '420mm'},
  'a4': {width: '210mm', height: '279mm'}, // Less than real A4 height (297mm) to fit page
  'a5': {width: '148mm', height: '210mm'},
  'a6': {width: '105mm', height: '148mm'}
};


/**
 * Pixel representation of papers sizes specific for AnyChart Export Server.
 * @type {Object.<string, {width: number, height: number}>}
 */
acgraph.utils.exporting.PdfPaperSize = {
  'a0': {width: 2384, height: 3370},
  'a1': {width: 1684, height: 2384},
  'a2': {width: 1191, height: 1684},
  'a3': {width: 842, height: 1191},
  'a4': {width: 595, height: 842},
  'a5': {width: 420, height: 595},
  'a6': {width: 297, height: 420},
  'a7': {width: 210, height: 297},
  'a8': {width: 48, height: 210},
  'a9': {width: 105, height: 148},
  'b0': {width: 2834, height: 4008},
  'b1': {width: 2004, height: 2834},
  'b2': {width: 1417, height: 2004},
  'b3': {width: 1000, height: 1417},
  'b4': {width: 708, height: 1000},
  'b5': {width: 498, height: 708},
  'b6': {width: 354, height: 498},
  'b7': {width: 249, height: 354},
  'b8': {width: 175, height: 249},
  'b9': {width: 124, height: 175},
  'arch-a': {width: 648, height: 864},
  'arch-b': {width: 864, height: 1296},
  'arch-c': {width: 1296, height: 1728},
  'arch-d': {width: 1728, height: 2592},
  'arch-e': {width: 2592, height: 3456},
  'crown-octavo': {width: 348, height: 527},
  'crown-quarto': {width: 535, height: 697},
  'demy-octavo': {width: 391, height: 612},
  'demy-quarto': {width: 620, height: 782},
  'royal-octavo': {width: 442, height: 663},
  'royal-quarto': {width: 671, height: 884},
  'executive': {width: 522, height: 756},
  'halfletter': {width: 396, height: 612},
  'ledger': {width: 1224, height: 792},
  'legal': {width: 612, height: 1008},
  'letter': {width: 612, height: 792},
  'tabloid': {width: 792, height: 1224}
};


/**
 * @type {Element}
 * @private
 */
acgraph.utils.exporting.printIFrame_ = null;


/**
 * @type {Window}
 * @private
 */
acgraph.utils.exporting.printWindow_ = null;


/**
 * @param {acgraph.vector.Stage} stage
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
acgraph.utils.exporting.print = function(stage, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  if (goog.isDef(opt_paperSizeOrWidth) || goog.isDef(opt_landscapeOrHeight)) {
    acgraph.utils.exporting.fullPagePrint(stage, opt_paperSizeOrWidth, opt_landscapeOrHeight);
  } else {
    acgraph.utils.exporting.fitToPagePrint(stage);
  }
};


/**
 * @param {acgraph.vector.Stage} stage
 */
acgraph.utils.exporting.fitToPagePrint = function(stage) {
  //create hidden frame
  var iFrame = acgraph.utils.exporting.createPrint_();
  var iFrameDocument = iFrame['contentWindow'].document;

  //clone stage content
  var stageClone;
  var stageDomClone;
  var stageDom = stage.domElement();
  if (stageDom.tagName == 'svg') {
    if (stageDom.cloneNode) {
      stageDomClone = stageDom.cloneNode(true);
    } else {
      stageClone = acgraph.create(iFrameDocument.body);
      stageClone.data(stage.data());
      stageDomClone = stageClone.domElement();
    }
  } else {
    stageClone = acgraph.create(iFrameDocument.body);
    stageClone.data(stage.data());
  }

  //set print attributes and append stageClone into the iFrame body
  acgraph.getRenderer().setPrintAttributes(stageDomClone, stage);
  goog.dom.appendChild(iFrameDocument.body, /** @type {Element} */(stageDomClone));

  //open print dialog
  acgraph.utils.exporting.openPrint_();
};


/**
 * @param {acgraph.vector.Stage} stage
 * @param {(string|number)=} opt_paperSizeOrWidth Paper Size or width.
 * @param {(boolean|string)=} opt_landscapeOrHeight Landscape or height.
 */
acgraph.utils.exporting.fullPagePrint = function(stage, opt_paperSizeOrWidth, opt_landscapeOrHeight) {
  var size = acgraph.vector.normalizePageSize(opt_paperSizeOrWidth, opt_landscapeOrHeight, acgraph.vector.PaperSize.US_LETTER);
  //create hidden frame
  var iFrame = acgraph.utils.exporting.createPrint_();
  var iFrameDocument = iFrame['contentWindow'].document;

  var div = goog.dom.createDom(goog.dom.TagName.DIV);
  goog.style.setStyle(div, {
    'width': size.width,
    'height': size.height
  });
  goog.dom.appendChild(iFrameDocument.body, div);

  var sourceStageWidth = stage.width();
  var sourceStageHeight = stage.height();
  var printStageSize = goog.style.getContentBoxSize(div);

  stage.resize(printStageSize.width, printStageSize.height);

  //take result from source stage
  var stageDom = stage.domElement();
  if (stageDom.tagName == 'svg' && stageDom.cloneNode) {
    goog.dom.appendChild(div, stageDom.cloneNode(true));
  } else {
    var newStage = acgraph.create(div);
    newStage.data(stage.data());
  }

  //restore source size
  stage.resize(/** @type {number} */(sourceStageWidth), /** @type {number} */(sourceStageHeight));

  //open print dialog
  acgraph.utils.exporting.openPrint_();
};


/**
 * Create print iFrame.
 * @return {Element}
 * @private
 */
acgraph.utils.exporting.createPrint_ = function() {
  if (!acgraph.utils.exporting.printIFrame_) {
    var iFrame = document.createElement('iframe');
    acgraph.utils.exporting.printIFrame_ = iFrame;
    goog.style.setStyle(iFrame, {
      'visibility': 'hidden',
      'position': 'fixed',
      'right': 0,
      'bottom': 0
    });
    //append iFrame into main document
    goog.dom.appendChild(document.body, iFrame);

    var rules = goog.cssom.getAllCssStyleRules();
    var rule;
    for (var i = 0, len = rules.length; i < len; i++) {
      rule = rules[i];
      if (rule.type == goog.cssom.CssRuleType.FONT_FACE) {
        acgraph.embedCss(goog.cssom.getCssTextFromCssRule(/** @type {CSSRule} */(rule)), iFrame['contentWindow'].document);
      }
    }

    acgraph.embedCss('body{padding:0;margin:0;height:100%;}@page {size: auto; margin: 0; padding:0}', iFrame['contentWindow'].document);
  }

  return acgraph.utils.exporting.printIFrame_;
};


/**
 * Open print dialog.
 * @private
 */
acgraph.utils.exporting.openPrint_ = function() {
  if (acgraph.utils.exporting.printIFrame_) {
    var iFrame = acgraph.utils.exporting.printIFrame_;
    var iFrameWindow = iFrame['contentWindow'];

    //do not delete this, right now we have nothing to do before the print
    //but maybe one day we will
    //start listening onBefore/onAfterPrint events
    //if (iFrameWindow['matchMedia']) {
    //  var mediaQueryList = iFrameWindow['matchMedia']('print');
    //  mediaQueryList['addListener'](function(mql) {
    //    if (mql.matches) {
    //      acgraph.utils.exporting.onBeforePrint_();
    //    } else {
    //      acgraph.utils.exporting.onAfterPrint_();
    //    }
    //  });
    //}
    //iFrameWindow['onbeforeunload'] = acgraph.utils.exporting.disposePrint_;
    //iFrameWindow['onafterprint'] = acgraph.utils.exporting.disposePrint_;
    //end listening onBefore/onAfterPrint events

    if (goog.userAgent.EDGE) {
      acgraph.utils.exporting.printWindow_ = window.open();
      acgraph.utils.exporting.printWindow_.document.write(iFrameWindow.document.documentElement.innerHTML);
      acgraph.utils.exporting.disposePrint_();
      acgraph.utils.exporting.printWindow_['onafterprint'] = function() {
        setTimeout(function() {
          acgraph.utils.exporting.printWindow_.close();
        }, 0);
      };
      setTimeout(function() {
        acgraph.utils.exporting.printWindow_['focus'](); // Required for IE
        acgraph.utils.exporting.printWindow_['print']();
      }, 0);
    } else if (goog.userAgent.IE) {
      setTimeout(function() {
        goog.style.setStyle(iFrame, 'visibility', '');
        iFrameWindow['onafterprint'] = acgraph.utils.exporting.disposePrint_;
        iFrameWindow['focus'](); // Required for IE
        iFrameWindow['print']();
      }, 0);
    } else {
      //this timer will tick right after print dialog close
      goog.Timer.callOnce(acgraph.utils.exporting.disposePrint_, 6);
      iFrameWindow['focus'](); // Required for IE
      iFrameWindow['print']();
    }
  }
};


/**
 * @private
 */
acgraph.utils.exporting.onBeforePrint_ = function() {
  //do not delete this, right now we have nothing to do before the print
  //but maybe one day we will
};


/**
 * @private
 */
acgraph.utils.exporting.onAfterPrint_ = function() {
  //do not delete this, right now we have nothing to do after the print
  //but maybe one day we will
};


/**
 * Close print iFrame.
 * @private
 */
acgraph.utils.exporting.disposePrint_ = function() {
  if (acgraph.utils.exporting.printIFrame_) {
    document.body.removeChild(acgraph.utils.exporting.printIFrame_);
    acgraph.utils.exporting.printIFrame_ = null;
  }
};

