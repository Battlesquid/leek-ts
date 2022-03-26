import { Event } from "#types/EventTypes";

const event: Event<"ready"> = {
    eventName: "ready",
    once: true,
    handle: async () => console.log("loading complete, leek online."),
};

export default event;
