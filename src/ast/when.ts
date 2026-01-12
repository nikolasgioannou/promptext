import type { Node } from "./node";
import type { ParamsFor } from "../types/params";
import { compileRenderer } from "../render/renderer";

export interface WhenNode<
  K extends string = string,
  Then extends Node | string = Node | string,
  Else extends Node | string | undefined = Node | string | undefined,
> extends Node {
  readonly kind: "when";
  readonly key: K;
  readonly then: Then;
  readonly else?: Else;
}

export type When<
  K extends string = string,
  Then extends Node | string = Node | string,
  Else extends Node | string | undefined = Node | string | undefined,
> = WhenNode<K, Then, Else> & {
  render(params: ParamsFor<WhenNode<K, Then, Else>>): string;
};

export function when<K extends string, Then extends Node | string>(
  key: K,
  thenNode: Then
): When<K, Then, undefined>;
export function when<
  K extends string,
  Then extends Node | string,
  Else extends Node | string,
>(key: K, thenNode: Then, elseNode: Else): When<K, Then, Else>;
export function when<
  K extends string,
  Then extends Node | string,
  Else extends Node | string,
>(key: K, thenNode: Then, elseNode?: Else): When<K, Then, Else | undefined> {
  return makeWhen(key, thenNode, elseNode);
}

const makeWhen = <
  K extends string,
  Then extends Node | string,
  Else extends Node | string | undefined,
>(
  key: K,
  thenNode: Then,
  elseNode: Else
): When<K, Then, Else> => {
  const renderer = compileRenderer();

  return {
    kind: "when",
    key,
    then: thenNode,
    else: elseNode,

    render(params) {
      return renderer(this, params as Record<string, unknown>);
    },
  };
};
