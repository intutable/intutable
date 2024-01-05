import { CoreRequest, PluginLoader } from "@intutable-org/core"
import config from "./config"
import { createTransport, SendMailOptions, Transporter } from "nodemailer"
import { CHANNEL, sendMail } from "./requests"

let core: PluginLoader
let transporter: Transporter

export async function init(core_: PluginLoader) {
    core = core_

    transporter = createTransport({
        host: config.host,
        port: config.port,
        auth: {
            user: config.user,
            pass: config.password,
        },
    })

    core.listenForRequests(CHANNEL).on(sendMail.name, sendMail_)
}

async function sendMail_({ mailOptions }: CoreRequest): Promise<void> {
    if (config.user === "xxx") {
        console.log(
            `Email to: ${mailOptions.to}, could not be send! The E-Mail credentials in the mail-plugin are not maintained.`
        )
        return
    }

    const options: SendMailOptions = mailOptions

    options.from = mailOptions.from || config.email

    try {
        await transporter.sendMail(options)
    } catch (error) {
        console.log(error)
    }
}
