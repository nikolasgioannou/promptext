import type { Node } from "./node";
import type { ParamsFor } from "../types/params";
import { compileRenderer } from "../render/renderer";

export interface BlockNode<
  C extends readonly Node[] = readonly Node[],
  Sep extends string = "\n\n"
> extends Node {
  readonly kind: "block";
  readonly children: C;
  readonly joinWith: Sep;
  readonly indentLevel: number;
}

export type Block<
  C extends readonly Node[] = readonly Node[],
  Sep extends string = "\n\n"
> = BlockNode<C, Sep> & {
  join<NewSep extends string>(sep: NewSep): Block<C, NewSep>;
  indent(level?: number): Block<C, Sep>;
  render(params: ParamsFor<BlockNode<C, Sep>>): string;
};

export const block = <C extends readonly Node[]>(
  ...children: C
): Block<C, "\n\n"> => makeBlock(children, "\n\n", 0);

const makeBlock = <C extends readonly Node[], Sep extends string>(
  children: C,
  joinWith: Sep,
  indentLevel: number
): Block<C, Sep> => {
  const renderer = compileRenderer();

  return {
    kind: "block",
    children,
    joinWith,
    indentLevel,

    join<NewSep extends string>(sep: NewSep) {
      return makeBlock(this.children, sep, this.indentLevel);
    },

    indent(level: number = 1) {
      return makeBlock(this.children, this.joinWith, this.indentLevel + level);
    },

    render(params) {
      return renderer(this, params as Record<string, unknown>);
    },
  };
};
