import React from "react"
import Obj from "@app/utils/Obj"

// Toolbar

/**
 * Obligatory Props for `Toolbar`
 */
export type ToolbarProps = {
    children: React.ReactNode | Array<React.ReactNode>
    position: "top" | "bottom"
} // obligatory props each compinent must have

/**
 * Functional Component w/ obligatory props.
 * Provides dot notation for `Item` Component
 */
export type Toolbar<Props extends Obj = Obj> = React.FC<
    Props & ToolbarProps
> & {
    Item: ToolbarItem
} // FC + obligatory props + optional props via generic type + dot notation components

/**
 * Flex Position of an item.
 * @default start
 */
export type FlexPosition = "start" | "end"

/**
 * Used for predefined toolbar items only.
 * This omits the obligatory props in order to achieve more flexibility for predefined items.
 */
export type PredefinedToolbarItem<Props extends Obj = Obj> = React.FC<Props>

/**
 * Obligatory Props each component of type Toolbar Item must have
 */
export type ToolbarItemProps = {
    /**
     * @default start
     */
    flexPosition?: FlexPosition
    children: React.ReactNode | React.ReactNode[]
    onClickHandler: () => void
} // obligatory props each compinent must have

/**
 * Functional Component w/ obilgatory props for each Toolbar Item and optional props forwarded by generic `Props`.
 * @tutorial $ `const Component: ToolbarItem<{myProp: unknown}> = props => {...}`
 *
 * Note that this is only used on `Toolbar.Item` and should not be anywhere else.
 */
export type ToolbarItem<Props extends Obj = Obj> = React.FC<
    Props & ToolbarItemProps
> // FC + obligatory props + optional props via generic type
