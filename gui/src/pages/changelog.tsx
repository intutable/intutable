import MetaTitle from "components/MetaTitle"
import * as fse from "fs-extra"
import type { GetStaticProps, NextPage } from "next"
import path from "path"
import ReactMakdown from "react-markdown"
import remarkGfm from "remark-gfm"

// const generateId = (text: string): string | Error => {
//     // see www.semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string for more information on the regex
//     const semverRgx =
//         /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

//     const version = text.match(semverRgx)

//     // TODO: regex cannot detect substring semver versions
//     const changelogVersionHeader = new RegExp(
//         /./.source + /\[/.source + semverRgx.source + /\]/.source + /./.source,
//         "gm"
//     )
//     console.log(text, text.match(changelogVersionHeader))

//     if (!version || version.length === 0) return new Error("No valid semver version found")

//     return version[0]
// }

const CHANGELOG: NextPage<{ changelog: string }> = props => {
    return (
        <>
            <MetaTitle title="Änderungsprotokoll" />

            <ReactMakdown
                remarkPlugins={[remarkGfm]}
                // components={{
                //     h2: ({ node, ...props }) => {
                //         const id = generateId(props.children[0] as string)

                //         // meaning: a h2 ('##') without a valid semver version
                //         if (id instanceof Error) return <h2 {...props}></h2>

                //         return <h2 id={id} {...props}></h2>
                //     },
                // }}
            >
                {props.changelog}
            </ReactMakdown>
        </>
    )
}

export const getStaticProps: GetStaticProps<{ changelog: string }> = async () => {
    try {
        const filepath = path.join(process.cwd(), "/public/CHANGELOG.md")
        const file = await fse.readFile(filepath, "utf8") // load file
        const content = file.toString() // get markdown

        return {
            props: {
                changelog: content,
            },
        }
    } catch (error) {
        return {
            notFound: true,
        }
    }
}

export default CHANGELOG
