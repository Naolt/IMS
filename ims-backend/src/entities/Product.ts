import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { Variant } from './Variant';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    @Index()
    code: string;

    @Column()
    name: string;

    @Column()
    @Index()
    category: string;

    @Column({ nullable: true })
    @Index()
    brand?: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @OneToMany(() => Variant, (variant) => variant.product, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    variants: Variant[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
