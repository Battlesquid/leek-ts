import { MessageReaction, User } from "discord.js";
import { SubEvent } from "../types/EventTypes";

const subevent: SubEvent = {
    name: "reactRoleRemove",
    parent: "messageReactionRemove",
    handleLoc: "pre",
    async meetsReqs(reaction: MessageReaction, user: User) {
        const fullMessage = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
        if(user.bot) return false;
        if(fullMessage.embeds.length === 0) return false;
        
        const embed = fullMessage.embeds[0];
        if(!embed.footer) return false;
        
        return embed.footer.text.match("reactroles") !== null;
    },
    async handle(reaction: MessageReaction, user: User) {
        const fullMessage = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
        if (!fullMessage.guild) return;

        const embed = fullMessage.embeds[0];
        const field = embed.fields.find(f => f.name === reaction.emoji.toString())
        if (!field) return;

        const match = field.value.match(/^<@&(?<id>\d+)>$/)
        if (!match) return;

        const roleID = match.groups!.id; // second match (index 1) has the id
        const role = await fullMessage.guild.roles.fetch(roleID);
        if (!role) return;

        const member = await fullMessage.guild.members.fetch(user.id);
        member.roles.remove(role)
            .catch(() => member.send(`I could not give you the role "${role.name}". Contact the server administration to make sure that my role (leekbeta) is above the requested role.`))
    }
}

export default subevent;