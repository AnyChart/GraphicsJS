# GraphicsJS
GraphicsJS is a lightweight JavaScript graphics library with the intuitive API, based on SVG/VML technology.

* [Overview](#overview)
* [Quick Start](#quick-start)
* [Articles](#articles)
* [Building](#building)
* [Contributing](#contributing)
* [Links](#articles)

# Overview

[GraphicsJS](http://www.graphicsjs.org/) is a JavaScript graphics library that allows you to draw absolutely anything, including any sort of interactive and animated graphics with any visual effects.

You can think of GraphicsJS as a paintbox with a brush, GraphicsJS may be used for data visualization, charting, game design or else. [AnyChart charting libraries](https://www.anychart.com/) rendering is based fully on it.

You can find some specific samples at [http://www.graphicsjs.org/](http://www.graphicsjs.org/), along with source code: [galaxy](https://playground.anychart.com/gallery/latest/Graphics/Galaxy-plain), [rain](https://playground.anychart.com/gallery/latest/Graphics/Rain-plain), [bonfire](https://playground.anychart.com/gallery/latest/Graphics/Bonfire-plain), [Bender](https://playground.anychart.com/gallery/latest/Graphics/Bender-plain), and a [playable 15-puzzle](https://playground.anychart.com/gallery/latest/Graphics/Puzzle_15-plain). All of these were created with GraphicsJS only.

GraphicsJS allows to visualize complicated mathematical algorithms very conveniently and easily, e.g. the [galaxy](https://playground.anychart.com/gallery/latest/Graphics/Galaxy-plain) demo is based on [Archimedean spiral](https://en.wikipedia.org/wiki/Archimedean_spiral).

GraphicsJS has one the most powerful [line drawing features](https://docs.anychart.com/Graphics/Paths) among SVG/VML based graphics libraries that provide only Bezier curves out of the box. But GraphicsJS is great at working with mathematical functions. As a result, GraphicsJS allows you to draw not only Bezier curves out of the box, but literally anything; for example, you can draw some arc very quickly, whereas other graphics libraries will make you arrange it through numerous different curves. And surely there are [basic shapes available](https://docs.anychart.com/Graphics/Shapes)

GraphicsJS has the richest [text features](https://docs.anychart.com/Graphics/Text_and_Fonts), for example, SVG/VML technologies do not provide this out of the box, as well as most of other JavaScript drawing libraries. GraphicsJS supports multiline texts and also offers text measurement, including width, height, as well as wrap, overflow, indent, spacing, align, etc.

GraphicsJS has implements the [Virtual DOM](https://docs.anychart.com/Graphics/Virtual_DOM) which makes drawing more robust and manageable.

GraphicsJS uses smart layering system for elements and [layers](https://docs.anychart.com/Graphics/Layers).

GraphicsJS supports z-index. Typically, if you ever decided to change the overlapping order, you would have to erase everything and draw the whole picture again, from scratch. With GraphicsJS, you are given the power to arrange this dynamically, which is extremely helpful when you are creating some big graphical thing and it is important for you to specify which elements must be seen at one moment or another.

GraphicsJS provides a convenient [Transformations](https://docs.anychart.com/Graphics/Transformations) API that allows to move, scale, rotate and shear both elements and groups of elements. Transformations, in good hands, when used along with [flexible Event Model](https://docs.anychart.com/Graphics/Events) and [Virtual DOM](https://docs.anychart.com/Graphics/Virtual_DOM), is a very powerfull tool.

GraphicsJS [supports legacy browsers including IE6+](https://docs.anychart.com/Graphics/Browser_Support). 

GraphicsJS API is very convenient to use. [GraphicsJS API](https://api.anychart.com/latest/anychart.graphics) is very concise and provides chaining support, which makes it possible to use a dozen lines of code where other libraries require a hundred.

GraphicsJS is built on a very reliable technology, Google Closure, just like Google Mail, Google Calendar, Google Drive, and so on.

# Quick Start

To get started with GraphicsJS create simple HTML document and copy paste the following code (or just grab the sample from [playground](https://playground.anychart.com/docs/7.14.0/samples/GFX_quick_start-plain)):

```html
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<script src="https://cdn.anychart.com/js/latest/graphics.min.js"></script>
</head>
<body>
	<div id="stage-container" style="width: 400px; height: 375px;"></div>
	<script>
		// create a stage for the Deathly Hallows symbol
        stage = acgraph.create('stage-container');
        // draw the square
        stage.rect(5, 5, 350, 300);
        // draw the circle
        stage.circle(177.5, 205, 100);
        // draw the triangle
        stage.path()
            .moveTo(5, 305)
            .lineTo(175, 5)
            .lineTo(355, 305);
        // draw the wand in the middle
        stage.path()
            .moveTo(175, 5)
            .lineTo(175, 305);
	</script>
</body>
</html>
```

Launch the page in your browser and here you are: you have created your first drawing with GraphicsJS. See [documentation](https://docs.anychart.com/Graphics/Basics) and [API](https://api.anychart.com/latest/anychart.graphics) to learn more.

# Articles
- [Introducing GraphicsJS, a Powerful Lightweight Graphics Library](https://www.sitepoint.com/introducing-graphicsjs-a-powerful-lightweight-graphics-library/) by [@RomanLubushkin](https://github.com/RomanLubushkin)
- [GraphicsJS Overview](https://docs.anychart.com/Graphics/Overview) by [AnyChart](http://www.anychart.com/)

# Building

*Coming soon.*

# Contributing

To contribute to AnyChart project please:

* Fork GraphicsJS repository.
* Create a branch from the `develop` branch.
* Make any changes you want to contribute.
* Create a pull request against the `develop` branch.

[GitHub documentation: Forking repositories](https://help.github.com/articles/fork-a-repo/).  
[GitHub documentation: Collaborating using pull requests](https://help.github.com/categories/collaborating-with-issues-and-pull-requests/).

# Links
- [GraphicsJS  Website](http://www.graphicsjs.org/)
- [GraphicsJS Users's Guide](https://docs.anychart.com/Graphics/Basics)
- [GraphicsJS API](https://api.anychart.com/latest/anychart.graphics)
- [GraphicsJS at GitHub](https://github.com/anychart/graphicsjs)
- [Report a bug or an issue](https://github.com/anychart/graphicsjs/issues)

