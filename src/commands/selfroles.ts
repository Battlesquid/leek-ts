import { SlashCommandBuilder } from "@discordjs/builders"
import { CommandInteraction } from "discord.js"

export const structure = new SlashCommandBuilder()
    .setName("selfroles")
    .setDescription("Manage roles")

    .addSubcommandGroup(group =>
        group
            .setName("panel")
            .setDescription("Manage selfrole panels")
            .addSubcommand(subcmd =>
                subcmd
                    .setName("create")
                    .setDescription("Create a selfrole panel")
                    .addChannelOption(option =>
                        option.setName("channel")
                            .setDescription("The channel to create the panel in.")
                            .setRequired(true))
                    .addStringOption(option =>
                        option
                            .setName("title")
                            .setDescription("The title of the panel")
                            .setRequired(true))
            )
            .addSubcommand(subcmd =>
                subcmd
                    .setName("set_name")
                    .setDescription("Set the name for the selfrole panel")
                    .addStringOption(option =>
                        option
                            .setName("name")
                            .setDescription("The name to set the panel to")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcmd =>
                subcmd
                    .setName("set_color")
                    .setDescription("Set the color for the selfrole panel")
                    .addStringOption(option =>
                        option
                            .setName("color")
                            .setDescription("The color to set the panel to")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcmd =>
                subcmd
                    .setName("set_description")
                    .setDescription("Set the description for the selfrole panel")
                    .addStringOption(option =>
                        option
                            .setName("desc")
                            .setDescription("The description to set the panel to")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcmd =>
                subcmd
                    .setName("set_msg")
                    .setDescription("Set the prepended message for the selfrole panel")
                    .addStringOption(option =>
                        option
                            .setName("name")
                            .setDescription("The prepended message to set on the panel")
                    )
            )
            .addSubcommand(subcmd =>
                subcmd
                    .setName("add_role")
                    .setDescription("Add a role to the panel")
                    .addStringOption(option =>
                        option
                            .setName("name")
                            .setDescription("The name of the panel to add to")
                            .setRequired(true)
                    )
                    .addRoleOption(option =>
                        option
                            .setName("role")
                            .setDescription("The role to give on react")
                            .setRequired(true)
                    )
                    .addStringOption(option =>
                        option
                            .setName("emoji")
                            .setDescription("The emoji to represent this role")
                            .setRequired(true)
                    )
            )
            .addSubcommand(subcmd =>
                subcmd
                    .setName("remove_role")
                    .setDescription("Remove a role from the panel")
                    .addStringOption(option =>
                        option
                            .setName("name")
                            .setDescription("The name of the panel"))
                    .addRoleOption(option =>
                        option
                            .setName("role")
                            .setDescription("The role to remove"))
            )
    )


const create = (inter: CommandInteraction) => {

}

const remove = (inter: CommandInteraction) => {

}

const set_name = (inter: CommandInteraction) => {

}

export const execute = (inter: CommandInteraction) => {
    const group = inter.options.getSubcommandGroup();
    // if (group === "panel")
}