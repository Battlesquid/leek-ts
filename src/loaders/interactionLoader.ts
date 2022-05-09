import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { loadDirFull } from ".";
import type { SlashCommand } from "../types/CommandTypes";

const getSlashInteractions = async (dir: string) => {
    const contents = await loadDirFull(dir);

    const cmds = (await Promise.all(
        contents.map<Promise<SlashCommand>>(async file => (await import(file.path)).default)
    )).map(cmd => cmd.toJSON());

    return cmds;
};

export const loadInteractions = async (dir: string, reload: boolean) => {
    console.info("loading interactions")

    const rest = new REST({ version: "9" }).setToken(
        process.env.DISCORD_BOT_TOKEN!
    );
    
    try {
        const slashCmds = await getSlashInteractions(dir);

        if (reload) {
            await rest.put(
                Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
                {
                    body: [...slashCmds],
                }
            );
            console.log("successfully reloaded application commands");
        } else {
            console.log("skipping application command refresh");
        }
    } catch (error) {
        console.error(error);
    }
};
