import loadSlashCommands from "./slashCommandLoader";
import {
    ExecutableCollection,
    MessageCommandCollection,
    SlashCommandCollection,
    UserCommandCollection
} from "../types/CommandTypes";
import loadUserCommands from "./userCommandLoader";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import config from "../config.json"
import loadMessageCommands from "./messageCommandLoader";

interface CommandLoaderOptions {
    dir: string
    slashCmds: SlashCommandCollection
    userCmds: UserCommandCollection
    msgCmds: MessageCommandCollection
    execs: ExecutableCollection,
    reload?: boolean | false
}

const rest = new REST({ version: config.DISCORD_REST_VER }).setToken(config.DISCORD_BOT_TOKEN);

const loadCommands = async (cfg: CommandLoaderOptions) => {
    console.log('Started refreshing application (/) commands.');

    try {
        await loadSlashCommands(cfg.dir, cfg.slashCmds, cfg.execs)
        await loadUserCommands()
        await loadMessageCommands()

        const slashCommands = cfg.slashCmds.map(cmd => cmd.toJSON())
        const userCommands = cfg.userCmds.map(cmd => cmd.toJSON())
        const messageCommands = cfg.msgCmds.map(cmd => cmd.toJSON());

        // console.log(`Loading commands [${commands.map(c => c.structure.name).join(", ")}]`)

        if (cfg.reload) {
            await rest.put(
                Routes.applicationCommands(config.DISCORD_CLIENT_ID),
                { body: [...slashCommands, ...userCommands, ...messageCommands] },
            );
            console.log('Successfully reloaded application (/) commands.');
        } else {
            console.log("Skipping application command refresh")
        }


    } catch (error) {
        console.error(error);
    }
}

export default loadCommands;