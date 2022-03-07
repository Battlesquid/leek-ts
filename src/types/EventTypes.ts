import { Awaitable, ClientEvents } from "discord.js";
import LeekClient from "../LeekClient";

export type Event = {
    id?: string
    eventName: keyof ClientEvents
    once?: boolean | false
    handle: (client: LeekClient, ...args: any) => Awaitable<void>
}

// handle<K extends keyof ClientEvents>(...args: ClientEvents[K]): (...args: ClientEvents[K]) => Awaitable<void>
