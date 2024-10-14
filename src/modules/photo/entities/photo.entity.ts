import { Entity, Column, ObjectIdColumn, ObjectId } from 'typeorm';

type PhotoType = 'product' | 'shop';

export abstract class Photo {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'bytea' })
  image: Buffer;

  type: PhotoType;
}

@Entity('product')
export class ProductPhoto extends Photo {}

@Entity('shop')
export class ShopPhoto extends Photo {}
