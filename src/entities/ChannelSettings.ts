import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Snowflake } from "discord.js";

@Entity()
export default class ChannelSettings {
    @PrimaryKey({ columnType: "varchar" })
    gid!: Snowflake;

    @Property()
    media_only: Snowflake[];

    @Property()
    exempted_roles: Snowflake[];

    constructor(gid: Snowflake, media_only_chs: Snowflake[], exempted_roles: Snowflake[]) {
        this.gid = gid;
        this.media_only = media_only_chs;
        this.exempted_roles = exempted_roles;
    }
}
