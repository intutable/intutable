import { NextPage } from "next"
import Error from "next/error"

const ErrorPage500: NextPage = () => {
    return (
        <Error
            statusCode={500}
            title="Ein unbekannter Server-Fehler ist aufgetreten. Bitte kontaktieren Sie Ihren Administrator."
        />
    )
}
export default ErrorPage500
