import {
    CommandExec,
    SlashCommandData,
    SlashCommandFunction
} from "#types/CommandTypes";
import { Collection } from "discord.js";
import { loadDirFull } from ".";

export const loadFunctions = async (dir: string, coll: Collection<SlashCommandData, CommandExec>) => {
    console.info("loading functions")
    const files = await loadDirFull(dir);

    return Promise.all(
        files.map(async file => {
            const fn: SlashCommandFunction = (await import(file.path)).default;
            if (!fn) throw Error(`No default export found for ${file.name}`);
            console.info(`loading function [${fn.name} ${fn.subcommand ?? ""}]`);
            coll.set(
                {
                    name: fn.name,
                    subcommand: fn.subcommand,
                    perms: fn.perms,
                    group: fn.group,
                },
                fn.execute
            );
        })
    )
};
