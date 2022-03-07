import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Snowflake } from "discord-api-types";

@Entity()
export default class LogSettings {
    @PrimaryKey({ columnType: "varchar" })
    gid!: Snowflake;

    @Property({ columnType: "varchar", nullable: true })
    t_log_ch: Snowflake | null;

    @Property({ columnType: "varchar", nullable: true })
    i_log_ch: Snowflake | null;

    constructor(gid: Snowflake, t_log_ch: Snowflake | null, i_log_ch: Snowflake | null) {
        this.gid = gid;
        this.t_log_ch = t_log_ch;
        this.i_log_ch = i_log_ch;
    }
}