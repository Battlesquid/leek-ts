import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener } from "@sapphire/framework";

@ApplyOptions<Listener.Options>({
    once: true,
    event: Events.ClientReady
})
export class ReadyListener extends Listener {
    run() {
        this.container.logger.info("leekbot online");
    }
}
