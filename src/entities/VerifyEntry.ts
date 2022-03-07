import { Entity, PrimaryKey, Property, types } from "@mikro-orm/core";
import { Snowflake } from "discord-api-types";

@Entity()
export default class VerifyEntry {
    @PrimaryKey()
    id!: number

    @Property({ columnType: "varchar" })
    gid!: Snowflake;

    @Property({ columnType: "varchar" })
    uid: Snowflake;

    @Property({ columnType: "varchar(32)" })
    nick: string;

    constructor(gid: Snowflake, uid: Snowflake, nick: string) {
        this.gid = gid;
        this.uid = uid;
        this.nick = nick;
    }
}