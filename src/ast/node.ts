export interface Node {
  readonly kind: "text" | "block" | "when" | "xml";
}
