import { SlashCommandBuilder } from "@discordjs/builders";
import { ParentCommandBase } from "../../../types";

const command: ParentCommandBase = {
    structure: new SlashCommandBuilder()
        .setName("reactroles")
        .setDescription("Reaction-role commands")
}

export default command;