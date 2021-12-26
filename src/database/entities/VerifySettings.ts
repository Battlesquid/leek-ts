import { Snowflake } from "discord-api-types";
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export default class VerifySettings {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    gid: Snowflake;

    @Column()
    join_ch: Snowflake;

    @Column()
    appr_ch: Snowflake;

    @Column()
    roles: Snowflake[];

    @Column()
    autogreet: boolean;
}