/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file Link.tsx
 * @description Link Component for Internal and External Links. Combines Next's & MUI's Link Component.
 * @since 29.09.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules
import React from "react"

// Assets

// CSS

// Components
import NextLink from "next/link"
import {
    Link as MUILink
} from "@mui/material"

// Utils / Types / Api
import type { LinkProps } from "next/link"
import type { LinkTypeMap } from "@mui/material"

type CombinedLinkProps = {
    href: string
    /**
     * If true, the <Link /> from mui will be wrapped by the <Link /> from Next in order
     * to handle in-app routing. Otherwise this is not needed.
     * @default 'true'
     */
    internal?: boolean
    /**
     * these props will be forwarded to the NextJS Link Component
     */
    nextLinkProps?: Omit<LinkProps, "href">
    /**
     * these props will be forwarded to the mui Link Component
     */
    muiLinkProps?: LinkTypeMap<{}, "a">["props"]
}

/**
 * Combination of NextJS's Link and MUI's Link to provide proper routing AND styling.
 * @param {CombinedLinkProps} param
 * @returns 
 */
const CombinedLink: React.FC<CombinedLinkProps> = ({ children, href, internal = true, nextLinkProps, muiLinkProps }) => {

    if (!internal)
        return <MUILink href={href} color="inherit" {...muiLinkProps}>{children}</MUILink>

    return <NextLink href={href} passHref {...nextLinkProps}>
        <MUILink color="inherit" {...muiLinkProps}>{children}</MUILink>
    </NextLink>

}

export default CombinedLink
