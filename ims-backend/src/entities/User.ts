import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Sale } from './Sale';

export enum UserRole {
    ADMIN = 'ADMIN',
    STAFF = 'STAFF',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @Column({
        type: 'simple-enum',
        enum: UserRole,
        default: UserRole.STAFF,
    })
    role: UserRole;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ nullable: true, unique: true })
    verificationToken?: string;

    @Column({ nullable: true, unique: true })
    resetPasswordToken?: string;

    @Column({ type: 'datetime', nullable: true })
    resetPasswordExpires?: Date;

    @Column({
        type: 'simple-enum',
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @OneToMany(() => Sale, (sale) => sale.user)
    sales: Sale[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
