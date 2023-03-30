import { SlashCommandFunction } from "#types/CommandTypes";
import { patterns } from "#util/regexes";
import { ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField, roleMention, TextChannel } from "discord.js";
import LeekClient from "LeekClient";

const command: SlashCommandFunction = {
    name: "reactroles",
    subcommand: "remove_role",
    perms: [PermissionsBitField.Flags.ManageGuild],
    execute: async (client: LeekClient, inter: ChatInputCommandInteraction) => {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const role = inter.options.getRole("role", true);

        const messages = await ch.messages.fetch({ limit: 50 });
        const msg = messages.find((m) => {
            if (!m.embeds.length) return false;
            if (m.embeds[0].title !== title) return false;
            if (!m.embeds[0].footer) return false;
            if (!m.embeds[0].footer.text.match("reactroles")) return false;
            if (!client.user) return false;
            if (!m.author.equals(client.user)) return false;
            return true;
        });
        if (!msg) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }

        const embed = msg.embeds[0];

        // verify that the role exists
        const roleField = embed.fields.find(
            (f) => f.value === roleMention(role.id)
        );
        if (!roleField) {
            inter.reply(`${role} does not exist on ${title}`);
            return;
        }

        // filter out the field we want to remove
        const fields = embed.fields.filter(
            (f) => f.value !== roleMention(role.id)
        );

        const builder = EmbedBuilder.from(embed);
        builder.setFields(fields)
        msg.edit({ embeds: [builder] });

        // resolve the emoji, fetch the reaction and remove it
        const match = roleField.name.match(patterns.EMOJI_REGEX);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const emoji = match ? match.groups!.id : roleField.name;
        msg.reactions.cache.get(emoji)?.remove();

        inter.reply(`Removed ${role} from ${title}`);
    },
};

export default command;
