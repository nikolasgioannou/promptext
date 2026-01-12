import type { Node } from "../ast/node";
import type { TextNode } from "../ast/text";
import type { BlockNode } from "../ast/block";
import type { WhenNode } from "../ast/when";
import type { XmlNode } from "../ast/xml";
import type { ExtractPlaceholders } from "./string";

type PlaceholderKeys<N extends Node> =
  N extends TextNode<infer T>
    ? ExtractPlaceholders<T>
    : N extends BlockNode<infer C, any>
      ? PlaceholderKeys<Extract<C[number], Node>>
      : N extends XmlNode<any, infer C, any>
        ? PlaceholderKeys<Extract<C[number], Node>>
        : N extends WhenNode<any, infer T, infer E>
          ?
              | PlaceholderKeys<Extract<T, Node>>
              | PlaceholderKeys<Extract<NonNullable<E>, Node>>
          : never;

type WhenKeys<N extends Node> =
  N extends WhenNode<infer K, infer T, infer E>
    ? K | WhenKeys<Extract<T, Node>> | WhenKeys<Extract<NonNullable<E>, Node>>
    : N extends BlockNode<infer C, any>
      ? WhenKeys<Extract<C[number], Node>>
      : N extends XmlNode<any, infer C, any>
        ? WhenKeys<Extract<C[number], Node>>
        : never;

export type PlaceholderParams<N extends Node> =
  PlaceholderKeys<N> extends never ? {} : { [K in PlaceholderKeys<N>]: string };

export type WhenParams<N extends Node> =
  WhenKeys<N> extends never ? {} : { [K in WhenKeys<N>]: boolean };

export type ParamsFor<N extends Node> = PlaceholderParams<N> & WhenParams<N>;
