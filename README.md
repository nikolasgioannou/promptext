# promptext

promptext is a small, type-safe DSL for building structured prompts in TypeScript.

It allows you to construct prompts from composable nodes (`text`, `block`, `when`, `xml`) instead of assembling strings manually.

## Installation

```bash
npm install promptext
```

```bash
yarn add promptext
```

```bash
pnpm add promptext
```

## Basic usage

```ts
import { text, block, when } from "promptext";

const prompt = block(
  text("Hello {name}!"),
  when("isAdmin", "You have admin access.", "You are a regular user.")
);

const output = prompt.render({
  name: "Nikolas",
  isAdmin: true,
});
```

**Output**

```
Hello Nikolas!

You have admin access.
```

TypeScript enforces required parameters:

```ts
prompt.render({
  name: "Nikolas",
});
// ❌ Property 'isAdmin' is missing
```

## Why not just strings?

### Before (plain strings)

```ts
let prompt = "";

prompt += `Hello ${name}!\n\n`;

if (isAdmin) {
  prompt += "Admin panel enabled.\n";
  prompt += `You have ${count} pending approvals.\n`;
} else {
  prompt += "Standard user mode.\n";
}

if (showFooter) {
  prompt += "\n---\n";
  prompt += footerText ?? "";
}
```

### After (`promptext`)

```ts
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
```

## Text nodes

```ts
text("Hello {name}");
```

### `trim()`

Useful for writing clean multi-line text:

```ts
text(`
Here everything starts inline
`).trim();
```

### `indent(level?)`

Applies indentation at render time:

```ts
text("Indented").indent();
text("More indented").indent(2);
```

## Blocks

```ts
block(text("Line one"), text("Line two"));
```

- Children are joined with two newlines (`\n\n`) by default
- `join(separator)` controls how children are joined
- `indent(level?)` indents the entire block

## Conditional rendering

```ts
when("isAdmin", text("Admin mode"), text("User mode"));
```

- The key becomes a required boolean render parameter
- The `else` branch is optional

## XML nodes

```ts
import { xml, text } from "promptext";

const prompt = xml(
  "user",
  xml("name", text("{name}")).indent(),
  xml("role", text("{role}")).indent()
);

prompt.render({
  name: "Nikolas",
  role: "admin",
});
```

**Output**

```
<user>
  <name>
  Nikolas
  </name>

  <role>
  admin
  </role>
</user>
```

## License

MIT
