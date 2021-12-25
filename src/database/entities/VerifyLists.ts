import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

class VerifyEntry {
    @Column()
    id: string;

    @Column()
    nick: string;
}

@Entity()
export default class VerifyList {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column({ comment: "Server (Guild) ID" })
    gid: string;

    @Column('jsonb')
    list: VerifyEntry[];
}