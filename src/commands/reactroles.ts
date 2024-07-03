import { ApplyOptions } from "@sapphire/decorators";
import { container } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { patterns } from "@utils";
import { ChannelType, ColorResolvable, Embed, EmbedBuilder, Message, TextChannel, roleMention } from "discord.js";
import emojiRegex from "emoji-regex";
import { reactroles } from "interactions";

@ApplyOptions<Subcommand.Options>({
    name: reactroles.commands.chat.base.name,
    subcommands: [
        {
            name: reactroles.commands.chat.subcommands.create.name,
            chatInputRun: "chatInputCreate",
        },
        {
            name: reactroles.commands.chat.subcommands.edit.name,
            chatInputRun: "chatInputEdit"
        },
        {
            name: reactroles.commands.chat.subcommands.add_role.name,
            chatInputRun: "chatInputAddRole"
        },
        {
            name: reactroles.commands.chat.subcommands.remove_role.name,
            chatInputRun: "chatInputRemoveRole"
        },
    ],
    preconditions: ["GuildOnly"],
    requiredUserPermissions: ["ManageRoles"],
    requiredClientPermissions: ["SendMessages", "AttachFiles", "AddReactions"]
})
export class ReactRolesCommand extends Subcommand {

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(reactroles.commands.chat.base, {
            idHints: ["922949939909259264"]
        });
    }

    private async findReactRole(ch: TextChannel, name: string): Promise<[Message | undefined, Embed | undefined]> {
        const messages = await ch.messages.fetch({ limit: 50 });
        const msg = messages.find((m) => {
            if (!m.embeds.length) { return false; }
            if (m.embeds[0].title !== name) { return false; }
            if (!m.embeds[0].footer) { return false; }
            if (!m.embeds[0].footer.text.match("reactroles")) { return false; }
            if (!container.client.user) { return false; }
            if (!m.author.equals(container.client.user)) { return false; }
            return true;
        });
        return [msg, msg?.embeds[0]];
    }

    public async chatInputCreate(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const ch = inter.options.getChannel("channel", true);
        const title = inter.options.getString("title", true);
        const desc = inter.options.getString("desc", false);
        const color = `#${inter.options.getString("color", false) ?? "444444"
            }` as ColorResolvable;
        const msg = inter.options.getString("msg", false) ?? undefined;

        if (!/^(?:#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})$/.test(color.toString())) {
            inter.reply({
                content: "Invalid color, exiting.",
                ephemeral: true
            });
            return;
        }

        const reactEmbed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(desc)
            .setColor(color)
            .setFooter({ text: "reactroles" });

        const channel = await inter.guild?.channels.fetch(ch.id);
        if (!channel || channel.type !== ChannelType.GuildText) {
            inter.reply("Channel unavailable, please try again.");
            return;
        }

        channel.send({ content: msg, embeds: [reactEmbed] });

        inter.reply(`New react roles created in ${ch}.`);
    }

    public async chatInputEdit(inter: Subcommand.ChatInputCommandInteraction) {
        const ch: TextChannel = inter.options.getChannel("channel", true);
        const title = inter.options.getString("title", true);
        const newTitle = inter.options.getString("new_title", false);
        const desc = inter.options.getString("desc", false);
        const color: ColorResolvable = `#${inter.options.getString("color", false) ?? ""}`;
        const msg = inter.options.getString("msg", false) ?? undefined;

        const [reactroleMsg, reactrole] = await this.findReactRole(ch, title);
        if (reactrole === undefined || reactroleMsg === undefined) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }

        const editedReactrole = EmbedBuilder.from(reactrole);
        if (/^#[A-Fa-f0-9]{6}$/.test(color.toString())) {
            editedReactrole.setColor(color);
        }
        if (desc !== null) {
            editedReactrole.setDescription(desc);
        }
        if (newTitle !== null) {
            editedReactrole.setTitle(newTitle);
        }

        await reactroleMsg.edit({
            content: msg,
            embeds: [editedReactrole]
        });

        inter.reply(`Reactrole '${title}' updated successfully.`);
    }

    public async chatInputAddRole(inter: Subcommand.ChatInputCommandInteraction) {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const role = inter.options.getRole("role", true);
        const emoji = inter.options.getString("emoji", true);

        if (!(emojiRegex().test(emoji) || patterns.EMOJI_REGEX.test(emoji))) {
            inter.reply("Malformed emoji, exiting");
            return;
        }
        const [msg, reactrole] = await this.findReactRole(ch, title);
        if (reactrole === undefined || msg === undefined) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }

        if (reactrole.fields.find((f) => f.name === emoji)) {
            inter.reply("Emoji already in use, exiting.");
            return;
        }

        if (
            reactrole.fields.find(
                (f) => f.value === roleMention(role.id)
            )
        ) {
            inter.reply("Role already included, exiting.");
            return;
        }

        const builder = EmbedBuilder.from(reactrole);
        builder.addFields([{ name: emoji, value: roleMention(role.id), inline: true }]);

        await msg.edit({ embeds: [builder] });
        await msg.react(emoji);
        inter.reply(
            `Users can now react to ${title} with ${emoji} to get the ${role} role`
        );
    }

    public async chatInputRemoveRole(inter: Subcommand.ChatInputCommandInteraction) {
        const ch = inter.options.getChannel("channel", true) as TextChannel;
        const title = inter.options.getString("title", true);
        const role = inter.options.getRole("role", true);
        const [msg, reactrole] = await this.findReactRole(ch, title);
        if (reactrole === undefined || msg === undefined) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }

        const roleField = reactrole.fields.find(
            (f) => f.value === roleMention(role.id)
        );
        if (!roleField) {
            inter.reply(`${role} does not exist on ${title}`);
            return;
        }

        const fields = reactrole.fields.filter(
            (f) => f.value !== roleMention(role.id)
        );

        const builder = EmbedBuilder.from(reactrole);
        builder.setFields(fields);
        msg.edit({ embeds: [builder] });

        const match = roleField.name.match(patterns.EMOJI_REGEX);

        const emoji = match ? match.groups!.id : roleField.name;
        msg.reactions.cache.get(emoji)?.remove();
        inter.reply(`Removed ${role} from ${title}`);
    }
}