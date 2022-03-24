import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Snowflake } from "discord-api-types";

@Entity()
export default class ChannelSettings {
    @PrimaryKey({ columnType: "varchar" })
    gid!: Snowflake;

    @Property()
    media_only: Snowflake[];

    constructor(gid: Snowflake, media_only_chs: Snowflake[]) {
        this.gid = gid;
        this.media_only = media_only_chs;
    }
}
