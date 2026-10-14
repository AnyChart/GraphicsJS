/**
 * @fileoverview npm-friendly wrapper for GraphicsJS.
 * 
 * The dist/graphics.min.js file uses the Closure Library runtime,
 * which expects a global `goog` and `acgraph` namespace. This wrapper
 * ensures those are available before the library loads, making it
 * work with npm, Webpack, Rollup, Angular CLI, etc.
 *
 * @example
 * // In your Angular component or any module:
 * import 'graphicsjs';
 * 
 * // Then use the global acgraph:
 * const stage = acgraph.create('#container');
 * const rect = stage.rect(10, 10, 200, 100).fill('steelblue');
 *
 * @example
 * // Or with require:
 * const acgraph = require('graphicsjs');
 * const stage = acgraph.create('#container');
 */

// Ensure goog namespace exists before loading Closure-compiled code
(function () {
  'use strict';

  // Set up goog global (Closure Compiler runtime dependency)
  if (typeof goog === 'undefined') {
    var goog = {};
    goog.global = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : global);
    goog.global['CLOSURE_UNCOMPILED_DEFINES'] = goog.global['CLOSURE_UNCOMPILED_DEFINES'] || {};
    goog.global['CLOSURE_DEFINES'] = goog.global['CLOSURE_DEFINES'] || {};
    goog.global['CLOSURE_BASE_SCRIPT'] = goog.global['CLOSURE_BASE_SCRIPT'] || '';
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = goog;
    }
  }

  // Set up acgraph global namespace that the library expects
  var globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : global;
  if (!globalObj.acgraph) {
    globalObj.acgraph = {};
  }
  globalObj.acgraph.module = globalObj.acgraph.module || globalObj.acgraph;

  // Also set the legacy flag for AnyChart AMD detection
  if (!globalObj.IS_ANYCHART_AMD) {
    globalObj.IS_ANYCHART_AMD = false;
  }
})();
