import { ClientEvents } from "discord.js";
import { LeekClient } from "../LeekClient";

export type Handler = (client: LeekClient, ...args: any[]) => Promise<void> | void

export type Event = {
    name: keyof ClientEvents
    once?: boolean | false
    handle: Handler
}

export type SubEventExecLoc = "pre" | "post";

export type SubEvent = {
    name: string
    handleLoc: SubEventExecLoc
    parent: keyof ClientEvents;
    handle(...args: any[]): Promise<void> | void;
}