import { Snowflake } from "discord-api-types";
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export default class LogSettings {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    gid: Snowflake;

    @Column({ nullable: true })
    t_log_ch?: Snowflake | null;

    @Column({ nullable: true })
    i_log_ch?: Snowflake | null;
}