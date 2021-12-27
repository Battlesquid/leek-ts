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
    }
}

export default loadSubevents;