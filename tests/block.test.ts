import { describe, it, expect } from "vitest";
import { text, block, xml, when } from "../src/index";

describe("Block Nodes", () => {
  it("should render block with default separator (double newline)", () => {
    const node = block(text("Line 1"), text("Line 2"));
    const result = node.render({});
    expect(result).toBe("Line 1\n\nLine 2");
  });

  it("should render block with multiple children", () => {
    const node = block(text("First"), text("Second"), text("Third"));
    const result = node.render({});
    expect(result).toBe("First\n\nSecond\n\nThird");
  });

  it("should use custom separator with join", () => {
    const node = block(text("Line 1"), text("Line 2"), text("Line 3")).join(
      "\n"
    );
    const result = node.render({});
    expect(result).toBe("Line 1\nLine 2\nLine 3");
  });

  it("should use custom separator with no newline", () => {
    const node = block(text("Hello"), text(" "), text("World")).join("");
    const result = node.render({});
    expect(result).toBe("Hello World");
  });

  it("should indent entire block", () => {
    const node = block(text("Line 1"), text("Line 2")).indent();
    const result = node.render({});
    expect(result).toBe("  Line 1\n\n  Line 2");
  });

  it("should indent block with custom level", () => {
    const node = block(text("Line 1"), text("Line 2")).indent(2);
    const result = node.render({});
    expect(result).toBe("    Line 1\n\n    Line 2");
  });

  it("should render empty block", () => {
    const node = block();
    const result = node.render({});
    expect(result).toBe("");
  });

  it("should render nested blocks", () => {
    const node = block(
      text("Outer 1"),
      block(text("Inner 1"), text("Inner 2")),
      text("Outer 2")
    );
    const result = node.render({});
    expect(result).toBe("Outer 1\n\nInner 1\n\nInner 2\n\nOuter 2");
  });

  it("should combine join and indent", () => {
    const node = block(text("Line 1"), text("Line 2")).join("\n").indent();
    const result = node.render({});
    expect(result).toBe("  Line 1\n  Line 2");
  });

  it("should handle blocks with placeholders", () => {
    const node = block(text("Hello {name}"), text("You are {age} years old"));
    const result = node.render({ name: "Nikolas", age: "25" });
    expect(result).toBe("Hello Nikolas\n\nYou are 25 years old");
  });

  it("should render block with mixed node types", () => {
    const node = block(
      text("Text node"),
      xml("tag", text("XML content")),
      when("show", text("Conditional"))
    );
    const result = node.render({ show: true });
    expect(result).toBe(
      "Text node\n\n<tag>\nXML content\n</tag>\n\nConditional"
    );
  });

  it("should handle nested blocks with different separators", () => {
    const inner = block(text("A"), text("B")).join(", ");

    const outer = block(text("Start"), inner, text("End"));

    const result = outer.render({});
    expect(result).toBe("Start\n\nA, B\n\nEnd");
  });

  it("should render block with single string child", () => {
    const node = block("Just a string");
    const result = node.render({});
    expect(result).toBe("Just a string");
  });

  it("should handle strings and nodes together", () => {
    const node = block(
      text("First: {val1}"),
      "Middle literal",
      text("Last: {val2}")
    );
    const result = node.render({ val1: "A", val2: "B" });
    expect(result).toBe("First: A\n\nMiddle literal\n\nLast: B");
  });

  // Plain string tests
  it("should render block with multiple plain strings", () => {
    const node = block("Line 1", "Line 2", "Line 3");
    expect(node.render({})).toBe("Line 1\n\nLine 2\n\nLine 3");
  });

  it("should render block with mixed strings and text nodes", () => {
    const node = block("Literal", text("Hello {name}"));
    expect(node.render({ name: "World" })).toBe("Literal\n\nHello World");
  });

  it("should render complex mixed content", () => {
    const node = block("Header", text("Name: {name}"), "Footer");
    expect(node.render({ name: "Nikolas" })).toBe(
      "Header\n\nName: Nikolas\n\nFooter"
    );
  });

  it("should NOT interpolate placeholders in plain strings", () => {
    const node = block("Use {this} as literal");
    expect(node.render({})).toBe("Use {this} as literal");
  });

  it("should keep braces literal even with params provided", () => {
    const node = block("Literal {name}", text("Interpolated {name}"));
    expect(node.render({ name: "Nikolas" })).toBe(
      "Literal {name}\n\nInterpolated Nikolas"
    );
  });

  it("should respect custom separator with strings", () => {
    const node = block("A", "B", "C").join(", ");
    expect(node.render({})).toBe("A, B, C");
  });

  it("should respect custom separator with mixed content", () => {
    const node = block("Literal", text("Hello {name}")).join("\n");
    expect(node.render({ name: "World" })).toBe("Literal\nHello World");
  });

  it("should indent plain strings", () => {
    const node = block("Line 1", "Line 2").indent();
    expect(node.render({})).toBe("  Line 1\n\n  Line 2");
  });

  it("should indent mixed content consistently", () => {
    const node = block("Literal", text("Interpolated")).indent();
    expect(node.render({})).toBe("  Literal\n\n  Interpolated");
  });

  it("should handle multi-line strings with indentation", () => {
    const node = block("Line 1\nLine 2").indent();
    expect(node.render({})).toBe("  Line 1\n  Line 2");
  });

  it("should handle nested blocks with strings", () => {
    const inner = block("Inner 1", "Inner 2");
    const outer = block("Outer", inner);
    expect(outer.render({})).toBe("Outer\n\nInner 1\n\nInner 2");
  });

  it("should handle complex nesting with mixed content", () => {
    const node = block(
      "Header",
      block("Item 1", text("Value: {val}")).join("\n"),
      "Footer"
    );
    expect(node.render({ val: "test" })).toBe(
      "Header\n\nItem 1\nValue: test\n\nFooter"
    );
  });

  it("should handle empty string", () => {
    const node = block("", "Content");
    expect(node.render({})).toBe("\n\nContent");
  });

  it("should handle string with only whitespace", () => {
    const node = block("   ");
    expect(node.render({})).toBe("   ");
  });
});
