import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Hotel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Generated('uuid')
    hotelUid: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 80 })
    country: string;

    @Column({ type: 'varchar', length: 80 })
    city: string;

    @Column({ type: 'varchar', length: 255 })
    address: string;

    @Column({ type: 'int', nullable: true })
    stars: number;

    @Column({ type: 'int' })
    price: number;

    @Column({ type: 'int', default: 5 })
    capacity: number;
}