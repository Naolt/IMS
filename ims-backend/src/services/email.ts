import { Resend } from 'resend';
import { config } from '../config/env';
import logger from '../config/logger';

const resend = new Resend(config.resendApiKey);

export const sendVerificationEmail = async (
    email: string,
    verificationToken: string
): Promise<void> => {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${verificationToken}`;

    try {
        const { error } = await resend.emails.send({
            from: 'IMS <onboarding@resend.dev>', // Replace with your verified domain
            to: email,
            subject: 'Verify your email address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to IMS!</h2>
                    <p>Please click the link below to verify your email address:</p>
                    <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Verify Email
                    </a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666;">${verificationUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
            `,
        });

        if (error) {
            logger.error('Resend API error:', error);
            throw new Error('Failed to send verification email');
        }
    } catch (error) {
        logger.error('Error sending verification email:', error);
        throw new Error('Failed to send verification email');
    }
};

export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string
): Promise<void> => {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;

    try {
        const { error } = await resend.emails.send({
            from: 'IMS <onboarding@resend.dev>', // Replace with your verified domain
            to: email,
            subject: 'Reset your password',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Password Reset Request</h2>
                    <p>You requested to reset your password. Click the link below to create a new password:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="color: #666;">${resetUrl}</p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `,
        });

        if (error) {
            logger.error('Resend API error:', error);
            throw new Error('Failed to send password reset email');
        }
    } catch (error) {
        logger.error('Error sending password reset email:', error);
        throw new Error('Failed to send password reset email');
    }
};
