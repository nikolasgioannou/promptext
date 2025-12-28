import type { Node } from "./node";
import type { ParamsFor } from "../types/params";
import type { Trim } from "../types/string";
import { compileRenderer } from "../render/renderer";

export interface TextNode<T extends string = string> extends Node {
  readonly kind: "text";
  readonly content: T;
  readonly indentLevel: number;
}

export type Text<T extends string = string> = TextNode<T> & {
  trim(): Text<Trim<T>>;
  indent(level?: number): Text<T>;
  render(params: ParamsFor<TextNode<T>>): string;
};

export const text = <T extends string>(content: T): Text<T> =>
  makeText(content, 0);

const makeText = <T extends string>(
  content: T,
  indentLevel: number
): Text<T> => {
  const renderer = compileRenderer();

  return {
    kind: "text",
    content,
    indentLevel,

    trim() {
      return makeText(this.content.trim() as Trim<T>, this.indentLevel);
    },

    indent(level: number = 1) {
      return makeText(this.content, this.indentLevel + level);
    },

    render(params) {
      return renderer(this, params as Record<string, unknown>);
    },
  };
};
