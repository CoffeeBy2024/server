import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity()
export class Photo {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'bytea' })
  image: Buffer;
}
