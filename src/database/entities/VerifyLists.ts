import { Snowflake } from "discord-api-types";
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

class VerifyEntry {
    @Column()
    id: Snowflake;

    @Column()
    nick: string;
}

@Entity()
export default class VerifyList {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ comment: "Server (Guild) ID" })
    gid: Snowflake;

    @Column('jsonb')
    list: VerifyEntry[];
}