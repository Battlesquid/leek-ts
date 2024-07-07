import { chunk } from "@sapphire/utilities";
import {
    ActionRowBuilder,
    APIButtonComponentWithCustomId,
    bold,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    InteractionCollector,
    Message,
    ReadonlyCollection
} from "discord.js";

export type OnCollectCallback = (collector: InteractionCollector<ButtonInteraction>, inter: ButtonInteraction) => Promise<void> | void;

export type OnEndCallback = (collection: ReadonlyCollection<string, ButtonInteraction>) => Promise<void> | void;

export type PaginatedEmbedFormatter<T> = (item: T, index: number) => string;

export type PaginatedEmbedOptions<T> = {
    inter: CommandInteraction;
    title: string;
    useLargeTitle?: boolean;
    template?: EmbedBuilder;
    items: T[];
    itemsPerPage?: number;
    formatter: PaginatedEmbedFormatter<T>;
    prev?: ButtonBuilder;
    next?: ButtonBuilder;
    actions?: ButtonBuilder[];
    timeout: number;
    onCollect?: OnCollectCallback;
    onEnd?: OnEndCallback;
};

export type PaginatedTemplateOptions<T> = {
    items: T[];
    perPage: number;
    pageFormatter: (page: EmbedBuilder, currPage: number) => void;
    itemFormatter: (page: EmbedBuilder, data: T, currPage: number) => void;
    base?: EmbedBuilder;
};

export default class PaginatedEmbed<T> {
    private inter: CommandInteraction;
    private title: string;
    private useLargeTitle: boolean;
    private template: EmbedBuilder;
    private items: T[];
    private formatter: PaginatedEmbedFormatter<T>;
    private itemsPerPage: number;
    private pages: EmbedBuilder[];
    private timeout: number;
    private prev: ButtonBuilder;
    private next: ButtonBuilder;
    private actions: ButtonBuilder[];
    private currPage = 0;
    private readonly NEXT_BUTTON_ID = "@leekbot/next";
    private readonly PREV_BUTTON_ID = "@leekbot/prev";

    private onCollect?: OnCollectCallback;
    private onEnd?: OnEndCallback;

    private defaultPrev = new ButtonBuilder().setCustomId("prev").setEmoji("⬅️").setStyle(ButtonStyle.Primary);

    private defaultNext = new ButtonBuilder().setCustomId("next").setEmoji("➡️").setStyle(ButtonStyle.Primary);

    constructor(options: PaginatedEmbedOptions<T>) {
        this.inter = options.inter;

        this.title = options.title;
        this.items = options.items;
        this.useLargeTitle = options.useLargeTitle ?? false;
        this.itemsPerPage = options.itemsPerPage ?? 5;
        this.pages = [];
        this.timeout = options.timeout;
        this.template = options.template ?? new EmbedBuilder();
        this.formatter = options.formatter;

        this.prev = options.prev ?? this.defaultPrev;
        this.prev.setCustomId(this.PREV_BUTTON_ID);

        this.next = options.next ?? this.defaultNext;
        this.next.setCustomId(this.NEXT_BUTTON_ID);

        this.actions = options.actions ?? [];

        this.onCollect = options.onCollect;
        this.onEnd = options.onEnd;

        this.build();
    }

    private build() {
        const formattedItems = this.items.map(this.formatter);
        const pages = chunk(formattedItems, this.itemsPerPage);
        const embeds = pages.map((items, index) => {
            const smallTitle = this.useLargeTitle ? "" : `${bold(this.title)}\n`;
            const embed = EmbedBuilder.from(this.template)
                .setDescription(`${smallTitle}${items.join("\n")}`)
                .setFooter({ text: `Page ${index + 1} / ${pages.length}` });
            if (this.useLargeTitle) {
                embed.setTitle(this.title);
            }
            return embed;
        });
        this.pages.push(...embeds);
    }

    private validate() {
        if (this.actions.length > 3) {
            throw Error("More than 3 other buttons have been given.");
        }
        if (this.next.data.style === ButtonStyle.Link || this.prev.data.style === ButtonStyle.Link) {
            throw Error("Link buttons cannot be used as prev/next buttons");
        }
    }

    public async send() {
        this.validate();
        this.prev.setDisabled(true);
        if (this.currPage + 1 === this.pages.length) {
            this.next.setDisabled(true);
        }

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(this.prev, this.next, ...this.actions);

        const msg = (await this.inter.reply({
            embeds: [this.pages[this.currPage]],
            components: [row],
            fetchReply: true
        })) as Message;

        const filter = (i: ButtonInteraction) => {
            const otherCustomIds = this.actions.map((b) => (b.data as APIButtonComponentWithCustomId).custom_id);

            return i.customId === this.PREV_BUTTON_ID || i.customId === this.NEXT_BUTTON_ID || otherCustomIds.includes(i.customId);
        };

        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: this.timeout
        });

        collector.on("collect", async (inter) => {
            await inter.deferUpdate();
            if (inter.customId === this.NEXT_BUTTON_ID || inter.customId === this.PREV_BUTTON_ID) {
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

                const updatedRow = new ActionRowBuilder<ButtonBuilder>().addComponents(this.prev, this.next, ...this.actions);

                inter.editReply({
                    embeds: [this.pages[this.currPage]],
                    components: [updatedRow]
                });

                collector.resetTimer();
            }

            this.onCollect?.(collector, inter);
        });

        collector.on("end", (collected) => {
            if (!msg) {
                return;
            }
            this.prev.setDisabled(true);
            this.next.setDisabled(true);
            this.actions.forEach((b) => b.setDisabled(true));

            const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(this.prev, this.next, ...this.actions);

            msg.edit({ components: [disabledRow] });

            this.onEnd?.(collected);
        });
    }
}
