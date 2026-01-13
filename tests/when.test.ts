import { describe, it, expect } from "vitest";
import { text, block, when } from "../src/index";

describe("When Conditional Nodes", () => {
  it("should render then branch when condition is true", () => {
    const node = when("isAdmin", text("Admin mode"));
    const result = node.render({ isAdmin: true });
    expect(result).toBe("Admin mode");
  });

  it("should render else branch when condition is false", () => {
    const node = when("isAdmin", text("Admin mode"), text("User mode"));
    const result = node.render({ isAdmin: false });
    expect(result).toBe("User mode");
  });

  it("should render empty string when condition is false and no else branch", () => {
    const node = when("isAdmin", text("Admin mode"));
    const result = node.render({ isAdmin: false });
    expect(result).toBe("");
  });

  it("should handle when with placeholders in then branch", () => {
    const node = when("isAdmin", text("Hello {name}"));
    const result = node.render({ isAdmin: true, name: "Nikolas" });
    expect(result).toBe("Hello Nikolas");
  });

  it("should handle when with placeholders in else branch", () => {
    const node = when("isAdmin", text("Admin {name}"), text("User {name}"));
    const result = node.render({ isAdmin: false, name: "Nikolas" });
    expect(result).toBe("User Nikolas");
  });

  it("should handle nested when conditions", () => {
    const node = when(
      "isAdmin",
      when("isSuperAdmin", text("Super Admin"), text("Regular Admin")),
      text("User")
    );

    const resultSuperAdmin = node.render({ isAdmin: true, isSuperAdmin: true });
    expect(resultSuperAdmin).toBe("Super Admin");

    const resultRegularAdmin = node.render({
      isAdmin: true,
      isSuperAdmin: false,
    });
    expect(resultRegularAdmin).toBe("Regular Admin");

    const resultUser = node.render({ isAdmin: false, isSuperAdmin: false });
    expect(resultUser).toBe("User");
  });

  it("should handle when inside block", () => {
    const node = block(
      text("Start"),
      when("show", text("Conditional content")),
      text("End")
    );

    const resultShown = node.render({ show: true });
    expect(resultShown).toBe("Start\n\nConditional content\n\nEnd");

    const resultHidden = node.render({ show: false });
    expect(resultHidden).toBe("Start\n\nEnd");
  });

  it("should handle when with block as then branch", () => {
    const node = when(
      "isAdmin",
      block(
        text("Admin panel enabled."),
        text("You have {count} pending approvals.")
      ).join("\n"),
      text("Standard user mode.")
    );

    const resultAdmin = node.render({ isAdmin: true, count: "5" });
    expect(resultAdmin).toBe(
      "Admin panel enabled.\nYou have 5 pending approvals."
    );

    const resultUser = node.render({ isAdmin: false, count: "0" });
    expect(resultUser).toBe("Standard user mode.");
  });

  it("should handle multiple when conditions in sequence", () => {
    const node = block(
      when("showHeader", text("Header")),
      text("Body"),
      when("showFooter", text("Footer"))
    );

    const resultBoth = node.render({ showHeader: true, showFooter: true });
    expect(resultBoth).toBe("Header\n\nBody\n\nFooter");

    const resultNone = node.render({ showHeader: false, showFooter: false });
    expect(resultNone).toBe("Body");

    const resultOnlyHeader = node.render({
      showHeader: true,
      showFooter: false,
    });
    expect(resultOnlyHeader).toBe("Header\n\nBody");
  });

  it("should handle boolean false explicitly", () => {
    const node = when("flag", text("True"), text("False"));

    const resultTrue = node.render({ flag: true });
    expect(resultTrue).toBe("True");

    const resultFalse = node.render({ flag: false });
    expect(resultFalse).toBe("False");
  });

  it("should only check for strict true value", () => {
    const node = when("flag", text("True"), text("False"));

    // Only true should render then branch
    const result = node.render({ flag: true });
    expect(result).toBe("True");

    // false should render else branch
    const resultFalse = node.render({ flag: false });
    expect(resultFalse).toBe("False");
  });

  // Plain string tests
  it("should render when with plain string in then branch", () => {
    const node = when("show", "Plain content");
    expect(node.render({ show: true })).toBe("Plain content");
    expect(node.render({ show: false })).toBe("");
  });

  it("should render when with plain strings in both branches", () => {
    const node = when("show", "Then branch", "Else branch");
    expect(node.render({ show: true })).toBe("Then branch");
    expect(node.render({ show: false })).toBe("Else branch");
  });

  it("should render when with string then and text else", () => {
    const node = when("show", "Plain then", text("Else {name}"));
    expect(node.render({ show: true, name: "World" })).toBe("Plain then");
    expect(node.render({ show: false, name: "World" })).toBe("Else World");
  });

  it("should NOT interpolate placeholders in plain string branches", () => {
    const node = when("show", "Use {this} literally", "Or {that}");
    expect(node.render({ show: true })).toBe("Use {this} literally");
    expect(node.render({ show: false })).toBe("Or {that}");
  });

  it("should keep braces literal in when even with params provided", () => {
    const node = when("show", "Literal {name}", text("Interpolated {name}"));
    expect(node.render({ show: true, name: "Nikolas" })).toBe("Literal {name}");
    expect(node.render({ show: false, name: "Nikolas" })).toBe(
      "Interpolated Nikolas"
    );
  });

  it("should work in block with string branches", () => {
    const node = block("Header", when("show", "Shown", "Hidden"), "Footer");
    expect(node.render({ show: true })).toBe("Header\n\nShown\n\nFooter");
    expect(node.render({ show: false })).toBe("Header\n\nHidden\n\nFooter");
  });

  it("should handle empty string in branches", () => {
    const node = when("show", "", "Fallback");
    expect(node.render({ show: true })).toBe("");
    expect(node.render({ show: false })).toBe("Fallback");
  });
});
