import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { Client, ClientOptions, Collection, CommandInteraction } from "discord.js";
import fs from "fs/promises";
import path from "path";
import config from "./config.json";
import { connection as dbconn } from "./database";
import { Command, CommandExec, CommandStructure, EventHandler, GroupCommandBase, ParentCommandBase, Subcommand } from "./types";

interface LeekClientOptions extends ClientOptions {
    commandsDir: string
    eventsDir: string
}

const rest = new REST({ version: config.DISCORD_REST_VER }).setToken(config.DISCORD_BOT_TOKEN);

export class LeekClient extends Client {
    public options: LeekClientOptions;

    private slashCommands: Collection<string, CommandStructure> = new Collection();
    private userCommands: Collection<string, Command | Subcommand> = new Collection();
    private messageCommands: Collection<string, Command | Subcommand> = new Collection();
    private executables: Collection<string, CommandExec> = new Collection();

    constructor(options: LeekClientOptions) {
        super(options);
        this.options = options;
    }

    async start(token: string) {
        await dbconn;
        this.loadCommands(true);
        this.loadEvents();
        this.login(token);
    }

    public getSlashCommand(cmdInter: CommandInteraction) {
        const group = cmdInter.options.getSubcommandGroup(false) ?? "";
        const groupName = group ? group + "_" : group;

        const subcmd = cmdInter.options.getSubcommand(false) ?? "";

        const cmd = cmdInter.commandName + (group || subcmd ? "_" : "");

        return this.executables.get(`${cmd}${groupName}${subcmd}`)
    }

    private async loadDir(dir: string) {
        const directory = await fs.readdir(dir, { withFileTypes: true })

        const dirs = directory
            .filter(i => i.isDirectory())
            .map(d => d.name);

        const files = directory
            .filter(i => i.isFile())
            .map(f => f.name);

        return { dirs, files }
    }

    private async loadSubcmdGroups(subcmdDir: string, parentBase: ParentCommandBase, groups: string[]) {
        for (const group of groups) {
            const dirpath = path.resolve(__dirname, `${subcmdDir}/${group}`);
            const directory = await this.loadDir(dirpath)

            const base: GroupCommandBase = (await import(`${dirpath}/base`)).default

            const groupCmds: Subcommand[] = (await Promise.all(
                directory.files
                    .filter(f => !f.startsWith('base'))
                    .map(s => import(`${dirpath}/${s}`))
            )).map(f => f.default);

            groupCmds.forEach(groupCmd => {
                base.structure.addSubcommand(groupCmd.structure)
                const name = `${parentBase.structure.name}_${group}_${groupCmd.structure.name}`
                this.executables.set(name, groupCmd.execute)
            })

            parentBase.structure.addSubcommandGroup(base.structure)
        }

        this.slashCommands.set(parentBase.structure.name, parentBase.structure)
    }

    private async loadSubcmds(dir: string, cmds: string[]) {
        for (const cmd of cmds) {
            const dirpath = path.resolve(__dirname, `${dir}/${cmd}`)
            const directory = await this.loadDir(dirpath)

            const base: Command = (await import(`${dirpath}/base`)).default

            const subcmds: Subcommand[] = (await Promise.all(
                directory.files
                    .filter(f => !f.startsWith('base'))
                    .map(s => import(`${dirpath}/${s}`))
            )).map(f => f.default);

            subcmds.forEach(subcmd => {
                base.structure.addSubcommand(subcmd.structure)
                const name = `${base.structure.name}_${subcmd.structure.name}`;
                this.executables.set(name, subcmd.execute)
            })

            await this.loadSubcmdGroups(dirpath, base, directory.dirs);
        }
    }

    private async loadSlashCommands() {
        const dirpath = path.resolve(__dirname, `${this.options.commandsDir}/slash`)
        const directory = await this.loadDir(dirpath)

        const cmds: Command[] = (await Promise.all(
            directory.files.map(f => import(`${dirpath}/${f}`))
        )).map(f => f.default);

        cmds.forEach(cmd => {
            this.slashCommands.set(cmd.structure.name, cmd.structure)
            this.executables.set(cmd.structure.name, cmd.execute)
        })

        await this.loadSubcmds(dirpath, directory.dirs)
    }

    private async loadUserCommands() {

    }

    private async loadMessageCommands() {

    }

    private async loadCommands(reload: boolean = false) {
        console.log('Started refreshing application (/) commands.');

        try {
            await this.loadSlashCommands()
            await this.loadUserCommands()
            await this.loadMessageCommands()

            const slashCommands = this.slashCommands.map(cmd => cmd.toJSON())
            const userCommands = this.userCommands.map(cmd => cmd.structure.toJSON())
            const messageCommands = this.messageCommands.map(cmd => cmd.structure.toJSON());

            // console.log(`Loading commands [${commands.map(c => c.structure.name).join(", ")}]`)

            if (reload) {
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

    private async loadEvents() {
        const resolvedPath = path.resolve(__dirname, this.options.eventsDir)
        const eventNames = (await fs.readdir(resolvedPath)).map(n => n.split(".")[0])

        console.log(`Loading events [${eventNames.join(", ")}]`)

        for (const eventName of eventNames) {
            const event: EventHandler = await import(`${resolvedPath}/${eventName}`)
            this.on(eventName, event.handler.bind(null, this))
        }
    }
}