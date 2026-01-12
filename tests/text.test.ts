import { describe, it, expect } from "vitest";
import { text } from "../src/index";

describe("Text Nodes", () => {
  it("should render basic text without placeholders", () => {
    const node = text("Hello World");
    const result = node.render({});
    expect(result).toBe("Hello World");
  });

  it("should interpolate single placeholder", () => {
    const node = text("Hello {name}");
    const result = node.render({ name: "Nikolas" });
    expect(result).toBe("Hello Nikolas");
  });

  it("should interpolate multiple placeholders", () => {
    const node = text("Hello {name}, you are {age} years old");
    const result = node.render({ name: "Nikolas", age: "25" });
    expect(result).toBe("Hello Nikolas, you are 25 years old");
  });

  it("should trim leading and trailing whitespace", () => {
    const node = text(`
      Hello World
    `).trim();
    const result = node.render({});
    expect(result).toBe("Hello World");
  });

  it("should apply default indentation (1 level)", () => {
    const node = text("Hello\nWorld").indent();
    const result = node.render({});
    expect(result).toBe("  Hello\n  World");
  });

  it("should apply custom indentation level", () => {
    const node = text("Hello\nWorld").indent(2);
    const result = node.render({});
    expect(result).toBe("    Hello\n    World");
  });

  it("should apply indentation to multi-line text", () => {
    const node = text("Line 1\nLine 2\nLine 3").indent();
    const result = node.render({});
    expect(result).toBe("  Line 1\n  Line 2\n  Line 3");
  });

  it("should not indent empty lines", () => {
    const node = text("Line 1\n\nLine 3").indent();
    const result = node.render({});
    expect(result).toBe("  Line 1\n\n  Line 3");
  });

  it("should throw error for missing placeholder", () => {
    const node = text("Hello {name}");
    // @ts-expect-error - we want to test the error case
    expect(() => node.render({})).toThrow("Missing value for {name}");
  });

  it("should combine trim and indent", () => {
    const node = text(`
      Hello World
    `)
      .trim()
      .indent();
    const result = node.render({});
    expect(result).toBe("  Hello World");
  });

  it("should handle placeholder with trim", () => {
    const node = text(`
      Hello {name}
    `).trim();
    const result = node.render({ name: "Nikolas" });
    expect(result).toBe("Hello Nikolas");
  });
});
