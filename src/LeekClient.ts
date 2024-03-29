import { CommandExec, SlashCommandData } from "#types/CommandTypes";
import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
    ChatInputCommandInteraction,
    Client,
    ClientOptions,
    Collection
} from "discord.js";
import { loadEvents, loadFunctions, loadInteractions } from "./loaders/";

interface LeekClientOptions extends ClientOptions {
    functionsDir: string;
    eventsDir: string;
    interactionsDir: string;
}

export default class LeekClient extends Client {
    public customOptions: LeekClientOptions;
    private functions: Collection<SlashCommandData, CommandExec> =
        new Collection();
    private ormem: MikroORM<PostgreSqlDriver>;

    constructor(options: LeekClientOptions) {
        super(options);
        this.customOptions = options;
    }

    async start() {
        const reload = process.env.COMMAND_RELOAD === "true";
        
        await Promise.all([
            this.startDatabase(),
            loadInteractions(this.customOptions.interactionsDir, reload),
            loadFunctions(this.customOptions.functionsDir, this.functions),
            loadEvents(this.customOptions.eventsDir, this)
        ]);

        this.login(process.env.DISCORD_BOT_TOKEN);
    }

    private async startDatabase() {
        const orm = await MikroORM.init<PostgreSqlDriver>({
            entities: ["./dist/entities"],
            entitiesTs: ["./src/entities"],
            clientUrl: process.env.DATABASE_URL,
            type: "postgresql",
            pool: {min: 1, max: 5}
        });

        this.ormem = orm;
    }

    public getSlashCommand(inter: ChatInputCommandInteraction) {
        const name = inter.commandName;
        const subcommand = inter.options.getSubcommand(false) ?? undefined;
        const group = inter.options.getSubcommandGroup(false) ?? undefined;

        const key = this.functions.findKey(
            (val, key) =>
                key.name === name &&
                key.subcommand === subcommand &&
                key.group === group
        );
        return key ? {key, fn: this.functions.get(key)} : undefined;
    }

    private async resolveConn(): Promise<MikroORM<PostgreSqlDriver>> {
        const orm = await this.ormem;
        const connected = await orm.isConnected();
        if(!connected) {
            await this.ormem.close();
            await this.startDatabase();
        }
        return this.ormem;
    }

    get orm(): Promise<MikroORM<PostgreSqlDriver>> {
        return this.resolveConn();
    }
}
