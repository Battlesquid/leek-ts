import { ActionRowBuilder, APIButtonComponentWithCustomId, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, ComponentType, EmbedBuilder, InteractionCollector } from "discord.js";
import emojis from "./emojis";

type NavigationButton = ButtonBuilder & {
    setStyle: (style: Exclude<ButtonStyle, ButtonStyle.Link>) => NavigationButton;
};

type OnCollectCallback = (collector: InteractionCollector<ButtonInteraction>, inter: ButtonInteraction<"cached" | "raw">) => Promise<void> | void;

export type PaginatedEmbedOptions = {
    inter: CommandInteraction;
    pages: EmbedBuilder[];
    prev?: NavigationButton;
    next?: NavigationButton;
    otherButtons?: [NavigationButton?, NavigationButton?, NavigationButton?];
    timeout: number;
    onCollect?: OnCollectCallback;
};

export type PaginatedTemplateOptions<T> = {
    items: T[];
    perPage: number;
    pageRender: (page: EmbedBuilder, pageNum: number) => void;
    itemRender: (page: EmbedBuilder, data: T, pageNum: number) => void;
    base?: EmbedBuilder;
};

export class PaginatedEmbed {
    private inter: CommandInteraction;
    private pages: EmbedBuilder[];
    private timeout: number;
    private prev: NavigationButton;
    private next: NavigationButton;
    private otherButtons: NavigationButton[];
    private pageNum = 0;
    private readonly NEXT_BUTTON_ID = "next";
    private readonly PREV_BUTTON_ID = "prev";

    private onCollect?: OnCollectCallback;

    constructor(options: PaginatedEmbedOptions) {
        this.inter = options.inter;
        this.pages = options.pages;
        this.timeout = options.timeout;

        this.prev = options.prev ?? new ButtonBuilder().setCustomId("prev").setEmoji(emojis.LEFT_ARROW).setStyle(ButtonStyle.Primary);
        this.prev.setCustomId("prev").setDisabled(true);

        this.next = options.next ?? new ButtonBuilder().setCustomId("next").setEmoji(emojis.RIGHT_ARROW).setStyle(ButtonStyle.Primary);
        this.next.setCustomId("next");
        if (this.pageNum + 1 === this.pages.length) {
            this.next.setDisabled(true);
        }

        this.otherButtons =
            options.otherButtons?.filter((b): b is ButtonBuilder => {
                return b?.setStyle !== undefined;
            }) ?? [];

        this.onCollect = options.onCollect;
    }

    async send() {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(this.prev, this.next, ...this.otherButtons);

        const msg = await this.inter.reply({
            embeds: [this.pages[this.pageNum]],
            components: [row],
            fetchReply: true
        });

        const filter = (i: ButtonInteraction) => {
            const otherCustomIds = this.otherButtons.map((b) => (b.data as APIButtonComponentWithCustomId).custom_id);

            return i.customId === this.PREV_BUTTON_ID || i.customId === this.NEXT_BUTTON_ID || otherCustomIds.includes(i.customId);
        };

        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: this.timeout
        });

        collector.on("collect", async (collectedInter: ButtonInteraction<"cached" | "raw">) => {
            await collectedInter.deferUpdate();
            if (collectedInter.customId === this.NEXT_BUTTON_ID || collectedInter.customId === this.PREV_BUTTON_ID) {
                if (collectedInter.customId === this.NEXT_BUTTON_ID) {
                    this.pageNum++;
                    this.next.setDisabled(this.pageNum + 1 === this.pages.length);
                    if (this.pageNum > 0) {
                        this.prev.setDisabled(false);
                    }
                } else {
                    this.pageNum--;
                    this.prev.setDisabled(this.pageNum === 0);
                    if (this.pageNum + 1 < this.pages.length) {
                        this.next.setDisabled(false);
                    }
                }

                const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(this.prev, this.next, ...this.otherButtons);

                await collectedInter.editReply({
                    embeds: [this.pages[this.pageNum]],
                    components: [updatedRow]
                });

                collector.resetTimer();
            }

            this.onCollect?.(collector, collectedInter);
        });

        collector.on("end", () => {
            if (!msg) {
                return;
            }

            this.prev.setDisabled(true);
            this.next.setDisabled(true);
            this.otherButtons.forEach((b) => b.setDisabled(true));

            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(this.prev, this.next, ...this.otherButtons);

            msg.edit({
                components: [disabledRow]
            });
        });
    }

    public static createEmbedPages<T>(options: PaginatedTemplateOptions<T>) {
        const { items, perPage, pageRender, itemRender, base } = options;

        const totalPages = Math.ceil(items.length / perPage);
        const pages: EmbedBuilder[] = new Array(totalPages);

        for (let currPage = 0; currPage < totalPages; currPage++) {
            pages[currPage] = EmbedBuilder.from(base ?? new EmbedBuilder());

            pageRender(pages[currPage], currPage);

            const start = currPage * perPage;
            const end = Math.min(items.length, start + perPage);

            for (let i = start; i < end; i++) {
                itemRender(pages[currPage], items[i], currPage);
            }
        }

        return pages;
    }
}
