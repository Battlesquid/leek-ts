import { Listener } from "@sapphire/framework";
import { MessageReaction, User } from "discord.js";

export class ReactRoleAddListener extends Listener {
    public constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "messageReactionAdd",
        });
    }
    async run(reaction: MessageReaction, user: User) {
        if (user.bot) {return;}

        const message = reaction.message.partial
            ? await reaction.message.fetch()
            : reaction.message;

        if (!message.guild) {return;}
        if (message.embeds.length === 0) {return;}

        const embed = message.embeds[0];
        if (embed.footer?.text.match("reactroles") === null) {return;}

        const field = embed.fields.find(
            (f) => f.name === reaction.emoji.toString()
        );
        if (!field) {return;}

        const match = field.value.match(/^<@&(?<id>\d+)>$/);
        if (!match) {return;}

         
        const roleID = match.groups!.id;
        const role = await message.guild.roles.fetch(roleID);
        if (!role) {return;}

        const member = await message.guild.members.fetch(user.id);
        member.roles
            .add(role)
            .catch((e) => {
                this.container.logger.error(e);
                member.send(
                    `I could not give you the role "${role.name}". Contact the server administration to make sure that my role (leekbeta) is above the requested role.`
                );
            });
    }

}