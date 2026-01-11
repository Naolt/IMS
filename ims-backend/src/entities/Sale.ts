import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { Variant } from './Variant';
import { User } from './User';

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Variant, (variant) => variant.sales)
    @JoinColumn({ name: 'variantId' })
    @Index()
    variant: Variant;

    @Column()
    variantId: string;

    @ManyToOne(() => User, (user) => user.sales)
    @JoinColumn({ name: 'userId' })
    @Index()
    user: User;

    @Column()
    userId: string;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    sellingPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;

    @Column({ nullable: true })
    customerName?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    @Index()
    saleDate: Date;

    @CreateDateColumn()
    createdAt: Date;
}
