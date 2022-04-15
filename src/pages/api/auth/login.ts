import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import { Cookies } from "js-cookie"
import type { User } from "types/User"
import { getCurrentUser } from "auth"

const loginRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username, password } = await req.body

    try {
        const loginRequest = await fetch(
            process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL! + "/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    // "Content-Type": "application/json",
                },
                redirect: "manual",
                credentials: "include",
                body: `username=${username}&password=${password}`,
            }
        )

        // todo: make proper checker function
        if (loginRequest.status !== 302)
            throw new Error(`Netzwerkfehler, Status = ${loginRequest.status}`)

        // BUG: logs html ?
        const text = await loginRequest.text()

        console.log(text)

        if (text.includes("secret") === false)
            throw new Error(
                "Kombination aus Nutzername und Passwort nicht gefunden!"
            )


        console.dir(loginRequest.headers)

        const authCookie = loginRequest.headers.get("set-cookie")
            .split(";")
            .map(c => c.split("="))
            .find(c => c[0] === "connect.sid")![1]
        console.log(authCookie)

        const user = await getCurrentUser(authCookie)
        if (user == null) throw new Error("Could not get the user")

        req.session.user = { isLoggedIn: true, ...user } as User

        await req.session.save()

        res.json(user)
    } catch (error) {
        res.status(401).json({ error: (error as Error).message })
    }
}

export default withSessionRoute(loginRoute)
