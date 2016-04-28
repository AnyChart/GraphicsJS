goog.provide('acgraph.compatibility');


/**
 * Compatibility namespace.
 * @namespace
 * @name acgraph.compatibility
 */


/**
 * Bug with <base> tag and processingIRI - url(#linkToDefs). Affected: clip, fill, stroke.
 * DVF-2072
 * @type {?boolean}
 */
acgraph.compatibility.USE_ABSOLUTE_REFERENCES = null;
