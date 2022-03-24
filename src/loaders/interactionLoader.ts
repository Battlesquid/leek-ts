import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { loadDirFull } from ".";
import config from "../config.json";
import type { SlashCommand } from "../types/CommandTypes";

const rest = new REST({ version: config.DISCORD_REST_VER }).setToken(
    config.DISCORD_BOT_TOKEN
);

const getSlashInteractions = async (dir: string) => {
    const contents = await loadDirFull(dir);

    const cmds = (await Promise.all(
        contents.map<Promise<SlashCommand>>(async file => (await import(file.path)).default)
    )).map(cmd => cmd.toJSON());

    return cmds;
};

export const loadInteractions = async (dir: string, reload: boolean) => {
    console.log("loading interactions");

    try {
        const slashCmds = await getSlashInteractions(dir);

        if (reload) {
            await rest.put(
                Routes.applicationCommands(config.DISCORD_CLIENT_ID),
                {
                    body: [...slashCmds],
                }
            );
            console.log("Successfully reloaded application commands.");
        } else {
            console.log("Skipping application command refresh");
        }
    } catch (error) {
        console.error(error);
    }
};
