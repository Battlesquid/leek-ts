import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export default class VerifySettings {

    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    gid: string;

    @Column()
    join_ch: string;

    @Column()
    appr_ch: string;

    @Column()
    roles: string[];

    @Column()
    autogreet: boolean;
}