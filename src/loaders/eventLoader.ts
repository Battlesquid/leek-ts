import fs from "fs/promises"
import path from "path"
import { LeekClient } from "../LeekClient"
import { EventHandler } from "../events/types"

interface EventLoaderOptions {
    client: LeekClient
    dir: string
}

const loadEvents = async (cfg: EventLoaderOptions) => {
    const resolvedPath = path.resolve(__dirname, cfg.dir)
    const eventNames = (await fs.readdir(resolvedPath)).map(n => n.split(".")[0])

    console.log(`Loading events [${eventNames.join(", ")}]`)

    for (const eventName of eventNames) {
        const event: EventHandler = await import(`${resolvedPath}/${eventName}`)
        cfg.client.on(eventName, event.handler.bind(null, cfg.client))
    }
}

export default loadEvents;