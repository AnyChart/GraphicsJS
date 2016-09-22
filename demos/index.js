var stage = acgraph.create('container');
var text = acgraph.text(100, 100, "Hello World!").fontSize('24pt');
var bounds = text.getBounds();
stage.rect(bounds.left, bounds.top, bounds.width, bounds.height).fill('red 0.5');
stage.addChild(text);