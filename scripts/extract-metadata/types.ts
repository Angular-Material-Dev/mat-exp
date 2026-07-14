// Public types consumed by the docs app and re-exported from extract-metadata.ts

export interface PlaygroundInputControl {
  name: string;
  /** Display label in the controls panel — `@name` JSDoc tag, or `name` humanized. */
  label: string;
  /** Maps to a UI widget in the playground. */
  type: 'text' | 'number' | 'slide-toggle' | 'select';
  /** Only present when type === 'select'. */
  options?: string[];
  default?: string | number | boolean;
  /** True when the underlying input type included `| undefined` or `| null`. */
  nullable?: boolean;
  description?: string;
}

/** Raw source of a preview's `.ts`/`.html`/`.scss` file, embedded for the playground's "View source" tab. */
export interface PlaygroundSourceFile {
  filename: string;
  content: string;
  lang: string;
}

export interface PlaygroundComponentSchema {
  selector: string;
  className: string;
  inputs: PlaygroundInputControl[];
  sourceFiles: PlaygroundSourceFile[];
}

export type PlaygroundSchemas = Record<string, PlaygroundComponentSchema>;

export interface ApiInput {
  name: string;
  /** Full TypeScript type string. */
  type: string;
  default?: unknown;
  description?: string;
  deprecated?: boolean | string;
  /** True when declared with model() — a two-way bindable ModelSignal. */
  isModel?: boolean;
}

export interface ApiOutput {
  name: string;
  /** Full TypeScript type string for the event payload. */
  eventType: string;
  description?: string;
  deprecated?: boolean | string;
}

/** Generic type parameter descriptor. */
export interface ApiTypeParam {
  name: string;
  constraint?: string;
  default?: string;
}

/** Single parameter of a function or method. */
export interface ApiParam {
  name: string;
  type: string;
  description?: string;
}

/** Property member of a class or interface. */
export interface ApiProperty {
  name: string;
  type: string;
  description?: string;
  isReadonly?: boolean;
  isOptional?: boolean;
  deprecated?: boolean | string;
}

/** Method member of a class or interface. */
export interface ApiMethod {
  name: string;
  signature: string;
  description?: string;
  params?: ApiParam[];
  returnType?: string;
  returnDescription?: string;
  deprecated?: boolean | string;
  typeParams?: ApiTypeParam[];
}

/** Common JSDoc tag fields present on every entry kind. */
export interface ApiJsDocTags {
  deprecated?: boolean | string;
  remarks?: string;
  example?: string;
  see?: string[];
  /**
   * `@metaDescription` JSDoc tag — a short, SEO-safe override for the API
   * Detail Page's meta/OG description. Falls back to `description` (the
   * free-text JSDoc comment, which can run long) when absent.
   */
  metaDescription?: string;
}

export interface ApiDirectiveEntry extends ApiJsDocTags {
  kind: 'directive' | 'component';
  selector: string;
  description?: string;
  inputs: ApiInput[];
  outputs: ApiOutput[];
}

export interface ApiTypeEntry extends ApiJsDocTags {
  kind: 'type' | 'interface';
  /** Full TypeScript type string (e.g. the expanded union). Kept for backwards compat. */
  shape: string;
  description?: string;
  typeParams?: ApiTypeParam[];
  /** Structured members (interface only). */
  properties?: ApiProperty[];
  methods?: ApiMethod[];
}

export interface ApiConstEntry extends ApiJsDocTags {
  kind: 'const';
  /** TypeScript type string of the constant. */
  value: string;
  description?: string;
}

export interface ApiClassEntry extends ApiJsDocTags {
  kind: 'class';
  /** TypeScript type string describing the class shape. Kept for backwards compat. */
  shape: string;
  description?: string;
  typeParams?: ApiTypeParam[];
  properties?: ApiProperty[];
  methods?: ApiMethod[];
}

export interface ApiFunctionEntry extends ApiJsDocTags {
  kind: 'function';
  /** TypeScript type string of the function signature. Kept for backwards compat. */
  signature: string;
  description?: string;
  typeParams?: ApiTypeParam[];
  params?: ApiParam[];
  returnType?: string;
  returnDescription?: string;
}

export type ApiEntry =
  | ApiDirectiveEntry
  | ApiTypeEntry
  | ApiConstEntry
  | ApiClassEntry
  | ApiFunctionEntry;
export type ApiManifest = Record<string, ApiEntry>;
