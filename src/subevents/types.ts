import { ClientEvents } from "discord.js";

export type Subevent = {
    name: string
    parent: keyof ClientEvents
    meetsReq: (...args: any[]) => Promise<boolean> | boolean
    tryExec: (...args: any[]) => Promise<any>
}