import { ClientEvents } from "discord.js";
import { Event } from "#types/EventTypes";
import { loadDirFull } from ".";
import LeekClient from "../LeekClient";
import logger from "#util/logger/logger";

export const loadEvents = async (dir: string, client: LeekClient) => {
    console.info("loading events")
    const files = await loadDirFull(dir);

    return Promise.all(
        files.map(async eventFile => {
            const event: Event<keyof ClientEvents> = (await import(eventFile.path))
                .default;

            console.info(`loading event [${event.eventName}]`);

            if (event.once) {
                client.once(event.eventName, (...args) => {
                    try {
                        event.handle(client, ...args)
                    } catch (e) {
                        logger.error({
                            event: event.eventName
                        });
                    }
                }
                );
            } else {
                client.on(event.eventName, (...args) => {
                    try {
                        event.handle(client, ...args)
                    } catch (e) {
                        logger.error({
                            event: event.eventName
                        });
                    }
                }
                );
            }
        })
    )
};
