import { ButtonInteraction, CommandInteraction, ContextMenuInteraction, Interaction, MessageComponentInteraction, SelectMenuInteraction } from "discord.js";
import { LeekClient } from "../LeekClient";

interface InterHandler {
    name: string
    meetsReq(inter: Interaction): boolean
    execute(client: LeekClient, inter: Interaction): Promise<any>
}

const interHandlers: InterHandler[] = [
    {
        name: "CommandInteraction",
        meetsReq: (inter: Interaction) => inter.isCommand(),
        execute: async (client: LeekClient, inter: Interaction) => {
            const cmd = (inter as CommandInteraction);
            const name = cmd.commandName;
            console.log(cmd.options.getSubcommand());
            cmd.reply("lmao")
        }
    },
    {
        name: "ButtonInteraction",
        meetsReq: (inter: Interaction) => inter.isButton(),
        execute: async (client: LeekClient, inter: Interaction) => {
            const btn = inter as ButtonInteraction
        }
    },
    {
        name: "ContextMenuInteraction",
        meetsReq: (inter: Interaction) => inter.isContextMenu(),
        execute: async (client: LeekClient, inter: Interaction) => {
            const ctxMenu = inter as ContextMenuInteraction;
        }
    },
    {
        name: "MessageComponentInteraction",
        meetsReq: (inter: Interaction) => inter.isMessageComponent(),
        execute: async (client: LeekClient, inter: Interaction) => {
            const msgComp = inter as MessageComponentInteraction;
        }
    },
    {
        name: "SelectMenuInteraction",
        meetsReq: (inter: Interaction) => inter.isSelectMenu(),
        execute: async (client: LeekClient, inter: Interaction) => {
            const selMenu = inter as SelectMenuInteraction;
        }
    }
]

export const dispatch = (client: LeekClient, inter: Interaction) => {
    const handler = interHandlers.filter(i => i.meetsReq(inter))[0]
    handler.execute(client, inter)
}