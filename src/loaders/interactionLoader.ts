import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { loadDirFull } from ".";
import config from "../config.json";
import type { SlashCommand } from "../types/CommandTypes";

interface CommandLoaderOptions {
    dir: string
    reload?: boolean | false
}

const rest = new REST({ version: config.DISCORD_REST_VER })
    .setToken(config.DISCORD_BOT_TOKEN);

const getSlashInteractions = async (dir: string) => {
    const contents = await loadDirFull(dir);
    const cmds = [];

    for (const file of contents) {
        const cmd: SlashCommand = (await import(file.path)).default;
        cmds.push(cmd.toJSON());
    }

    return cmds;
}

export const loadInteractions = async (cfg: CommandLoaderOptions) => {
    console.log('loading interactions');

    try {

        const slashCmds = await getSlashInteractions(cfg.dir);

        // console.log(`Loading commands [${commands.map(c => c.structure.name).join(", ")}]`)

        if (cfg.reload) {
            await rest.put(
                Routes.applicationCommands(config.DISCORD_CLIENT_ID),
                { body: [...slashCmds] },
            );
            console.log('Successfully reloaded application commands.');
        } else {
            console.log("Skipping application command refresh")
        }


    } catch (error) {
        console.error(error);
    }
}