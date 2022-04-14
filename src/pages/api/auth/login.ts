import { withSessionRoute } from "auth/withSessionRoute"
import { NextApiRequest, NextApiResponse } from "next"
import type { User } from "types/User"
import { getCurrentUser } from "auth"

const loginRoute = async (req: NextApiRequest, res: NextApiResponse) => {
    const { username, password } = await req.body
    try {
        const response = await fetch(
            process.env.NEXT_PUBLIC_CORE_ENDPOINT_URL! + "/login",
            {
                method: "post",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/x-www-form-urlencoded",
                    // "Content-Type": "application/json",
                },
                credentials: "include",
                body: `username=${username}&password=${password}`,
            }
        )

        console.dir(response)

        if (response.status !== 200)
            throw new Error(`Netzwerkfehler, Status = ${response.status}`)

        // BUG: logs html ?
        const text = await response.text()

        console.log(text)

        if (text.includes("secret") === false)
            throw new Error(
                "Kombination aus Nutzername und Passwort nicht gefunden!"
            )

        const user = await getCurrentUser()
        if (user == null) throw new Error("Could not get the user")

        req.session.user = { isLoggedIn: true, ...user } as User

        await req.session.save()

        res.json(user)
    } catch (error) {
        res.status(401).json({ error: (error as Error).message })
    }
}

export default withSessionRoute(loginRoute)
