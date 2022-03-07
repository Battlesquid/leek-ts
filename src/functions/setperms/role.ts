import { CommandInteraction, GuildApplicationCommandPermissionData, Permissions } from "discord.js";
import LeekClient from "src/LeekClient";
import { SlashCommandFunction } from "types/CommandTypes";

const command: SlashCommandFunction = {
    name: "setperms",
    subcommand: "role",
    execute: async (client: LeekClient, inter: CommandInteraction) => {
        if (!inter.guild || !inter.guildId || !client.application) {
            inter.reply("An unexpected error occured, please try again later.");
            return;
        }

        if (!inter.memberPermissions?.has(Permissions.FLAGS.MANAGE_GUILD)) {
            inter.reply("You do not have permission to use that command");
            return;
        }

        const cmdName = inter.options.getString("command", true);
        const role = inter.options.getRole("role", true);
        const allowed = inter.options.getBoolean("allowed", true);

        const commands = await client.application.commands.fetch();
        if (!commands) {
            inter.reply("Could not fetch commands, please try again later");
            return;
        }

        if (cmdName === "all") {
            const perms = client.application.commands.cache
                .filter(cmd => cmd.name !== command.name)
                .map<GuildApplicationCommandPermissionData>(cmd => ({
                    id: cmd.id,
                    permissions: [{
                        id: role.id,
                        type: "ROLE",
                        permission: allowed
                    }]
                }))

            client.application.commands.permissions.set({
                guild: inter.guildId,
                fullPermissions: perms
            })

            inter.reply(`Permissions updated, ${role} ${allowed ? "allowed" : "is not allowed"} to use all commands.`);
        } else {
            const targetCmd = commands.find(cmd => cmd.name === cmdName);
            if (!targetCmd) {
                inter.reply(`Could not find ${cmdName}, please contact the owner`)
                return;
            }

            client.application.commands.permissions.set({
                guild: inter.guildId,
                command: targetCmd.id,
                permissions: [{
                    id: role.id,
                    type: "ROLE",
                    permission: allowed
                }]
            })

            inter.reply(`Permissions updated, ${role} is ${allowed ? "allowed" : "not allowed"} to use ${cmdName}.`)
        }
    }
}

export default command;