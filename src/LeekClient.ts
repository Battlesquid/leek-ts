import { Client, ClientOptions, Collection, CommandInteraction } from "discord.js";
import path from "path";
import { Connection } from "typeorm";
import { connection as dbconn } from "./database";
import loadCommands from "./loaders/commandLoader";
import loadEvents from "./loaders/eventLoader";
import loadSubevents from "./loaders/subeventLoader";
import {
    ExecutableCollection,
    MessageCommandCollection,
    SlashCommandCollection,
    UserCommandCollection
} from "./types/CommandTypes";
import { SubEvent } from "./types/EventTypes";

interface LeekClientOptions extends ClientOptions {
    commandsDir: string
    eventsDir: string
    subeventsDir: string
}

export class LeekClient extends Client {
    public options: LeekClientOptions;

    private slashCmds: SlashCommandCollection = new Collection();
    private userCommands: UserCommandCollection = new Collection();
    private messageCommands: MessageCommandCollection = new Collection();
    private executables: ExecutableCollection = new Collection();
    private subevents: Collection<string, SubEvent> = new Collection()

    private dbconn: Connection

    constructor(options: LeekClientOptions) {
        super(options);
        this.options = options;
        this.options.commandsDir = path.resolve(__dirname, this.options.commandsDir)
        this.options.eventsDir = path.resolve(__dirname, this.options.eventsDir)
        this.options.subeventsDir = path.resolve(__dirname, this.options.subeventsDir)
    }

    async start(token: string) {
        this.dbconn = await dbconn;

        loadCommands({
            dir: this.options.commandsDir,
            slashCmds: this.slashCmds,
            userCmds: this.userCommands,
            msgCmds: this.messageCommands,
            execs: this.executables,
            reload: false
        });

        loadEvents({
            dir: this.options.eventsDir,
            client: this
        });

        loadSubevents({
            dir: this.options.subeventsDir,
            subevents: this.subevents
        })

        this.login(token);
    }

    public getSlashCommand(cmdInter: CommandInteraction) {
        const group = cmdInter.options.getSubcommandGroup(false) ?? "";
        const groupName = group ? group + "_" : group;

        const subcmd = cmdInter.options.getSubcommand(false) ?? "";

        const cmd = cmdInter.commandName + (group || subcmd ? "_" : "");

        return this.executables.get(`${cmd}${groupName}${subcmd}`)
    }

    public getDbconn() {
        return this.dbconn
    }
}