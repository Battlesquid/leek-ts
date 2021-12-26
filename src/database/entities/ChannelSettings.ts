import { Snowflake } from "discord-api-types";
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export default class ChannelSettings {
    @ObjectIdColumn()
    _id: ObjectID

    @Column()
    gid: string;

    @Column()
    txt_disabled: Snowflake[]
}