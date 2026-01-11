import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

const verifyUser = async (email: string) => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });

        if (!user) {
            console.log('❌ User not found');
            process.exit(1);
        }

        user.isVerified = true;
        user.verificationToken = null;
        await userRepository.save(user);

        console.log(`✅ User ${email} verified successfully!`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

const email = process.argv[2] || 'admin@ims.com';
verifyUser(email);
