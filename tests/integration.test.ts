import { describe, it, expect } from "vitest";
import { text, block, when, xml } from "../src/index";

describe("Integration Tests", () => {
  it("should render README example correctly", () => {
    const prompt = block(
      text("Hello {name}!"),
      when(
        "isAdmin",
        text("You have admin access."),
        text("You are a regular user.")
      )
    );

    const resultAdmin = prompt.render({
      name: "Nikolas",
      isAdmin: true,
    });
    expect(resultAdmin).toBe("Hello Nikolas!\n\nYou have admin access.");

    const resultUser = prompt.render({
      name: "Nikolas",
      isAdmin: false,
    });
    expect(resultUser).toBe("Hello Nikolas!\n\nYou are a regular user.");
  });

  it("should handle complex nested structure with all node types", () => {
    const prompt = block(
      text("System Prompt"),
      xml(
        "user",
        text("Name: {name}").indent(),
        when(
          "isAdmin",
          text("Role: Administrator").indent(),
          text("Role: User").indent()
        )
      ),
      when("showFooter", text("---\nEnd of message"))
    );

    const result = prompt.render({
      name: "Nikolas",
      isAdmin: true,
      showFooter: true,
    });

    expect(result).toBe(
      "System Prompt\n\n<user>\n  Name: Nikolas\n\n  Role: Administrator\n</user>\n\n---\nEnd of message"
    );
  });

  it("should handle deeply nested blocks", () => {
    const prompt = block(
      text("Level 1"),
      block(
        text("Level 2"),
        block(text("Level 3"), text("Level 3 again")).join("\n")
      ),
      text("Back to Level 1")
    );

    const result = prompt.render({});
    expect(result).toBe(
      "Level 1\n\nLevel 2\n\nLevel 3\nLevel 3 again\n\nBack to Level 1"
    );
  });

  it("should handle admin panel example from README", () => {
    const prompt = block(
      text("Hello {name}!"),
      when(
        "isAdmin",
        block(
          text("Admin panel enabled."),
          text("You have {count} pending approvals.")
        ).join("\n"),
        text("Standard user mode.")
      )
    );

    const resultAdmin = prompt.render({
      name: "Nikolas",
      isAdmin: true,
      count: "5",
    });
    expect(resultAdmin).toBe(
      "Hello Nikolas!\n\nAdmin panel enabled.\nYou have 5 pending approvals."
    );

    const resultUser = prompt.render({
      name: "Nikolas",
      isAdmin: false,
      count: "0",
    });
    expect(resultUser).toBe("Hello Nikolas!\n\nStandard user mode.");
  });

  it("should handle XML example from README", () => {
    const prompt = xml(
      "user",
      xml("name", text("{name}")).indent(),
      xml("role", text("{role}")).indent()
    );

    const result = prompt.render({
      name: "Nikolas",
      role: "admin",
    });

    expect(result).toBe(
      "<user>\n  <name>\n  Nikolas\n  </name>\n\n  <role>\n  admin\n  </role>\n</user>"
    );
  });

  it("should handle complex prompt with mixed indentation levels", () => {
    const prompt = block(
      text("Root level"),
      xml(
        "section",
        block(text("Item 1"), text("Item 2")).join("\n").indent()
      ).indent(),
      text("Back to root")
    );

    const result = prompt.render({});
    expect(result).toBe(
      "Root level\n\n  <section>\n    Item 1\n    Item 2\n  </section>\n\nBack to root"
    );
  });

  it("should handle conditional XML structure", () => {
    const prompt = xml(
      "document",
      text("Title: {title}").indent(),
      when(
        "includeMetadata",
        xml(
          "metadata",
          text("Author: {author}").indent(),
          text("Date: {date}").indent()
        )
          .join("\n")
          .indent()
      ),
      text("Content: {content}").indent()
    );

    const resultWithMetadata = prompt.render({
      title: "My Doc",
      includeMetadata: true,
      author: "Nikolas",
      date: "2024-01-01",
      content: "Hello",
    });

    expect(resultWithMetadata).toBe(
      "<document>\n  Title: My Doc\n\n  <metadata>\n    Author: Nikolas\n    Date: 2024-01-01\n  </metadata>\n\n  Content: Hello\n</document>"
    );

    const resultWithoutMetadata = prompt.render({
      title: "My Doc",
      includeMetadata: false,
      author: "",
      date: "",
      content: "Hello",
    });

    expect(resultWithoutMetadata).toBe(
      "<document>\n  Title: My Doc\n\n\n\n  Content: Hello\n</document>"
    );
  });

  it("should handle multi-line text with trim in complex structure", () => {
    const prompt = block(
      text(`
        This is a multi-line
        introduction text
      `).trim(),
      xml(
        "content",
        text(`
          Nested content
          with multiple lines
        `)
          .trim()
          .indent()
      )
    );

    const result = prompt.render({});
    expect(result).toBe(
      "This is a multi-line\n        introduction text\n\n<content>\n  Nested content\n            with multiple lines\n</content>"
    );
  });

  it("should handle multiple conditional branches in sequence", () => {
    const prompt = block(
      when("showHeader", text("=== Header ===")),
      text("Main content"),
      when("showWarning", text("⚠️ Warning message")),
      when("showFooter", text("=== Footer ==="))
    );

    const resultAll = prompt.render({
      showHeader: true,
      showWarning: true,
      showFooter: true,
    });
    expect(resultAll).toBe(
      "=== Header ===\n\nMain content\n\n⚠️ Warning message\n\n=== Footer ==="
    );

    const resultNone = prompt.render({
      showHeader: false,
      showWarning: false,
      showFooter: false,
    });
    expect(resultNone).toBe("\n\nMain content\n\n\n\n");
  });

  it("should handle complex real-world prompt scenario", () => {
    const systemPrompt = block(
      text("You are a helpful assistant."),
      when(
        "includeRules",
        block(
          text("Rules:"),
          text("- Be concise"),
          text("- Be accurate"),
          text("- Be helpful")
        ).join("\n")
      )
    );

    const userMessage = xml(
      "message",
      xml("role", text("user")).indent(),
      xml("content", text("{userInput}")).indent()
    );

    const fullPrompt = block(systemPrompt, userMessage);

    const result = fullPrompt.render({
      includeRules: true,
      userInput: "Hello, how are you?",
    });

    expect(result).toBe(
      "You are a helpful assistant.\n\nRules:\n- Be concise\n- Be accurate\n- Be helpful\n\n<message>\n  <role>\n  user\n  </role>\n\n  <content>\n  Hello, how are you?\n  </content>\n</message>"
    );
  });

  // Plain string integration tests
  it("should handle complex nested structures with strings everywhere", () => {
    const node = block(
      "Header",
      xml(
        "section",
        "Section header",
        when("showContent", "Content is visible", "Content is hidden"),
        "Section footer"
      ),
      "Footer"
    );
    expect(node.render({ showContent: true })).toBe(
      "Header\n\n<section>\nSection header\n\nContent is visible\n\nSection footer\n</section>\n\nFooter"
    );
  });

  it("should mix all node types with strings and text nodes", () => {
    const node = block(
      "Start",
      xml("tag", "Static", text("Dynamic {val}")),
      when("flag", "Conditional string", text("Or {val}")),
      "End"
    );
    expect(node.render({ flag: true, val: "test" })).toBe(
      "Start\n\n<tag>\nStatic\n\nDynamic test\n</tag>\n\nConditional string\n\nEnd"
    );
  });
});
