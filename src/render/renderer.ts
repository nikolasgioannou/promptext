import type { Node } from "../ast/node";
import type { TextNode } from "../ast/text";
import type { BlockNode } from "../ast/block";
import type { WhenNode } from "../ast/when";
import type { XmlNode } from "../ast/xml";

type RenderOptions = {
  indentUnit?: string;
  strictPlaceholders?: boolean;
};

const defaultOptions: Required<RenderOptions> = {
  indentUnit: "  ",
  strictPlaceholders: true,
};

export const compileRenderer = (options?: RenderOptions) => {
  const { indentUnit, strictPlaceholders } = {
    ...defaultOptions,
    ...options,
  };

  const replace = (template: string, values: Record<string, unknown>) =>
    template.replace(/\{([^}]+)\}/g, (_, k) => {
      const v = values[k];
      if (v == null) {
        if (strictPlaceholders) {
          throw new Error(`Missing value for {${k}}`);
        }
        return "";
      }
      return String(v);
    });

  const applyIndent = (s: string, level: number) => {
    if (level <= 0) return s;
    const pad = indentUnit.repeat(level);
    return s
      .split("\n")
      .map((l) => (l ? pad + l : l))
      .join("\n");
  };

  const renderNode = (n: Node, params: Record<string, unknown>): string => {
    switch (n.kind) {
      case "text": {
        const t = n as TextNode;
        return applyIndent(replace(t.content, params), t.indentLevel);
      }

      case "block": {
        const b = n as BlockNode;
        const out = b.children
          .map((c) => renderNode(c, params))
          .join(b.joinWith);
        return applyIndent(out, b.indentLevel);
      }

      case "xml": {
        const x = n as XmlNode;
        const inner = x.children
          .map((c) => renderNode(c, params))
          .join(x.joinWith);

        const wrapped = `<${x.name}>\n` + inner + `\n</${x.name}>`;

        return applyIndent(wrapped, x.indentLevel);
      }

      case "when": {
        const w = n as WhenNode;
        const branch = params[w.key] === true ? w.then : w.else;
        return branch ? renderNode(branch, params) : "";
      }
    }
  };

  return (node: Node, params: Record<string, unknown>) =>
    renderNode(node, params);
};
