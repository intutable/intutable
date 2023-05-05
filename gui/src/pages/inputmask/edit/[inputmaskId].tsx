import { getInputMask } from "@shared/input-masks"
import { InputMask } from "@shared/input-masks/types"
import { withSessionSsr } from "auth"
import MetaTitle from "components/MetaTitle"
import { Editor } from "components/InputMaskEditor/Editor"
import { parseQuery } from "hooks/useAPI"
import { NextPage } from "next"
import { withSSRCatch } from "utils/withSSRCatch"

const InputMaskEditor: NextPage<{ inputMask: InputMask }> = ({ inputMask }) => {
    return (
        <>
            <MetaTitle title={"Eingabemasken-Editor"} />

            <Editor inputMask={inputMask} />
        </>
    )
}

export const getServerSideProps = withSSRCatch(
    withSessionSsr(async context => {
        const user = context.req.session.user
        if (user == null || user.isLoggedIn === false)
            return {
                notFound: true,
            }

        // TODO: restrict page to admins

        const { inputmaskId } = parseQuery<{ inputmaskId: string }>(context.query, ["inputmaskId"])
        if (inputmaskId == null)
            return {
                notFound: true,
            }

        const inputMask = getInputMask(inputmaskId)
        if (!inputMask)
            return {
                notFound: true,
            }

        const { created, lastEdited, comments, ...mask } = inputMask

        return {
            props: {
                inputMask: mask,
            },
        }
    })
)

export default InputMaskEditor
