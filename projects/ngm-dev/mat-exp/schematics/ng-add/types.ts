/**
 * Options accepted by the `ng-add` schematic. Mirrors `schema.json`.
 */
export interface NgAddOptions {
  /** Name of the workspace project to configure. Defaults to the active/default project. */
  project?: string;
  /**
   * Component keys to include styles for (SCSS projects only), or `['all']`. When omitted, the
   * schematic asks (interactive, SCSS only) or defaults to `'all'` (non-interactive).
   *
   * A bare string is accepted as well as an array: the CLI passes `--components=all` through as
   * the string `'all'`, and rejecting that at the schema meant the documented shortcut could not
   * be used from the command line.
   */
  components?: string[] | string;
}

/** The set of component keys the SCSS component picker (prompt or `--components`) accepts. */
export type ComponentSelection = string[] | 'all';
