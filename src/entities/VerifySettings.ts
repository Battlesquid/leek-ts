import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Snowflake } from "discord-api-types";

@Entity()
export default class VerifySettings {

    @PrimaryKey({ columnType: "varchar" })
    gid!: Snowflake;

    @Property({ columnType: "varchar" })
    join_ch: Snowflake;

    @Property()
    roles: Snowflake[];

    @Property({ columnType: "varchar", nullable: true })
    notif_ch: Snowflake | null;

    @Property({ columnType: "boolean", default: false })
    autogreet: boolean;

    constructor(gid: Snowflake, join_ch: Snowflake, roles: Snowflake[], notif_ch?: Snowflake | null, autogreet?: boolean) {
        this.gid = gid;
        this.join_ch = join_ch;
        this.notif_ch = notif_ch ?? null;
        this.roles = roles;
        this.autogreet = autogreet ?? false;
    }
}