import { AppDataSource } from '../config/database';
import { Settings } from '../entities/Settings';

const settingsRepository = AppDataSource.getRepository(Settings);

export const settingsService = {
    // Get a setting by key
    async getSetting(key: string): Promise<Settings | null> {
        return await settingsRepository.findOne({ where: { key } });
    },

    // Get all settings
    async getAllSettings(): Promise<Settings[]> {
        return await settingsRepository.find();
    },

    // Get settings as key-value object
    async getSettingsObject(): Promise<Record<string, string>> {
        const settings = await settingsRepository.find();
        const settingsObject: Record<string, string> = {};
        settings.forEach(setting => {
            settingsObject[setting.key] = setting.value;
        });
        return settingsObject;
    },

    // Update or create a setting
    async setSetting(key: string, value: string, description?: string): Promise<Settings> {
        let setting = await settingsRepository.findOne({ where: { key } });

        if (setting) {
            setting.value = value;
            if (description) {
                setting.description = description;
            }
        } else {
            setting = settingsRepository.create({
                key,
                value,
                description
            });
        }

        return await settingsRepository.save(setting);
    },

    // Update multiple settings at once
    async setMultipleSettings(settings: Array<{ key: string; value: string; description?: string }>): Promise<Settings[]> {
        const updatedSettings: Settings[] = [];

        for (const settingData of settings) {
            const setting = await this.setSetting(
                settingData.key,
                settingData.value,
                settingData.description
            );
            updatedSettings.push(setting);
        }

        return updatedSettings;
    },

    // Delete a setting
    async deleteSetting(key: string): Promise<boolean> {
        const result = await settingsRepository.delete({ key });
        return (result.affected ?? 0) > 0;
    }
};
