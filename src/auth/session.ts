// this file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions

import type { IronSessionOptions } from "iron-session"
import type { User } from "types/User"

export const sessionOptions: IronSessionOptions = {
    password: "halloIchBinNurTemporaerHier_ErsetzeMichInProduktion", // TODO: use a better one
    cookieName: process.env.NEXT_PUBLIC_AUTH_COOKIE_KEY as string,
    ttl: 3600,
    cookieOptions: {
        // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
        // secure: process.env.NODE_ENV === "production",
        secure: false,
    },
}

// This is where we specify the typings of req.session.*
declare module "iron-session" {
    interface IronSessionData {
        user?: User
    }
}
