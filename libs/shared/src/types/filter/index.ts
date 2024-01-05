/**
 * @module types/filter
 * Wrappers and slight alterations of the condition types from `@intutable/lazy-views`.
 * Has yet to be updated to match the new API layer that `types/tables` builds on top of
 * LV, so it uses terms like "join" instead of "link. As of now, this is fine since these
 * types are barely more than a wrapper. When the filter functionality is extended, there
 * will definitely be a need for a new abstraction layer.
 */
export * from "./complete"
export * from "./partial"
