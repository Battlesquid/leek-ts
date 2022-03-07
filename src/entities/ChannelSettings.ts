import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Snowflake } from "discord-api-types";

@Entity()
export default class ChannelSettings {
    @PrimaryKey({ columnType: "varchar" })
    gid!: Snowflake;

    @Property({ columnType: "varchar[]" })
    media_only_chs: Snowflake[]

    constructor(gid: Snowflake, media_only_chs: Snowflake[]) {
        this.gid = gid;
        this.media_only_chs = media_only_chs;
    }
}