import { Collection } from "discord.js"
import { loadDirFull } from "."
import { CommandExec, SlashCommandData, SlashCommandFunction } from "types/CommandTypes"

export const loadFunctions = async (dir: string) => {
    console.log("loading functions");
    const coll = new Collection<SlashCommandData, CommandExec>();
    const files = await loadDirFull(dir);

    for (const file of files) {
        const fn: SlashCommandFunction = (await import(file.path)).default
        if (!fn)
            throw Error(`No default export found for ${file.name}`);

        coll.set({
            name: fn.name,
            subcommand: fn.subcommand,
            group: fn.group
        }, fn.execute)
    }

    return coll;
}