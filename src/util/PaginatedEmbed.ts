import {
    ButtonInteraction,
    Collection,
    CommandInteraction,
    InteractionCollector,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from "discord.js";

type OnCollectCallback = (
    collector: InteractionCollector<ButtonInteraction>,
    inter: ButtonInteraction
) => Promise<void> | void;
type OnEndCallback = (
    coll: Collection<string, ButtonInteraction>
) => Promise<void> | void;

export type PaginatedEmbedOptions = {
    inter: CommandInteraction;
    pages: MessageEmbed[];
    prev?: MessageButton;
    next?: MessageButton;
    otherButtons?: MessageButton[];
    timeout: number;
    onCollect?: OnCollectCallback;
    onEnd?: OnEndCallback;
};

export type PaginatedTemplateOptions<T> = {
    entries: T[];
    perPage: number;
    perPageCallback: (page: MessageEmbed, currPage: number) => void;
    perItemCallback: (page: MessageEmbed, data: T, currPage: number) => void;
    base?: MessageEmbed;
};

export default class PaginatedEmbed {
    private inter: CommandInteraction;
    private pages: MessageEmbed[];
    private timeout: number;
    private prev: MessageButton;
    private next: MessageButton;
    private otherButtons: MessageButton[];
    private currPage = 0;

    private onCollect?: OnCollectCallback;
    private onEnd?: OnEndCallback;

    private defaultPrev = new MessageButton()
        .setCustomId("prev")
        .setEmoji("⬅️")
        .setStyle("PRIMARY");

    private defaultNext = new MessageButton()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle("PRIMARY");

    constructor(options: PaginatedEmbedOptions) {
        this.inter = options.inter;
        this.pages = options.pages;
        this.timeout = options.timeout;

        this.prev = options.prev ?? this.defaultPrev;
        this.prev.setCustomId("prev");

        this.next = options.next ?? this.defaultNext;
        this.next.setCustomId("next");

        this.otherButtons = options.otherButtons ?? [];

        this.onCollect = options.onCollect;
        this.onEnd = options.onEnd;
    }

    private validate() {
        if (this.otherButtons.length > 3)
            throw Error("More than 3 other buttons have been given.");
        if (this.next.style === "LINK" || this.prev.style === "LINK")
            throw Error("Link buttons cannot be used as prev/next buttons");
    }
    public async send() {
        this.validate();
        this.prev.setDisabled(true);
        if (this.currPage + 1 === this.pages.length)
            this.next.setDisabled(true);

        const row = new MessageActionRow().addComponents(
            this.prev,
            this.next,
            ...this.otherButtons
        );

        const msg = (await this.inter.reply({
            embeds: [this.pages[this.currPage]],
            components: [row],
            fetchReply: true,
        })) as Message;

        const filter = (i: ButtonInteraction) => {
            const otherCustomIds = this.otherButtons.map((b) => b.customId);
            return (
                i.customId === this.prev.customId ||
                i.customId === this.next.customId ||
                otherCustomIds.includes(i.customId)
            );
        };

        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: "BUTTON",
            time: this.timeout,
        });

        collector.on("collect", async (inter) => {
            await inter.deferUpdate();
            if (
                inter.customId === this.next.customId ||
                inter.customId === this.prev.customId
            ) {
                if (inter.customId === this.next.customId) {
                    this.currPage++;
                    if (this.currPage + 1 === this.pages.length) {
                        this.next.setDisabled(true);
                    } else {
                        this.next.setDisabled(false);
                    }
                    if (this.currPage > 0) {
                        this.prev.setDisabled(false);
                    }
                } else {
                    this.currPage--;
                    if (this.currPage === 0) {
                        this.prev.setDisabled(true);
                    } else {
                        this.prev.setDisabled(false);
                    }
                    if (this.currPage + 1 < this.pages.length) {
                        this.next.setDisabled(false);
                    }
                }

                const updatedRow = new MessageActionRow().addComponents(
                    this.prev,
                    this.next,
                    ...this.otherButtons
                );

                inter.editReply({
                    embeds: [this.pages[this.currPage]],
                    components: [updatedRow],
                });

                collector.resetTimer();
            }

            if (this.onCollect) this.onCollect(collector, inter);
        });

        collector.on("end", (collected) => {
            if (msg.deleted) return;

            this.prev.setDisabled(true);
            this.next.setDisabled(true);
            this.otherButtons.forEach((b) => b.setDisabled(true));

            const disabledRow = new MessageActionRow().addComponents(
                this.prev,
                this.next,
                ...this.otherButtons
            );

            msg.edit({
                components: [disabledRow],
            });

            if (this.onEnd) this.onEnd(collected);
        });
    }

    public static generateFromTemplate<T>(
        options: PaginatedTemplateOptions<T>
    ) {
        const { entries, perPage, perPageCallback, perItemCallback, base } =
            options;

        const totalPages = Math.ceil(entries.length / perPage);
        const pages: MessageEmbed[] = new Array(totalPages);

        for (let currPage = 0; currPage < totalPages; currPage++) {
            pages[currPage] = new MessageEmbed(base);

            perPageCallback(pages[currPage], currPage);

            const start = currPage * perPage;
            const end = Math.min(entries.length, start + perPage);

            for (let i = start; i < end; i++) {
                perItemCallback(pages[currPage], entries[i], currPage);
            }
        }

        return pages;
    }
}
