import { ClientEvents } from "discord.js";
import { Event } from "#types/EventTypes";
import { loadDirFull } from ".";
import LeekClient from "../LeekClient";

export const loadEvents = async (dir: string, client: LeekClient) => {
    console.log("loading events");
    const files = await loadDirFull(dir);

    return Promise.all(
        files.map(async eventFile => {
            const event: Event<keyof ClientEvents> = (await import(eventFile.path))
                .default;

            if (event.once) {
                client.once(event.eventName, (...args) =>
                    event.handle(client, ...args)
                );
            } else {
                client.on(event.eventName, (...args) =>
                    event.handle(client, ...args)
                );
            }
        })
    )
};
