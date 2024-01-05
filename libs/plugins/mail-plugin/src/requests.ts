import { CoreRequest } from "@intutable-org/core"
import { MailOptions } from "./types"

export const CHANNEL = "mail-plugin"

/**
 * Sends an e-mail.
 *
 * @param {MailOptions} mailOptions Options and content of the mail.
 * If from is not provided, it will default to dekanats-app@stud.uni-heidelberg.de.
 */
export function sendMail(mailOptions: MailOptions): CoreRequest {
    return {
        channel: CHANNEL,
        method: sendMail.name,
        mailOptions: mailOptions,
    }
}
