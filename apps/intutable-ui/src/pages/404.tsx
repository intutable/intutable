import { NextPage } from "next"
import Error from "next/error"

const ErrorPage404: NextPage = () => {
    return (
        <Error
            statusCode={404}
            title="Die Seite konnte nicht gefuden werden und/oder Sie müssen eingeloggt sein"
        />
    )
}
export default ErrorPage404
