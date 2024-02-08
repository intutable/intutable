/**
 * Relevant lifecycle hooks for a plugin.
 */
export interface PluginModule {
    /** Function to initialize the plugin. */
    init: Function
    /** Optional function for closing the plugin. */
    close?: Function
}

/**
 * Metadata for a plugin.
 */
export interface PluginInfo {
    /** Path to the plugin's source code. */
    path: string
    /** Display name of the plugin. */
    name: string
    /** If the plugin imports other plugins, those will be listed here. */
    dependencies?: object
}

/**
 * A plugin consists of a `module` for lifecycle management
 * and a `info` object with metadata.
 */
export interface Plugin {
    module: PluginModule
    info: PluginInfo
}
