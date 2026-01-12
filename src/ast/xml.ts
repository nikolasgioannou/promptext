import type { Node } from "./node";
import type { ParamsFor } from "../types/params";
import { compileRenderer } from "../render/renderer";

export interface XmlNode<
  Name extends string = string,
  C extends readonly (Node | string)[] = readonly (Node | string)[],
  Sep extends string = "\n\n",
> extends Node {
  readonly kind: "xml";
  readonly name: Name;
  readonly children: C;
  readonly joinWith: Sep;
  readonly indentLevel: number;
}

export type Xml<
  Name extends string = string,
  C extends readonly (Node | string)[] = readonly (Node | string)[],
  Sep extends string = "\n\n",
> = XmlNode<Name, C, Sep> & {
  join<NewSep extends string>(sep: NewSep): Xml<Name, C, NewSep>;
  indent(level?: number): Xml<Name, C, Sep>;
  render(params: ParamsFor<XmlNode<Name, C, Sep>>): string;
};

export const xml = <Name extends string, C extends readonly (Node | string)[]>(
  name: Name,
  ...children: C
): Xml<Name, C, "\n\n"> => makeXml(name, children, "\n\n", 0);

const makeXml = <
  Name extends string,
  C extends readonly (Node | string)[],
  Sep extends string,
>(
  name: Name,
  children: C,
  joinWith: Sep,
  indentLevel: number
): Xml<Name, C, Sep> => {
  const renderer = compileRenderer();

  return {
    kind: "xml",
    name,
    children,
    joinWith,
    indentLevel,

    join<NewSep extends string>(sep: NewSep) {
      return makeXml(name, children, sep, indentLevel);
    },

    indent(level: number = 1) {
      return makeXml(name, children, joinWith, indentLevel + level);
    },

    render(params) {
      return renderer(this, params as Record<string, unknown>);
    },
  };
};
