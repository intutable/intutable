import net from "net"

export async function testPort(port: number, host?: string) {
    let socket: net.Socket
    return new Promise((res, rej) => {
        socket = net.createConnection(port, host)
        socket
            .on("connect", function (e: Event) {
                res(e)
                socket.destroy()
            })
            .on("error", function (e: Event) {
                rej(e)
                socket.destroy()
            })
    })
}
