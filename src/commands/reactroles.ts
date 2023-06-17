import { patterns } from '@utils';
import { container } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ActionRowBuilder, ChannelType, ColorResolvable, Embed, EmbedBuilder, Message, ModalActionRowComponentBuilder, ModalBuilder, TextChannel, TextInputBuilder, TextInputStyle, roleMention } from 'discord.js';
import emojiRegex from 'emoji-regex';
import { reactrolesInteraction } from '@interactions';
import { NullishTextInputBuilder } from '@utils';

export class ReactRolesCommand extends Subcommand {
    public constructor(context: Subcommand.Context, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: 'reactroles',
            subcommands: [
                {
                    name: 'create',
                    chatInputRun: 'chatInputCreate',
                },
                {
                    name: 'edit',
                    chatInputRun: 'chatInputEdit'
                },
                {
                    name: 'add_role',
                    chatInputRun: 'chatInputAddRole'
                },
                {
                    name: 'remove_role',
                    chatInputRun: 'chatInputRemoveRole'
                },
            ],
            preconditions: ["GuildTextOnly"]
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand(reactrolesInteraction, {
            idHints: ["922949939909259264"]
        })
    }

    private async findReactRole(ch: TextChannel, name: string): Promise<[Message | undefined, Embed | undefined]> {
        const messages = await ch.messages.fetch({ limit: 50 });
        const msg = messages.find((m) => {
            if (!m.embeds.length) return false;
            if (m.embeds[0].title !== name) return false;
            if (!m.embeds[0].footer) return false;
            if (!m.embeds[0].footer.text.match("reactroles")) return false;
            if (!container.client.user) return false;
            if (!m.author.equals(container.client.user)) return false;
            return true;
        });
        return [msg, msg?.embeds[0]];
    }

    public async chatInputCreate(inter: Subcommand.ChatInputCommandInteraction<"cached" | "raw">) {
        const color = `#${inter.options.getString("color", false) ?? "444444"
            }` as ColorResolvable;
        const ch = inter.options.getChannel("channel", true);
        const name = inter.options.getString("name", true);
        const desc = inter.options.getString("desc", true);
        const msg = inter.options.getString("msg", false) ?? undefined;

        if (!/^(?:#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})$/.test(color.toString())) {
            inter.reply("Invalid color, exiting.");
            return;
        }

        const reactEmbed = new EmbedBuilder()
            .setTitle(name)
            .setDescription(desc)
            .setColor(color)
            .setFooter({ text: "reactroles" });

        const channel = await inter.guild?.channels.fetch(ch.id);
        if (!channel || channel.type !== ChannelType.GuildText) {
            inter.reply("Channel unavailable, please try again.");
            return;
        }

        channel?.send({ content: msg, embeds: [reactEmbed] });

        inter.reply(`New react roles created in ${ch}.`);
    }

    public async chatInputEdit(inter: Subcommand.ChatInputCommandInteraction) {
        const ch: TextChannel = inter.options.getChannel("channel", true);
        const title = inter.options.getString("title", true);
        const [msg, reactrole] = await this.findReactRole(ch, title);
        if (reactrole === undefined || msg === undefined) {
            inter.reply(
                "The requested react-roles are either too far back or does not exist."
            );
            return;
        }
        const modal = new ModalBuilder()
            .setCustomId(`reactroles_edit_${title}`)
            .setTitle('Edit React Roles');

        const titleInput = new NullishTextInputBuilder()
            .setCustomId('titleInput')
            .setLabel("Title")
            .setStyle(TextInputStyle.Short)
            .setNullishValue(reactrole.title);

        const descInput = new NullishTextInputBuilder()
            .setCustomId('descInput')
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setNullishValue(reactrole.description)

        const colorInput = new NullishTextInputBuilder()
            .setCustomId('colorInput')
            .setLabel("Color")
            .setStyle(TextInputStyle.Short)
            .setNullishValue(reactrole.hexColor);

        const msgInput = new TextInputBuilder()
            .setCustomId('msgInput')
            .setLabel("Message")
            .setStyle(TextInputStyle.Paragraph);

        const titleRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(titleInput);
        const descRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(descInput);
        const colorRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(colorInput);
        const msgRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(msgInput);

        modal.addComponents(titleRow, descRow, colorRow, msgRow);

        await inter.showModal(modal);
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

        msg.edit({ embeds: [builder] })
            .then(() => msg.react(emoji))
            .then(() => inter.reply(
                `Users can now react to ${title} with ${emoji} to get the ${role} role`
            ))
            .catch((e) => {
                container.logger.error(e);
                inter.reply("An error occurred, please try again later.");
            })

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
        builder.setFields(fields)
        msg.edit({ embeds: [builder] });

        const match = roleField.name.match(patterns.EMOJI_REGEX);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const emoji = match ? match.groups!.id : roleField.name;
        msg.reactions.cache.get(emoji)?.remove()
            .then(() => inter.reply(`Removed ${role} from ${title}`))
            .catch((e) => {
                container.logger.error(e);
                inter.reply("An error occurred, please try again later.");
            });
    }
}