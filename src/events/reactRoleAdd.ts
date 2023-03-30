import { MessageReaction, User } from "discord.js";
import { Event } from "#types/EventTypes";
import LeekClient from "../LeekClient";

const event: Event<"messageReactionAdd"> = {
    eventName: "messageReactionAdd",
    async handle(client: LeekClient, reaction: MessageReaction, user: User) {
        if (user.bot) return;

        const fullMessage = reaction.message.partial
            ? await reaction.message.fetch()
            : reaction.message;

        if (!fullMessage.guild) return;
        if (fullMessage.embeds.length === 0) return;

        const embed = fullMessage.embeds[0];
        if (embed.footer?.text.match("reactroles") === null) return;

        const field = embed.fields.find(
            (f) => f.name === reaction.emoji.toString()
        );
        if (!field) return;

        const match = field.value.match(/^<@&(?<id>\d+)>$/);
        if (!match) return;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const roleID = match.groups!.id;
        const role = await fullMessage.guild.roles.fetch(roleID);
        if (!role) return;

        const member = await fullMessage.guild.members.fetch(user.id);
        member.roles
            .add(role)
            .catch(() => {
                member.send(
                    `I could not give you the role "${role.name}". Contact the server administration to make sure that my role (leekbeta) is above the requested role.`
                )
            });
    },
};

export default event;
