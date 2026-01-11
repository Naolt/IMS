import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
    Unique,
} from 'typeorm';
import { Product } from './Product';
import { Sale } from './Sale';

@Entity('variants')
@Unique(['product', 'size', 'color'])
export class Variant {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Product, (product) => product.variants, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'productId' })
    @Index()
    product: Product;

    @Column()
    productId: string;

    @Column()
    size: string;

    @Column()
    color: string;

    @Column({ default: 0 })
    @Index()
    stockQuantity: number;

    @Column({ default: 0 })
    minStockQuantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    buyingPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    sellingPrice: number;

    @OneToMany(() => Sale, (sale) => sale.variant)
    sales: Sale[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
