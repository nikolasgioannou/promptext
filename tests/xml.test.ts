import { describe, it, expect } from "vitest";
import { text, xml, block } from "../src/index";

describe("XML Nodes", () => {
  it("should render basic XML tag with text content", () => {
    const node = xml("tag", text("content"));
    const result = node.render({});
    expect(result).toBe("<tag>\ncontent\n</tag>");
  });

  it("should render XML with multiple children (default separator)", () => {
    const node = xml("user", text("Name: {name}"), text("Age: {age}"));
    const result = node.render({ name: "Nikolas", age: "25" });
    expect(result).toBe("<user>\nName: Nikolas\n\nAge: 25\n</user>");
  });

  it("should use custom separator with join", () => {
    const node = xml("user", text("Name: {name}"), text("Age: {age}")).join(
      "\n"
    );
    const result = node.render({ name: "Nikolas", age: "25" });
    expect(result).toBe("<user>\nName: Nikolas\nAge: 25\n</user>");
  });

  it("should indent XML tag", () => {
    const node = xml("tag", text("content")).indent();
    const result = node.render({});
    expect(result).toBe("  <tag>\n  content\n  </tag>");
  });

  it("should indent XML tag with custom level", () => {
    const node = xml("tag", text("content")).indent(2);
    const result = node.render({});
    expect(result).toBe("    <tag>\n    content\n    </tag>");
  });

  it("should render nested XML tags", () => {
    const node = xml("outer", xml("inner", text("content")));
    const result = node.render({});
    expect(result).toBe("<outer>\n<inner>\ncontent\n</inner>\n</outer>");
  });

  it("should render nested XML with indentation", () => {
    const node = xml(
      "user",
      xml("name", text("{name}")).indent(),
      xml("role", text("{role}")).indent()
    );
    const result = node.render({ name: "Nikolas", role: "admin" });
    expect(result).toBe(
      "<user>\n  <name>\n  Nikolas\n  </name>\n\n  <role>\n  admin\n  </role>\n</user>"
    );
  });

  it("should handle XML with block children", () => {
    const node = xml(
      "container",
      block(text("Line 1"), text("Line 2")).join("\n")
    );
    const result = node.render({});
    expect(result).toBe("<container>\nLine 1\nLine 2\n</container>");
  });

  it("should handle empty XML tag", () => {
    const node = xml("empty");
    const result = node.render({});
    expect(result).toBe("<empty>\n\n</empty>");
  });

  it("should render XML with placeholders", () => {
    const node = xml("message", text("Hello {name}!"));
    const result = node.render({ name: "World" });
    expect(result).toBe("<message>\nHello World!\n</message>");
  });

  it("should handle complex nested XML structure", () => {
    const node = xml(
      "document",
      xml("header", text("Title: {title}")).indent(),
      xml("body", text("Content goes here")).indent()
    );
    const result = node.render({ title: "My Document" });
    expect(result).toBe(
      "<document>\n  <header>\n  Title: My Document\n  </header>\n\n  <body>\n  Content goes here\n  </body>\n</document>"
    );
  });

  it("should combine join and indent on XML", () => {
    const node = xml("list", text("Item 1"), text("Item 2"), text("Item 3"))
      .join("\n")
      .indent();
    const result = node.render({});
    expect(result).toBe("  <list>\n  Item 1\n  Item 2\n  Item 3\n  </list>");
  });

  // Plain string tests
  it("should render xml with plain string", () => {
    const node = xml("tag", "Plain content");
    expect(node.render({})).toBe("<tag>\nPlain content\n</tag>");
  });

  it("should render xml with multiple plain strings", () => {
    const node = xml("div", "Line 1", "Line 2");
    expect(node.render({})).toBe("<div>\nLine 1\n\nLine 2\n</div>");
  });

  it("should render xml with mixed strings and text nodes", () => {
    const node = xml("tag", "Literal", text("Hello {name}"));
    expect(node.render({ name: "World" })).toBe(
      "<tag>\nLiteral\n\nHello World\n</tag>"
    );
  });

  it("should NOT interpolate placeholders in plain strings in xml", () => {
    const node = xml("code", "function {name}() {}");
    expect(node.render({})).toBe("<code>\nfunction {name}() {}\n</code>");
  });

  it("should keep braces literal in xml even with params provided", () => {
    const node = xml("div", "Literal {name}", text("Interpolated {name}"));
    expect(node.render({ name: "Nikolas" })).toBe(
      "<div>\nLiteral {name}\n\nInterpolated Nikolas\n</div>"
    );
  });

  it("should respect custom separator with strings in xml", () => {
    const node = xml("span", "A", "B", "C").join(", ");
    expect(node.render({})).toBe("<span>\nA, B, C\n</span>");
  });

  it("should indent xml with plain strings", () => {
    const node = xml("div", "Content").indent();
    expect(node.render({})).toBe("  <div>\n  Content\n  </div>");
  });

  it("should handle nested xml with strings", () => {
    const inner = xml("inner", "Inner content");
    const outer = xml("outer", "Before", inner, "After");
    expect(outer.render({})).toBe(
      "<outer>\nBefore\n\n<inner>\nInner content\n</inner>\n\nAfter\n</outer>"
    );
  });

  it("should handle empty string in xml", () => {
    const node = xml("tag", "", "Content");
    expect(node.render({})).toBe("<tag>\nContent\n</tag>");
  });
});
