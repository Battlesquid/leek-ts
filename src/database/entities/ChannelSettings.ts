import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity()
export default class ChannelSettings {
    @ObjectIdColumn()
    _id: ObjectID

    @Column()
    gid: string;

    @Column()
    txt_disabled: string[]

    @Column()
    img_disabled: string[]
}