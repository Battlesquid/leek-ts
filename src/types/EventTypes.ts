import { Awaitable, ClientEvents } from "discord.js";
import LeekClient from "../LeekClient";

export type Event<K extends keyof ClientEvents> = {
    eventName: K;
    once?: boolean | false;
    handle(
        client: LeekClient,
        ...args: ClientEvents[K]
    ): Awaitable<void> | void;
};
