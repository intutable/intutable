import { Request, Response } from "express"

/*
 * TODO: DELETE THIS WHEN DONE, IT IS ONLY FOR TESTING
 */

export function loginPage(_req: Request, res: Response) {
    res.send(`
        <h1>Login</h1>
        <form method="POST" action="/login">
            <input type="username" name="username" placeholder="Email"/>
            <input type="password" name="password" placeholder="Password"/>
            <input type="submit" value="Login"/>
        </form>
    `)
}

export function homePage(req: Request, res: Response) {
    res.send(`
            <h1>Home</h1>
            ${
                req.isAuthenticated()
                    ? "<form method='post' action='/logout' class='inline'><input type='submit' value='Logout'></button></form>"
                    : "<a href='/login'>Login<a/>"
            }
        `)
}

export function secretPage(req: Request, res: Response) {
    res.send(
        `<h1>Such wow, much secret</h1><form method='post' action='/logout' class='inline'><input type='submit' value='Logout'></button></form>`
    )
}
