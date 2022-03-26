import { Collection } from "discord.js";
import { loadDirFull } from ".";
import {
    CommandExec,
    SlashCommandData,
    SlashCommandFunction,
} from "#types/CommandTypes";

export const loadFunctions = async (dir: string, coll: Collection<SlashCommandData, CommandExec>) => {
    console.log("loading functions");
    const files = await loadDirFull(dir);

    return Promise.all(
        files.map(async file => {
            const fn: SlashCommandFunction = (await import(file.path)).default;
            if (!fn) throw Error(`No default export found for ${file.name}`);

            coll.set(
                {
                    name: fn.name,
                    subcommand: fn.subcommand,
                    group: fn.group,
                },
                fn.execute
            );
        })
    )
};
