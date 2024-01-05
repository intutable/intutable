import { app } from "./app"

// start a core instance
app().catch(e => {
    console.error(e)
    process.exit(1)
})
