import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { MessageReaction, User } from "discord.js";

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
        if (embed.footer?.text.match("reactroles") === null) {
            return;
        }

        const field = embed.fields.find((f) => f.name === reaction.emoji.toString());
        if (!field) {
            return;
        }

        const match = field.value.match(/^<@&(?<id>\d+)>$/);
        if (!match) {
            return;
        }

        const roleID = match.groups!.id;
        const role = await message.guild.roles.fetch(roleID);
        if (!role) {
            return;
        }

        const member = await message.guild.members.fetch(user.id);
        member.roles
            .remove(role)
            .catch(() => member.send(`I could not give you the role "${role.name}". Contact the server administration to make sure that my role (leekbeta) is above the requested role.`));
    }
}
