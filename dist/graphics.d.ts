declare namespace acgraph {
  /** Main namespace object */
  const acgraph: any;

  /**
   * Creates a new graphic stage (canvas) for rendering SVG/VML elements.
   * @param container ID of the HTML element or the element itself.
   * @returns The stage object.
   */
  function create(container: string | HTMLElement): Stage;

  /**
   * Stage object representing the drawing canvas.
   */
  interface Stage {
    rect(left?: number, top?: number, width?: number, height?: number): Rect;
    circle(cx?: number, cy?: number, radius?: number): Circle;
    ellipse(cx?: number, cy?: number, rx?: number, ry?: number): Ellipse;
    path(data?: string): Path;
    text(data?: string): Text;
    image(src?: string, x?: number, y?: number, width?: number, height?: number): Image;
    layer(): Layer;
    clear(): void;
    size(width: number, height: number): Stage;
    width(): number;
    width(value: number): Stage;
    height(): number;
    height(value: number): Stage;
    container(el: string | HTMLElement): Stage;
  }

  interface Element {
    fill(color: string): this;
    stroke(color: string): this;
    attr(attributes: Record<string, any>): this;
    data(value: string | any): string | this;
    show(): this;
    hide(): this;
    rotate(degrees: number, cx?: number, cy?: number): this;
    translate(tx: number, ty: number): this;
    scale(sx: number, sy?: number): this;
    transform(transform: string): this;
    id(value?: string): string | this;
    opacity(value: number): this;
    remove(): void;
  }

  interface Rect extends Element {
    r(value: number): this;
    truncatedRect(truncation: number | string): this;
  }

  interface Circle extends Element {}
  interface Ellipse extends Element {}
  interface Path extends Element {
    data(value?: string): string | this;
  }
  interface Text extends Element {
    text(value?: string): string | this;
  }
  interface Image extends Element {}
  interface Layer extends Element {
    text(data?: string): Text;
    rect(left?: number, top?: number, width?: number, height?: number): Rect;
    circle(cx?: number, cy?: number, radius?: number): Circle;
    ellipse(cx?: number, cy?: number, rx?: number, ry?: number): Ellipse;
    path(data?: string): Path;
  }
}

declare module 'graphicsjs' {
  export = acgraph;
}
