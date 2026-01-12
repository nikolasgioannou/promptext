export type Trim<S extends string> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer R} `
    ? Trim<R>
    : S;

export type ExtractPlaceholders<S extends string> =
  S extends `${string}{${infer P}}${infer R}`
    ? P | ExtractPlaceholders<R>
    : never;
