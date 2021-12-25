import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export default class LogSettings {
    @ObjectIdColumn()
    _id: ObjectID;

    @Column()
    gid: string;

    @Column({ nullable: true })
    t_log_ch?: string | null;

    @Column({ nullable: true })
    i_log_ch?: string | null;
}