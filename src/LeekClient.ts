import { MikroORM } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import {
    Client,
    ClientOptions,
    Collection,
    CommandInteraction
} from "discord.js";
import { SlashCommandData, CommandExec } from "types/CommandTypes";
import {
    loadEvents,
    loadFunctions,
    loadInteractions
} from "./loaders/";

interface LeekClientOptions extends ClientOptions {
    functionsDir: string
    eventsDir: string
    interactionsDir: string
}

export default class LeekClient extends Client {
    public options: LeekClientOptions;
    private functions: Collection<SlashCommandData, CommandExec> = new Collection();
    private ormem: MikroORM<PostgreSqlDriver>;

    constructor(options: LeekClientOptions) {
        super(options);
        this.options = options;
    }

    async start(token: string) {
        await this.startDatabase();

        loadInteractions({
            dir: this.options.interactionsDir,
            reload: false
        });

        this.functions = new Collection(await loadFunctions(this.options.functionsDir));

        loadEvents(this.options.eventsDir, this);

        this.login(token);
    }

    private async startDatabase() {
        const orm = await MikroORM.init<PostgreSqlDriver>({
            entities: ['./dist/entities'],
            entitiesTs: ['./src/entities'],
            dbName: 'postgres',
            type: 'postgresql',
        });;
        const generator = orm.getSchemaGenerator();
        await generator.updateSchema();

        this.ormem = orm;
    }

    public getSlashCommand(inter: CommandInteraction) {
        const name = inter.commandName;
        const subcommand = inter.options.getSubcommand(false) ?? undefined;
        const group = inter.options.getSubcommandGroup(false) ?? undefined;

        const key = this.functions.findKey((val, key) =>
            key.name === name &&
            key.subcommand === subcommand &&
            key.group === group);
        return key ? this.functions.get(key) : undefined;
    }

    get orm(): MikroORM<PostgreSqlDriver> {
        return this.ormem;
    }
}