type Attributes<K extends keyof HTMLElementTagNameMap> = Partial<
  Omit<HTMLElementTagNameMap[K], `on${string}` | "style"> & {
    onClick: (event: MouseEvent) => void;
    style: Partial<CSSStyleDeclaration>;
  }
>;

type PartialHTMLElementTagNameMap = { [P in keyof HTMLElementTagNameMap]: Attributes<P> };

/** @internal */
declare global {
  namespace JSX {
    interface Element extends HTMLElement {}
    interface IntrinsicElements extends PartialHTMLElementTagNameMap {}
  }
}

export type DOMElement = HTMLElement | DocumentFragment;
export type DOMNode = DOMElement | string;

export function createElement<K extends keyof HTMLElementTagNameMap>(
  element: K | HTMLElementTagNameMap[K],
  options?: Attributes<K>,
  ...children: (DOMNode | DOMNode[])[]
): HTMLElementTagNameMap[K];

export function createElement(
  element?: undefined,
  options?: Partial<DocumentFragment>,
  ...children: (DOMNode | DOMNode[])[]
): DocumentFragment;

export function createElement<P, R>(element: (prop: P) => R, options: P, ...children: (DOMNode | DOMNode[])[]): R;

export function createElement(
  element?: DOMNode | CallableFunction,
  options?: Record<string, unknown>,
  ...children: (DOMNode | DOMNode[])[]
): DOMElement {
  switch (typeof element) {
    case "function":
      return element({ ...options, children: children.flat() });
    case "undefined":
      element = document.createDocumentFragment();
      Object.assign(element, options);
      break;
    case "string":
      element = document.createElement(element);
      if (options) {
        const { onClick, style, ...other } = options as Attributes<"i">;
        if (onClick) element.addEventListener("click", onClick, true);
        Object.assign(element.style, style);
        Object.assign(element, other);
      }
      break;
  }
  element.append(...children.flat());
  return element;
}

export function Ruby({ rb, rt }: { rb: DOMNode; rt: DOMNode | DOMNode[] }) {
  return (
    <ruby>
      {rb}
      <rp>(</rp>
      <rt lang="och-Latn-fonipa">
        {Array.isArray(rt)
          ? rt.flatMap((item, index) => (index ? [<span hidden> / </span>, <br />, item] : [item]))
          : rt}
      </rt>
      <rp>)</rp>
    </ruby>
  );
}

export function Table({ head, body }: { head: DOMNode[]; body: DOMNode[][] }) {
  return (
    <table>
      <thead>
        <tr>
          {head.flatMap((item, index) => [<th>{item}</th>, <td hidden>{index < head.length - 1 ? "\t" : "\n"}</td>])}
        </tr>
      </thead>
      <tbody>
        {body.map(row => (
          <tr>
            {row.flatMap((item, index) => [<td>{item}</td>, <td hidden>{index < row.length - 1 ? "\t" : "\n"}</td>])}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
