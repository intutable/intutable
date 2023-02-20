import { Typography } from "@mui/material"
import { TypographyProps } from "@mui/system"
import { useUser } from "auth"
import { useUserSettings } from "hooks/useUserSettings"
import { useMemo } from "react"

const GREETINGS = [
    "Ahoi",
    "Aloha",
    "Buenos días",
    "Buongiorno",
    "Grüetzi",
    "Halli hallo hallöle",
    "Hola",
    "Hi",
    "Hallo",
    "Moin",
    "Servus",
    "Guten Tag",
    "Hallöchen",
    "Howdy",
    "Grüßli",
    "Namasté",
    "Salve",
    "Moin Diggi",
    "Whazuuuuuuuup",
    "Lange nicht gesehen",
    "Alles Rogger in Kambodscha",
    "Milord",
    "Tach",
    "Moinsen",
    "Grüß Gott",
    "Grüß Dich",
    "Schön dich zu sehen",
    "Mahlzeit",
    "Lebe lang und in Frieden",
]

export const Greeting: React.FC<TypographyProps> = TypographyProps => {
    const { user } = useUser()
    const { userSettings } = useUserSettings()

    const greeting = useMemo(() => {
        if (userSettings == null || user == null) return "Willkommen"

        const randomFunnyGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]

        const firstName = userSettings.firstName || user.username

        const usernameGreeting = user.username
        const title = userSettings.title.length > 0 ? userSettings.title + " " : ""
        const maleGreeting =
            userSettings.lastName.length > 0
                ? `Herr ${title}${userSettings.lastName}`
                : usernameGreeting
        const femaleGreeting =
            userSettings.lastName.length > 0
                ? `Frau ${title}${userSettings.lastName}`
                : usernameGreeting
        const diverseGreeting =
            userSettings.firstName.length > 0 && userSettings.lastName.length > 0
                ? `${title}${userSettings.firstName} ${userSettings.lastName}`
                : usernameGreeting

        const lastName =
            userSettings.sex === "diverse"
                ? diverseGreeting
                : userSettings.sex === "male"
                ? maleGreeting
                : userSettings.sex === "female"
                ? femaleGreeting
                : usernameGreeting

        return userSettings.disableFunnyGreetings === false
            ? `${randomFunnyGreeting}, ${firstName}!`
            : `Willkommen, ${lastName}.`
    }, [user, userSettings])

    return <Typography {...TypographyProps}>{greeting}</Typography>
}
