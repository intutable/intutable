/**
 * @author Heidelberg University
 * @version 0.1.0
 * @file Title.tsx
 * @description Meta Title Tag for <head />
 * @since 29.09.2021
 * @license
 * @copyright © 2021 Heidelberg University
 */

// Node Modules

// Assets

// CSS

// Components
import Head from "next/head"

// Utils / Types / Api


type TitleProps = {
    /**
     * Tab Title
     */
    title: string
    /**
     * optional affix
     * @default '| Fakultät für Mathematik unf Informatik'
     */
    suffix?: string
    /**
     * optional affix 
     */
    prefix?: string

}


/**
 * `<title></title>` Component with `<Head></Head>`.
 * @param {TitleProps} param
 * @returns 
 */
const Title: React.FC<TitleProps> = ({ title, prefix, suffix = "| Fakultät für Mathematik und Informatik" }) => <Head><title>{prefix ? prefix + "" : ""}{title} {suffix}</title></Head>

export default Title