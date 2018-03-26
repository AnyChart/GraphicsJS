/**
 * @namespace
 * @name acgraph.vector.vml
 */


goog.provide('acgraph.vector.vml');

goog.require('acgraph.vector.vml.Clip');
goog.require('acgraph.vector.vml.Renderer');
goog.require('acgraph.vector.vml.Stage');
goog.require('acgraph.vector.vml.Text');


goog.exportSymbol('acgraph.vml.getRenderer', function() {
  return acgraph.vector.vml.Renderer.getInstance();
});
