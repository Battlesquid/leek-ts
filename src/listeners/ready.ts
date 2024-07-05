import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";
import { config } from "../config";

@ApplyOptions<Listener.Options>({
    once: true,
    event: Events.ClientReady
})
export class ReadyListener extends Listener {
    run() {
        this.container.logger.info(`leekbot online (${config.getenv("NODE_ENV")})`);
    }
}
