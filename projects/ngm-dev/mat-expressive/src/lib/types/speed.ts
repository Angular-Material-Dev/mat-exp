/**
 * Speed preset for the `mat-expressive-loading-indicator`'s shape morph and
 * rotation animation. Each preset maps to one of the M3 Expressive spatial
 * spring tokens:
 *
 * - `fast`    – Expressive fast spatial    – `cubic-bezier(0.42, 1.67, 0.21, 0.90)`, 350ms per morph step.
 * - `default` – Expressive default spatial – `cubic-bezier(0.38, 1.21, 0.22, 1.00)`, 500ms per morph step.
 * - `slow`    – Expressive slow spatial    – `cubic-bezier(0.39, 1.29, 0.35, 0.98)`, 650ms per morph step.
 */
export type MatExpressiveLoadingIndicatorSpeed = 'fast' | 'default' | 'slow';
