import { Client, ClientOptions, Collection, CommandInteraction } from "discord.js";
import path from "path";
import { Connection } from "typeorm";
import { connection as dbconn } from "./database";
import loadCommands from "./loaders/commandLoader";
import loadEvents from "./loaders/eventLoader";
import { CommandExec, CommandStructure } from "./types";

interface LeekClientOptions extends ClientOptions {
    commandsDir: string
    eventsDir: string
}

export class LeekClient extends Client {
    public options: LeekClientOptions;

    private slashCmds: Collection<string, CommandStructure> = new Collection();
    private userCommands: Collection<string, CommandStructure> = new Collection();
    private messageCommands: Collection<string, CommandStructure> = new Collection();
    private executables: Collection<string, CommandExec> = new Collection();

    private dbconn: Connection

    constructor(options: LeekClientOptions) {
        super(options);
        this.options = options;
        this.options.commandsDir = path.resolve(__dirname, this.options.commandsDir)
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
            client: this,
            dir: this.options.eventsDir
        });

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