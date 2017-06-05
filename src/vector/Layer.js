goog.provide('acgraph.vector.Layer');

goog.require('acgraph.error');
goog.require('acgraph.utils.IdGenerator');
goog.require('acgraph.vector.Element');
goog.require('acgraph.vector.ILayer');
goog.require('goog.math.Rect');



/**
 Layer class. Used to group elements.<br/>
 Elements must be grouped if you want to apply similar changes to them,
 for example transformation.<br>
 <b>Do not invoke constructor directly.</b> Use {@link acgraph.vector.Stage#layer}
 to create stage bound layer.<br/> If you want to create an unbound
 layer – use {@link acgraph.layer}
 @see acgraph.vector.Stage#layer
 @see acgraph.layer
 @name acgraph.vector.Layer
 @constructor
 @extends {acgraph.vector.Element}
 @implements {acgraph.vector.ILayer}
 */
acgraph.vector.Layer = function() {
  /**
   * Chidren list.
   * @type {!Array.<acgraph.vector.Element>}
   * @protected
   */
  this.children = [];

  /**
   * List of children added to DOM.
   * @type {!Array.<acgraph.vector.Element>}
   * @protected
   */
  this.domChildren = [];

  goog.base(this);
};
goog.inherits(acgraph.vector.Layer, acgraph.vector.Element);


/** @inheritDoc */
acgraph.vector.Layer.prototype.getElementTypePrefix = function() {
  return acgraph.utils.IdGenerator.ElementTypePrefix.LAYER;
};


//endregion
//region --- Section Properties ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Properties and consts
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Supported states.
 * Layer inherits element and can handle children states, parts of children and layer attributes.
 * @type {number}
 */
acgraph.vector.Layer.prototype.SUPPORTED_DIRTY_STATES =
    acgraph.vector.Element.prototype.SUPPORTED_DIRTY_STATES |
        acgraph.vector.Element.DirtyState.CHILDREN |
        acgraph.vector.Element.DirtyState.CHILDREN_SET |
        acgraph.vector.Element.DirtyState.DATA;


//endregion
//region --- Section Overrides ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Overrides
//
//----------------------------------------------------------------------------------------------------------------------


/** @inheritDoc */
acgraph.vector.Layer.prototype.setDirtyState = function(value) {
  goog.base(this, 'setDirtyState', value);
  if (!!(value & (acgraph.vector.Element.DirtyState.CHILDREN |
      acgraph.vector.Element.DirtyState.CHILDREN_SET))) {
    this.dropBoundsCache();
  }
};


//endregion
//region --- Section ILayer members ---
//----------------------------------------------------------------------------------------------------------------------
//
//  ILayer members
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Add element to a layer, to the top (maximal index). <br/>
 All DOM changes will happen instantly, except
 {@link acgraph.vector.Stage#suspend}. <br/>
 <i>Simplified version of {@link acgraph.vector.Layer#addChildAt} where element is added to the end.</i>
 @param {!acgraph.vector.Element} element Element to add.
 @return {!acgraph.vector.Layer} {@link acgraph.vector.Layer} instance for method chaining.
 */
acgraph.vector.Layer.prototype.addChild = function(element) {
  return this.addChildAt(element, this.numChildren());
};


/**
 Adds an element to a layer by index. <br/>
 <b>Note:</b> the greater index is - the 'higher' element is in a layer
 top element overlaps bottom elements.<br/>
All DOM changes will happen instantly, except
 {@link acgraph.vector.Stage#suspend}. <br/>
 Left image shows sequential calls of
 {@link acgraph.vector.Layer#addChild}<br/>
 Right image does the same, but star is added to 0 index.
 <code>.addChildAt(star5, 0);</code> (see code of this image in samples).
 @param {!acgraph.vector.Element} element Element to add.
 @param {number} index Element index. <br/>Only positive numbers.
 @return {!acgraph.vector.Layer} {@link acgraph.vector.Layer} instance for method chaining.
 */
acgraph.vector.Layer.prototype.addChildAt = function(element, index) {
  // If element has the parent, tell it, so it can update children list
  element.remove();

  // Level to [0, number_of_children] segment, because that's how
  // it happens in DOM.
  index = goog.math.clamp(index, 0, this.numChildren());

  // Put elements where they are supposed to be
  goog.array.insertAt(this.children, element, index);

  // Set element parent
  element.setParent(this);

  // Check if we need to rerender a child, if yes - set flag
  if (element.isDirty())
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);

  // Set flag to a layer
  this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);

  element.parentTransformationChanged();
  if (this.cursor() || this.parentCursor) {
    element.parentCursorChanged();
    element.parentCursor = /** @type {?acgraph.vector.Cursor} */ (this.cursor() || this.parentCursor);
  }

  return this;
};


/**
 Returns element by index.
 @param {number} index Element to be returned.
 @return {acgraph.vector.Element} Element or null.
 */
acgraph.vector.Layer.prototype.getChildAt = function(index) {
  return this.children[index] || null;
};


/**
 Looks for an element in a layer and returns index or -1, of not found.
 @param {acgraph.vector.Element} element Element which index we need to find.
 @return {number} Index or -1, or not found.
 */
acgraph.vector.Layer.prototype.indexOfChild = function(element) {
  return goog.array.indexOf(this.children, element);
};


/**
 Removes element from a layer.<br/>
 All changes in DOM will happen instantly, except
 {@link acgraph.vector.Stage#suspend}. <br/>
 <b>Note:</b> this method doesn't remove element, it just breaks the link between the element and the layer.<br/>
 <i>This is an extension of {@link acgraph.vector.Layer#removeChildAt} method.
 @param {acgraph.vector.Element} element Element to remove or its id.
 @return {acgraph.vector.Element} Removed element or null.
 */
acgraph.vector.Layer.prototype.removeChild = function(element) {
  return this.removeChildAt(this.indexOfChild(element));
};


/**
 Removes element from a layer by index.<br/>
 All changes in DOM will happen instantly, except
 {@link acgraph.vector.Stage#suspend}. <br/>
 <b>Note:</b> this method doesn't remove element, it just breaks the link between the element and the layer.<br/>
 @param {number} index Index of element to be removed.
 @return {acgraph.vector.Element} Removed element or null.
 */
acgraph.vector.Layer.prototype.removeChildAt = function(index) {
  /** @type {acgraph.vector.Element} */
  var element = null;
  // Check that index is valid
  if (index >= 0 && index < this.numChildren()) {
    if (this.isDisposed()) {
      element = this.children[index];
    } else {
      // IF so - remove from children arreay and get a reference
      element = goog.array.splice(this.children, index, 1)[0];

    }

    // Tell poor element he is an orphan now. He is Oliver Twist now.
    element.setParent(null);

    // Set flag to a layer that children list changed
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  }
  return element;
};


/**
 Remove all children from a layer.
 @return {!Array.<acgraph.vector.Element>} Array of removed elements.
 */
acgraph.vector.Layer.prototype.removeChildren = function() {
  for (var i = 0; i < this.numChildren(); i++) {
    var element = this.children[i];
    // Tell element he is orphaned.
    // TODO: should we call CPS or something?
    element.setParent(null);
  }
  /** @type {!Array.<acgraph.vector.Element>} */
  var result = this.children;
  if (!this.isDisposed())
    this.children = [];
  // Set flag to a layer that children list changed
  this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  return result;
};


/**
 Swap children.
 @param {acgraph.vector.Element} element1 First element.
 @param {acgraph.vector.Element} element2 Second element.
 @return {!acgraph.vector.Layer} {@link acgraph.vector.Layer} instance for method chaining.
 */
acgraph.vector.Layer.prototype.swapChildren = function(element1, element2) {
  return this.swapChildrenAt(this.indexOfChild(element1), this.indexOfChild(element2));
};


/**
 Swap children by indices.
 @param {number} index1 First element index.
 @param {number} index2 Second element index.
 @return {!acgraph.vector.Layer} {@link acgraph.vector.Layer} instance for method chaining.
 */
acgraph.vector.Layer.prototype.swapChildrenAt = function(index1, index2) {
  // Check indices validity
  if (index1 < 0 || index1 >= this.numChildren() || index2 < 0 || index2 >= this.numChildren()) {
    throw acgraph.error.getErrorMessage(acgraph.error.Code.WRONG_SWAPPING);
  }

  // And they are not the same (can not swap to self)
  if (index1 != index2) {
    var element = this.children[index1];
    this.children[index1] = this.children[index2];
    this.children[index2] = element;
    // Set flag to layer that children changed
    this.setDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  }

  return this;
};


/**
 Checks if there is such element in children set.
 @param {acgraph.vector.Element} element Element.
 @return {boolean} True if it is a child.
 */
acgraph.vector.Layer.prototype.hasChild = function(element) {
  return !!element && goog.array.contains(this.children, element);
};


/**
 Returns the number of children.
 @return {number} Number of children.
 */
acgraph.vector.Layer.prototype.numChildren = function() {
  return this.children.length;
};


/**
 Applies function to all elements in a layer.
 @param {function(acgraph.vector.Element, number):void} callback Function to be applied.
 @param {Object=} opt_this .
 @return {!acgraph.vector.Layer} .
 */
acgraph.vector.Layer.prototype.forEachChild = function(callback, opt_this) {
  if (!goog.isDef(opt_this)) opt_this = this;
  goog.array.forEach(this.children, callback, opt_this);
  return this;
};


//endregion
//region --- Primitives and Layering ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Layering
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Invokes {@link acgraph.vector.Layer} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @return {!acgraph.vector.Layer} {@link acgraph.vector.Layer} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.layer = function() {
  var layer = acgraph.layer();
  layer.parent(this);
  return layer;
};


/**
 Invokes {@link acgraph.vector.UnmanagedLayer} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @return {!acgraph.vector.UnmanagedLayer} {@link acgraph.vector.UnmanagedLayer} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.unmanagedLayer = function() {
  var layer = acgraph.unmanagedLayer();
  layer.parent(this);
  return layer;
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Primitives
//
//----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
//
//  Text
//
//----------------------------------------------------------------------------------------------------------------------
/**
 Invokes {@link acgraph.vector.Text} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @param {number=} opt_x X-coordinate (Left) of left top corner of text bounds.
 @param {number=} opt_y Y-coordinate (Top) of left top corner of text bounds.
 @param {string=} opt_text Text to be displayed.
 @param {acgraph.vector.TextStyle=} opt_style Text style. More at {@link acgraph.vector.Text#style}.
 @return {!acgraph.vector.Text} {@link acgraph.vector.Text} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.text = function(opt_x, opt_y, opt_text, opt_style) {
  /** @type {!acgraph.vector.Text} */
  var text = acgraph.text(opt_x, opt_y);
  if (opt_style) text.style(opt_style);
  if (opt_text) text.text(opt_text);
  text.parent(this);

  return text;
};


/**
 Invokes {@link acgraph.vector.SimpleText} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @param {string=} opt_text Text to be displayed.
 @return {!acgraph.vector.SimpleText} {@link acgraph.vector.SimpleText} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.simpleText = function(opt_text) {
  /** @type {!acgraph.vector.SimpleText} */
  var text = acgraph.simpleText();
  if (opt_text) text.text(opt_text);
  text.parent(this);

  return text;
};


/**
 Invokes {@link acgraph.vector.Text} class constructor and applies {@link acgraph.vector.Text#htmlText} method
 to handle HTML formatting.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @param {number=} opt_x X-coordinate (Left) of top left corner of text bounds.
 @param {number=} opt_y Y-coordinate (Top) of top left corner of text bounds.
 @param {string=} opt_text Text to be displayed.
 @param {acgraph.vector.TextStyle=} opt_style Text style. More at {@link acgraph.vector.Text#style}.
 @return {!acgraph.vector.Text} {@link acgraph.vector.Text} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.html = function(opt_x, opt_y, opt_text, opt_style) {
  /** @type {!acgraph.vector.Text} */
  var text = acgraph.text(opt_x, opt_y);
  if (opt_style) text.style(opt_style);
  if (opt_text) text.htmlText(opt_text);
  text.parent(this);

  return text;
};


/**
 Invokes {@link acgraph.vector.Rect} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @param {number=} opt_x X (Left) of top left rectangle corner.
 @param {number=} opt_y Y (Top) of to left rectangle corner.
 @param {number=} opt_width Rectangle width.
 @param {number=} opt_height Rectangle height.
 @return {!acgraph.vector.Rect} {@link acgraph.vector.Rect} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.rect = function(opt_x, opt_y, opt_width, opt_height) {
  var rect = acgraph.rect(opt_x, opt_y, opt_width, opt_height);
  rect.parent(this);
  return rect;
};


/**
 Invokes {@link acgraph.vector.Image} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.
 @param {string=} opt_src IRI (Internationalized Resource Identifiers) for image source.
 @param {number=} opt_x X coordinate of left-top corner image.
 @param {number=} opt_y Y coordinate of left-top corner image.
 @param {number=} opt_width Width of image bounds.
 @param {number=} opt_height Height of image bounds.
 @return {acgraph.vector.Image} Image object instance.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.image = function(opt_src, opt_x, opt_y, opt_width, opt_height) {
  var image = acgraph.image(opt_src, opt_x, opt_y, opt_width, opt_height);
  image.parent(this);
  return image;
};


/**
 Draws rectangle with rounded corners..<br/>
 Read more at {@link acgraph.vector.primitives.roundedRect}
 @param {!goog.math.Rect} rect Rectangle.
 @param {...number} var_args Set of param which defines corners radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.roundedRect = function(rect, var_args) {
  goog.array.insertAt(arguments, this.path(), 0);
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.roundedRect.apply(this, arguments).parent(this));
};


/**
 Draws rectangle with corners rounded inside.<br/>
 Read more at {@link acgraph.vector.primitives.roundedInnerRect}
 @param {!goog.math.Rect} rect Rect which corners will be truncated.
 @param {...number} var_args Set of param which define corners radius of rectangle.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.roundedInnerRect = function(rect, var_args) {
  goog.array.insertAt(arguments, this.path(), 0);
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.roundedInnerRect.apply(this, arguments).parent(this));
};


/**
 Draws rectangle with cut corners.<br/>
 Read more at {@link acgraph.vector.primitives.truncatedRect}
 @param {!goog.math.Rect} rect Rect which corners will be cut.
 @param {...number} var_args Set of params which define corners radius.
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.truncatedRect = function(rect, var_args) {
  goog.array.insertAt(arguments, this.path(), 0);
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.truncatedRect.apply(this, arguments).parent(this));
};


/**
 Invokes {@link acgraph.vector.Circle} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.<br/>
 Read more at {@link acgraph.vector.Circle}
 @param {number=} opt_cx Center X, in pixels.
 @param {number=} opt_cy Center Y, in pixels.
 @param {number=} opt_radius Radius, in pixels.
 @return {!acgraph.vector.Circle} {@link acgraph.vector.Circle} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.circle = function(opt_cx, opt_cy, opt_radius) {
  var circle = acgraph.circle(opt_cx, opt_cy, opt_radius);
  circle.parent(this);
  return circle;
};


/**
 Invokes {@link acgraph.vector.Ellipse} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.<br/>
 Read more at {@link acgraph.vector.Ellipse}
 @param {number=} opt_cx Center X, in pixels.
 @param {number=} opt_cy Center Y, in pixels.
 @param {number=} opt_rx Radius X, in pixels.
 @param {number=} opt_ry Radius Y, in pixels.
 @return {!acgraph.vector.Ellipse} {@link acgraph.vector.Ellipse} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.ellipse = function(opt_cx, opt_cy, opt_rx, opt_ry) {
  var ellipse = acgraph.ellipse(opt_cx, opt_cy, opt_rx, opt_ry);
  ellipse.parent(this);
  return ellipse;
};


/**
 Invokes {@link acgraph.vector.Path} class constructor.<br/>
 <strong>Note:</strong><br>acgraph.vector.Layer does nothing to delete an object after it is used.
 You need to take care of used objects yourself.<br/>
 Read more at: {@link acgraph.vector.Path}
 @return {!acgraph.vector.Path} {@link acgraph.vector.Path} instance for method chaining.
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.path = function() {
  return /** @type {!acgraph.vector.Path} */((acgraph.path()).parent(this));
};


/**
 Draws multi-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @param {number} innerRadius .
 @param {number} numberOfSpikes .
 @param {number=} opt_startDegrees .
 @param {number=} opt_curvature .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.star = function(centerX, centerY, outerRadius, innerRadius, numberOfSpikes, opt_startDegrees, opt_curvature) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.star(this.path(),
      centerX, centerY, outerRadius, innerRadius, numberOfSpikes,
      opt_startDegrees, opt_curvature).parent(this));
};


/**
 Draws four-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star4}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.star4 = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.star4(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws five-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star5}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.star5 = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.star5(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws six-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star6}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.star6 = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.star6(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws seven-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star7}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.star7 = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.star7(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws ten-pointed star.<br/>
 Read more at {@link acgraph.vector.primitives.star10}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.star10 = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.star10(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a triangle heading upwards set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleUp}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.triangleUp = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.triangleUp(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a triangle heading downwards set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleDown}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.triangleDown = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.triangleDown(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a triangle heading rightwards set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleRight}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.triangleRight = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.triangleRight(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a triangle heading leftwards set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.triangleLeft}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.triangleLeft = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.triangleLeft(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a diamond set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.diamond}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.diamond = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.diamond(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a cross set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.cross}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.cross = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.cross(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a diagonal cross set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.diagonalCross}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.diagonalCross = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.diagonalCross(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a thick horizontal line set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.hLine}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.hLine = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.hLine(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws a thick vertical line set by its circumscribed circle center and radius.<br/>
 Read more at {@link acgraph.vector.primitives.vLine}
 @param {number} centerX .
 @param {number} centerY .
 @param {number} outerRadius .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.vLine = function(centerX, centerY, outerRadius) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.vLine(this.path(),
      centerX, centerY, outerRadius).parent(this));
};


/**
 Draws sector as pie chart element.<br/>
 Read more at {@link acgraph.vector.primitives.pie}
 @param {number} cx .
 @param {number} cy .
 @param {number} r .
 @param {number} start .
 @param {number} extent .
 @return {!acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.pie = function(cx, cy, r, start, extent) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.pie(this.path(),
      cx, cy, r, start, extent).parent(this));
};


/**
 Draws sector as donut chart element.<br/>
 Read more at {@link acgraph.vector.primitives.donut}
 @param {number} cx .
 @param {number} cy .
 @param {number} outerR .
 @param {number} innerR .
 @param {number} start .
 @param {number} extent .
 @return {acgraph.vector.Path} .
 @this {acgraph.vector.ILayer}
 */
acgraph.vector.Layer.prototype.donut = function(cx, cy, outerR, innerR, start, extent) {
  return /** @type {!acgraph.vector.Path} */(acgraph.vector.primitives.donut(this.path(),
      cx, cy, outerR, innerR, start, extent).parent(this));
};


//endregion
//region --- Rendering ---
//----------------------------------------------------------------------------------------------------------------------
//
//  DOM element creation
//
//---------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Layer.prototype.createDomInternal = function() {
  return acgraph.getRenderer().createLayerElement();
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Rendering
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Layer.prototype.renderInternal = function() {
  // If layer DATA flag is not ok - just rerender attributes.
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.DATA))
    this.renderData();

  // Get one third of all available changes for the subsequent element adding
  var halfLimit = this.getStage().blockChangesForAdding();
  // Try to render children, if something is wrong with them
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN))
    this.renderChildren();
  // Return changes.
  this.getStage().releaseDomChanges(halfLimit, 0);

  // If something is wrong with chldren set
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET)) {
    // TODO (Anton Saukh): this grabbing algorithm should be refactored, it is not efficient
    // Try to pre-grab DOM changes from the required share for changes in children
    var allowedChangesCount = this.getStage().acquireDomChanges(this.children.length + this.domChildren.length + 1);
    // Try to correct this
    var changesMade = this.renderChildrenDom(allowedChangesCount);
    // If we did less changes than we wanted
    if (changesMade < allowedChangesCount)
      // Free changes we didn't do
      this.getStage().releaseDomChanges(allowedChangesCount, changesMade);
  }

  //  // try to render children if something is wrong with them
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.CHILDREN))
    this.renderChildren();

  goog.base(this, 'renderInternal');
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.cursorChanged = function() {
  goog.base(this, 'cursorChanged');
  this.propagateCursor();
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.parentCursorChanged = function() {
  goog.base(this, 'parentCursorChanged');
  this.propagateCursor();
};


/**
 * Propagates cursor to its children.
 */
acgraph.vector.Layer.prototype.propagateCursor = function() {
  for (var i = this.children.length; i--;) {
    this.children[i].parentCursorChanged();
    this.children[i].parentCursor = /** @type {?acgraph.vector.Cursor} */ (this.cursor() || this.parentCursor);
  }
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.renderCursor = function() {
  this.clearDirtyState(acgraph.vector.Element.DirtyState.CURSOR);
};


/**
 * Renders children and removes CHILDREN flag if succeeds.
 * @protected
 */
acgraph.vector.Layer.prototype.renderChildren = function() {
  // Invoke Array Reduce on the array of children with initial false
  var needsReRender = goog.array.reduce(this.children,
      function(previousValue, child) {
        // If a child is unsynced
        if (child.isDirty())
          // Give him an opportunity to render
          child.render();
        // If a child is still dirty - change reduce value to true
        return previousValue || child.isDirty();
      }, false);

  // If there are no more dirty children - clear the flag
  if (!needsReRender)
    this.clearDirtyState(acgraph.vector.Element.DirtyState.CHILDREN);
};


/**
 * Sequentially applies a list of DOM changes to layer elements, index corrections are noted.
 * Ecit if we are not allowed to do enough changes or we need to change element that is not created.
 * @param {number} maxChanges Maximal quantity of allowed DOM changes.
 * @return {number} Quantity of real DOM changes.
 * @protected
 */
acgraph.vector.Layer.prototype.renderChildrenDom = function(maxChanges) {
  // get DOM element
  var domElement = this.domElement();
  // declarations
  var child, domChild, i, len, j, jLen, changesMade = 0;
  // if it is a first call of renderChildrenDom in first rendering phase - create
  // children hashmap. This cache will be reset with dirtyState DOM_CHILDREN.
  if (!this.expectedChidrenHash_) {
    this.expectedChidrenHash_ = {};
    for (i = 0, len = this.children.length; i < len; i++)
      this.expectedChidrenHash_[goog.getUid(this.children[i])] = true;
  }
  // this flag tell that we already did appendChild  and even if compared children are identical
  // we need to add them again.
  var flagAdded = false;

  // this flag tells us we are OK: we have enough operation and never tried to change
  // children without DOM elements.
  var flagSuccess = true;
  // array of added children. contains indices from this.children added to the end of this.domChildren.
  var addings = [];
  // array of removed children. contains indices from this.domChildren which were removed.
  var removings = [];
  // renderer for add() and remove() functions closure
  var renderer = acgraph.getRenderer();
  // closed function add(), it adds a child to DOM, if it is possible and sets flagSuccess in case of failure
  // returns boolean - adding success or failure.
  var add = function(child) {
    var childDom = child.domElement();
    if (childDom) {
      renderer.appendChild(domElement, childDom);
      changesMade++;
      addings.push(i);
      child.notifyPrevParent(true);
    } else {
      flagSuccess = false;
    }
    return !!domElement;
  };
  // closed function remove(), it removes a child from DOM
  var remove = function(child) {
    var childDom = child.domElement();
    // in theory we don't need this check, cause an element without DOM can't appear in this.domChildren,
    // but we still check, just in case something nasty happened...
    if (childDom) {
      renderer.removeNode(childDom);
      changesMade++;
    }
    child.notifyPrevParent(false);
    removings.push(j);
  };

  var childrenOk = true;
  for (i = 0, len = this.children.length - 1; i < len; i++) {
    if (this.children[i + 1].zIndex() < this.children[i].zIndex()) {
      childrenOk = false;
      break;
    }
  }

  // Real order of children (taking zIndex into account).
  var children;
  if (childrenOk)
    children = this.children;
  else {
    children = goog.array.clone(this.children);
    goog.array.stableSort(children, function(a, b) {
      return a.zIndex() - b.zIndex();
    });
  }

  // iterate through this.children and this.domChildren simultaneously, checking changes limit
  // (on each itaration we move to the current element in .domChildren, and current element in .children
  // is moved only in case if current element of .domChildren stays a child of this Layer).
  for (i = 0, len = children.length, j = 0, jLen = this.domChildren.length;
       i < len && j < jLen && changesMade < maxChanges;
       j++) {
    child = children[i];
    domChild = this.domChildren[j];
    // if .domChildren element must stay this layer child
    if (goog.getUid(domChild) in this.expectedChidrenHash_) {
      // if the elements are different or we've already added element to the end
      if (domChild != child || flagAdded) {
        // try to add a child into the end of DOM layer
        if (!add(child))
          // exit if failed
          break;
        // if succeeded - keep track of adding
        flagAdded = true;
      }
      // move to the next element in this.children
      i++;
    } else {
      // if this element of .domChildren was removed from a layer - remove it from DOM
      remove(domChild);
    }
  }
  if (changesMade >= maxChanges) {
    flagSuccess = false;
  }

  if (flagSuccess) {
    for (; i < len && changesMade < maxChanges; i++) {
      if (!add(children[i]))
        break;
    }

    for (; j < jLen && changesMade < maxChanges; j++) {
      remove(this.domChildren[j]);
    }

    if (i < len || j < jLen)
      flagSuccess = false;
  }

  if (flagSuccess) {
    this.domChildren = goog.array.slice(children, 0);
    this.expectedChidrenHash_ = null;
    this.clearDirtyState(acgraph.vector.Element.DirtyState.CHILDREN_SET);
  } else {
    for (i = removings.length; i--;)
      goog.array.splice(this.domChildren, removings[i], 1);
    for (i = 0; i < addings.length; i++)
      this.domChildren.push(children[addings[i]]);
  }

  return changesMade;
};


/**
 * Notifies layer that child was removed from DOM (for example, added to another layer).
 * @param {acgraph.vector.Element} child Removed child.
 */
acgraph.vector.Layer.prototype.notifyRemoved = function(child) {
  if (this.isDisposed()) return;
  var index = goog.array.indexOf(this.domChildren, child);
  if (index >= 0)
    goog.array.splice(this.domChildren, index, 1);
};


/**
 * Apply all layer settings to its DOM element.
 * @protected
 */
acgraph.vector.Layer.prototype.renderData = function() {
  // Set attributes to layer DOM element
  acgraph.getRenderer().setLayerSize(this);
  // Clear DATA flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.DATA);
};


/**
 * Applies transformation to the DOM element.
 * @protected
 */
acgraph.vector.Layer.prototype.renderTransformation = function() {
  // clear unsync flag
  if (this.hasDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION))
    acgraph.getRenderer().setLayerTransformation(this);
  // remove unsync flag
  this.clearDirtyState(acgraph.vector.Element.DirtyState.TRANSFORMATION);
  this.clearDirtyState(acgraph.vector.Element.DirtyState.PARENT_TRANSFORMATION);
};


//endregion
//region --- Section Bounds ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Bounds
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Layer.prototype.getBoundsWithTransform = function(transform) {
  var isSelfTransform = transform == this.getSelfTransformation();
  var isFullTransform = transform == this.getFullTransformation();
  if (this.boundsCache && isSelfTransform)
    return this.boundsCache.clone();
  else if (this.absoluteBoundsCache && isFullTransform)
    return this.absoluteBoundsCache.clone();
  else {
    /** @type {goog.math.Rect} */
    var bounds = null;
    for (var i = 0, len = this.children.length; i < len; i++) {
      /** @type {acgraph.vector.Element} */
      var child = this.children[i];
      /** @type {!goog.math.Rect} */
      var childBounds = child.getBoundsWithTransform(acgraph.math.concatMatrixes(transform,
          child.getSelfTransformation()));
      if (!isNaN(childBounds.left) && !isNaN(childBounds.top) && !isNaN(childBounds.width) && !isNaN(childBounds.height))
        if (bounds)
          bounds.boundingRect(childBounds);
        else
          bounds = childBounds;
    }
    if (!bounds)
      bounds = acgraph.math.getBoundsOfRectWithTransform(new goog.math.Rect(0, 0, 0, 0), transform);
    if (isSelfTransform)
      this.boundsCache = bounds.clone();
    if (isFullTransform)
      this.absoluteBoundsCache = bounds.clone();
    return bounds;
  }
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.beforeTransformationChanged = function() {
  for (var i = this.children.length; i--;) {
    this.children[i].beforeTransformationChanged();
  }
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.transformationChanged = function() {
  goog.base(this, 'transformationChanged');
  this.propagateTransform();
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.parentTransformationChanged = function() {
  goog.base(this, 'parentTransformationChanged');
  this.propagateTransform();
};


/**
 * Propagetes own transformation to children.
 * @protected
 */
acgraph.vector.Layer.prototype.propagateTransform = function() {
  for (var i = this.children.length; i--;) {
    this.children[i].parentTransformationChanged();
  }
};


/**
 * Notifief layer that clipping rectangle of a chilc changed.
 */
acgraph.vector.Layer.prototype.childClipChanged = function() {
  if (acgraph.getRenderer().needsReClipOnBoundsChange()) {
    this.setDirtyState(acgraph.vector.Element.DirtyState.CLIP);
    if (this.hasParent()) this.parent().childClipChanged();
  }
};


//----------------------------------------------------------------------------------------------------------------------
//
//  Serialize
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Layer.prototype.deserialize = function(data) {
  var children = data['children'];

  goog.array.forEach(children, function(item) {
    var type = item['type'];
    var primitive;
    switch (type) {
      case 'rect':
        primitive = this.rect();
        break;
      case 'circle':
        primitive = this.circle();
        break;
      case 'ellipse':
        primitive = this.ellipse();
        break;
      case 'image':
        primitive = this.image();
        break;
      case 'text':
        primitive = this.text();
        break;
      case 'path':
        primitive = this.path();
        break;
      case 'layer':
        primitive = this.layer();
        break;
      default:
        primitive = null;
        break;
    }

    if (primitive) primitive.deserialize(item);
  }, this);
  goog.base(this, 'deserialize', data);
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.serialize = function() {
  var data = goog.base(this, 'serialize');

  var childrenData = [];
  this.forEachChild(function(child) {
    childrenData.push(child.serialize());
  });

  data['type'] = 'layer';
  data['children'] = childrenData;

  return data;
};


//endregion
//region --- Section Disposing ---
//----------------------------------------------------------------------------------------------------------------------
//
//  Disposing
//
//----------------------------------------------------------------------------------------------------------------------
/** @inheritDoc */
acgraph.vector.Layer.prototype.disposeInternal = function() {
  if (this.children) {
    goog.disposeAll.apply(null, this.children);
  }
  if (this.domChildren) {
    delete this.domChildren;
  }

  this.dropBoundsCache();

  goog.base(this, 'disposeInternal');
};


/** @inheritDoc */
acgraph.vector.Layer.prototype.finalizeDisposing = function() {
  // TODO(Anton Saukh): as far as I see this finalization of children has been already invoked in notifyPrevParent()
  // upon the real disposing. If so - we dont need to add finalizeDisposing into Element.
  if (this.children) {
    goog.array.forEach(this.children, function(child) {
      child.finalizeDisposing();
    });
  }

  // we use these arrays for rendering, so we need to remove them here
  delete this.domChildren;
  delete this.children;

  goog.base(this, 'finalizeDisposing');
};
//endregion


//exports
(function() {
  var proto = acgraph.vector.Layer.prototype;
  goog.exportSymbol('acgraph.vector.Layer', acgraph.vector.Layer);
  proto['addChild'] = proto.addChild;
  proto['addChildAt'] = proto.addChildAt;
  proto['removeChild'] = proto.removeChild;
  proto['removeChildAt'] = proto.removeChildAt;
  proto['removeChildren'] = proto.removeChildren;
  proto['swapChildren'] = proto.swapChildren;
  proto['swapChildrenAt'] = proto.swapChildrenAt;
  proto['getChildAt'] = proto.getChildAt;
  proto['hasChild'] = proto.hasChild;
  proto['forEachChild'] = proto.forEachChild;
  proto['indexOfChild'] = proto.indexOfChild;
  proto['numChildren'] = proto.numChildren;
  proto['circle'] = proto.circle;
  proto['layer'] = proto.layer;
  proto['unmanagedLayer'] = proto.unmanagedLayer;
  proto['ellipse'] = proto.ellipse;
  proto['rect'] = proto.rect;
  proto['truncatedRect'] = proto.truncatedRect;
  proto['roundedRect'] = proto.roundedRect;
  proto['roundedInnerRect'] = proto.roundedInnerRect;
  proto['path'] = proto.path;
  proto['star'] = proto.star;
  acgraph.vector.Layer.prototype['star4'] = acgraph.vector.Layer.prototype.star4;
  acgraph.vector.Layer.prototype['star5'] = acgraph.vector.Layer.prototype.star5;
  acgraph.vector.Layer.prototype['star6'] = acgraph.vector.Layer.prototype.star6;
  acgraph.vector.Layer.prototype['star7'] = acgraph.vector.Layer.prototype.star7;
  acgraph.vector.Layer.prototype['star10'] = acgraph.vector.Layer.prototype.star10;
  proto['diamond'] = proto.diamond;
  proto['triangleUp'] = proto.triangleUp;
  proto['triangleDown'] = proto.triangleDown;
  proto['triangleRight'] = proto.triangleRight;
  proto['triangleLeft'] = proto.triangleLeft;
  proto['cross'] = proto.cross;
  proto['diagonalCross'] = proto.diagonalCross;
  proto['hLine'] = proto.hLine;
  proto['vLine'] = proto.vLine;
  proto['pie'] = proto.pie;
  proto['donut'] = proto.donut;
  proto['text'] = proto.text;
  proto['html'] = proto.html;
  proto['image'] = proto.image;
})();
