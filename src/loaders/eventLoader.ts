import { loadDir } from "."
import { LeekClient } from "../LeekClient"
import { Event } from "../types/EventTypes"

interface EventLoaderOptions {
    dir: string
    client: LeekClient
}

const loadEvents = async (cfg: EventLoaderOptions) => {
    const directory = await loadDir(cfg.dir)

    for (const eventFile of directory.files) {
        const event: Event = (await import(`${cfg.dir}/${eventFile}`)).default;

        if (event.once) {
            cfg.client.once(event.name, (...args) => {
                event.handle(cfg.client, args)
            });
        } else {
            cfg.client.on(event.name, (...args) => event.handle(cfg.client, args));
        }
    }
}

export default loadEvents;