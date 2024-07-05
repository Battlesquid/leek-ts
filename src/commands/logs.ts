import { logs } from "../interactions";
import { ApplyOptions } from "@sapphire/decorators";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { logSettings } from "../db/schema";
import { ChannelType } from "discord.js";
import { eq } from "drizzle-orm";
import { chatInputCommand, AugmentedSubcommand } from "../utils/bot";
import { capitalize } from "../utils/strings";

@ApplyOptions<Subcommand.Options>({
    name: logs.commands.chat.base.name,
    subcommands: [chatInputCommand(logs.commands.chat.subcommands.enable.name), chatInputCommand(logs.commands.chat.subcommands.disable.name)],
    preconditions: ["GuildTextOnly"],
    requiredUserPermissions: ["ManageGuild"],
    requiredClientPermissions: ["ManageMessages"]
})
export class LogsCommand extends AugmentedSubcommand {
    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(logs.commands.chat.base, {
            idHints: ["926913960391893072"]
        });
    }

    public async chatInputEnable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);

        const channel = inter.options.getChannel<ChannelType.GuildText>("channel", true);
        const type = inter.options.getString("type", true);

        try {
            await this.db
                .insert(logSettings)
                .values([
                    {
                        gid: inter.guildId,
                        [type]: channel.id
                    }
                ])
                .onConflictDoUpdate({
                    target: logSettings.gid,
                    set: { [type]: channel.id }
                });
            logger.info({
                interaction: `Enabled ${type} logging on ${channel}.`,
                logger: `Enabled ${type} logging on ${channel.name}.`
            });
        } catch (error) {
            logger.error("An error occurred, please try again later", error);
        }
    }

    public async chatInputDisable(inter: Subcommand.ChatInputCommandInteraction<"cached">) {
        const logger = this.getCommandLogger(inter);
        const type = inter.options.getString("type", true);
        try {
            await this.db
                .update(logSettings)
                .set({ [type]: null })
                .where(eq(logSettings.gid, inter.guildId));
            logger.info(`${capitalize(type)} logging disabled.`);
        } catch (error) {
            logger.error("An error occurred.", error);
        }
    }
}
