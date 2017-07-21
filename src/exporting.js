goog.provide('acgraph.exporting');

goog.require('acgraph.vector.Stage');
goog.require('goog.Uri.QueryData');
goog.require('goog.net.IframeIo');
goog.require('goog.net.XhrIo');
goog.require('goog.structs.Map');


//----------------------------------------------------------------------------------------------------------------------
//
//                  Export server.
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Export server address including port.
 * @type {string}
 */
acgraph.exportServer = '//export.anychart.com';


/**
 Sets and returns an address export server script, which is used to export to an image
 or PDF.
 @see acgraph.vector.Stage#saveAsPdf
 @see acgraph.vector.Stage#saveAsPng
 @see acgraph.vector.Stage#saveAsJpg
 @see acgraph.vector.Stage#saveAsSvg
 @param {string=} opt_address Export server script URL.
 @return {string} Export server script URL.
 */
acgraph.server = function(opt_address) {
  if (goog.isDef(opt_address)) {
    acgraph.exportServer = opt_address;
  }
  return acgraph.exportServer;
};


/**
 * Send form POST request on passed url with passed request params.
 * @param {string} url .
 * @param {Object.<string, *>=} opt_arguments .
 */
acgraph.sendRequestToExportServer = function(url, opt_arguments) {
  goog.net.IframeIo.send(url, undefined, 'POST', false, opt_arguments);
};


//region --- Sharing and export
//------------------------------------------------------------------------------
//
//  Sharing and export
//
//------------------------------------------------------------------------------
/**
 * Normalize image size for export.
 * @param {number=} opt_width
 * @param {number=} opt_height
 * @return {{width: number, height: number}}
 * @private
 */
acgraph.vector.Stage.prototype.normalizeImageSize_ = function(opt_width, opt_height) {
  var ratio = this.width() / this.height();
  opt_width = goog.isDef(opt_width) ?
      opt_width :
      opt_height ?
          Math.round(opt_height * ratio) :
          /** @type {number} */(this.width());
  opt_height = goog.isDef(opt_height) ?
      opt_height :
      opt_width ?
          Math.round(opt_width / ratio) :
          /** @type {number} */(this.height());

  return {
    width: opt_width,
    height: opt_height
  };
};


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
  var size = this.normalizeImageSize_(opt_width, opt_height);
  data['data'] = this.toSvg(size.width, size.height);
  data['dataType'] = 'svg';
  data['responseType'] = 'file';
  data['width'] = size.width;
  data['height'] = size.height;
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
  var size = this.normalizeImageSize_(opt_width, opt_height);
  data['data'] = this.toSvg(size.width, size.height);

  data['dataType'] = 'svg';
  data['responseType'] = 'file';
  data['width'] = size.width;
  data['height'] = size.height;
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
(function() {
  goog.exportSymbol('acgraph.server', acgraph.server);

  var proto = acgraph.vector.Stage.prototype;
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
})();

