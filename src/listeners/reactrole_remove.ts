import { ApplyOptions } from "@sapphire/decorators";
import { RoleMentionRegex } from "@sapphire/discord.js-utilities";
import { Events, Listener } from "@sapphire/framework";
import { ReactRolesCommand } from "../commands/reactroles";
import { GuildMember, MessageReaction, Role, User } from "discord.js";

@ApplyOptions<Listener.Options>({
    event: Events.MessageReactionRemove
})
export class ReactRoleRemoveListener extends Listener {
    async run(reaction: MessageReaction, user: User) {
        if (user.bot) {
            return;
        }

        const message = reaction.message.partial ? await reaction.message.fetch() : reaction.message;

        if (!message.guild) {
            return;
        }
        if (message.embeds.length === 0) {
            return;
        }

        const [embed] = message.embeds;
        if (!ReactRolesCommand.isReactRole(embed)) {
            return;
        }

        const field = embed.fields.find((f) => f.name === reaction.emoji.toString());
        if (!field) {
            return;
        }

        const match = field.value.match(RoleMentionRegex);
        if (!match) {
            return;
        }

        const roleID = match.groups!.id;
        let role: Role | null = null;
        try {
            role = await message.guild.roles.fetch(roleID);
            if (!role) {
                return;
            }
        } catch (error) {
            return;
        }

        let member: GuildMember | null = null;
        try {
            member = await message.guild.members.fetch(user.id);
        } catch (error) {
            return;
        }

        if (!member.roles.cache.has(roleID)) {
            return;
        }

        try {
            await member.roles.remove(role);
        } catch (error) {
            console.error(error);
        }
    }
}
