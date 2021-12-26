import { loadDir } from ".";
import { SubeventCollection } from "../types/CommandTypes";
import { SubEvent } from "../types/EventTypes";

type SubeventOptions = {
    dir: string
    subevents: SubeventCollection
}

const loadSubevents = async (cfg: SubeventOptions) => {
    const folder = await loadDir(cfg.dir);

    for (const subeventName of folder.files) {
        const subevent: SubEvent = (await import(`${cfg.dir}/${subeventName}`)).default;

        cfg.subevents.set(subeventName, subevent);

        console.log(subevent);
        console.log(`Loaded subevent ${subevent.name}`);
        console.log(subevent.parent);
    }
}

export default loadSubevents;