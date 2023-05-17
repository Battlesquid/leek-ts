import {
    ActionRowBuilder,
    APIButtonComponentWithCustomId,
    ButtonBuilder, ButtonInteraction, ButtonStyle, Collection,
    CommandInteraction, ComponentType, EmbedBuilder, InteractionCollector,
    Message
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
    pages: EmbedBuilder[];
    prev?: ButtonBuilder;
    next?: ButtonBuilder;
    otherButtons?: ButtonBuilder[];
    timeout: number;
    onCollect?: OnCollectCallback;
    onEnd?: OnEndCallback;
};

export type PaginatedTemplateOptions<T> = {
    entries: T[];
    perPage: number;
    perPageCallback: (page: EmbedBuilder, currPage: number) => void;
    perItemCallback: (page: EmbedBuilder, data: T, currPage: number) => void;
    base?: EmbedBuilder;
};

export default class PaginatedEmbed {
    private inter: CommandInteraction;
    private pages: EmbedBuilder[];
    private timeout: number;
    private prev: ButtonBuilder;
    private next: ButtonBuilder;
    private otherButtons: ButtonBuilder[];
    private currPage = 0;
    private readonly NEXT_BUTTON_ID = "next";
    private readonly PREV_BUTTON_ID = "prev";

    private onCollect?: OnCollectCallback;
    private onEnd?: OnEndCallback;

    private defaultPrev = new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary);

    private defaultNext = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary);

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
        if (this.next.data.style === ButtonStyle.Link || this.prev.data.style === ButtonStyle.Link)
            throw Error("Link buttons cannot be used as prev/next buttons");
    }

    public async send() {
        this.validate();
        this.prev.setDisabled(true);
        if (this.currPage + 1 === this.pages.length)
            this.next.setDisabled(true);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
            const otherCustomIds = this.otherButtons.map((b) => (b.data as APIButtonComponentWithCustomId).custom_id);
            
            return (
                i.customId === this.PREV_BUTTON_ID ||
                i.customId === this.NEXT_BUTTON_ID ||
                otherCustomIds.includes(i.customId)
            );
        };

        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: this.timeout,
        });

        collector.on("collect", async (inter) => {
            await inter.deferUpdate();
            if (
                inter.customId === this.NEXT_BUTTON_ID ||
                inter.customId === this.PREV_BUTTON_ID
            ) {
                if (inter.customId === this.NEXT_BUTTON_ID) {
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

                const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
            if (!msg) return;

            this.prev.setDisabled(true);
            this.next.setDisabled(true);
            this.otherButtons.forEach((b) => b.setDisabled(true));

            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
        const pages: EmbedBuilder[] = new Array(totalPages);

        for (let currPage = 0; currPage < totalPages; currPage++) {
            pages[currPage] = EmbedBuilder.from(base ?? new EmbedBuilder());

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
