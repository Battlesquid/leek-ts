import { loadDir } from ".";
import { SubEvent } from "../types/EventTypes";

type SubeventOptions = {
    dir: string
    subevents: SubEvent[]
}

const loadSubevents = async (cfg: SubeventOptions) => {
    const folder = await loadDir(cfg.dir);

    for (const subeventName of folder.files) {
        const subevent: SubEvent = (await import(`${cfg.dir}/${subeventName}`)).default;

        cfg.subevents.push(subevent)

        console.log(subevent);
        console.log(`Loaded subevent ${subevent.name}`);
        console.log(subevent.parent);
    }
}

export default loadSubevents;