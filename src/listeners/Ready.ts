import { Listener } from "@sapphire/framework";

export class ReadyListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            once: true,
            event: "ready"
        })
    }
    run() {
        this.container.logger.info("leekbot online")
    }
}