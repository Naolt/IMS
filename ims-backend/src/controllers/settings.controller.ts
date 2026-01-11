import { Request, Response } from 'express';
import { settingsService } from '../services/settings.service';
import { sendSuccess } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { ValidationError } from '../utils/errors';

/**
 * Get all settings
 * GET /api/settings
 */
export const getAllSettings = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const settings = await settingsService.getSettingsObject();
    sendSuccess(res, 'Settings retrieved successfully', settings);
});

/**
 * Get a specific setting by key
 * GET /api/settings/:key
 */
export const getSetting = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;
    const setting = await settingsService.getSetting(key);

    if (!setting) {
        throw new ValidationError(`Setting with key "${key}" not found`);
    }

    sendSuccess(res, 'Setting retrieved successfully', setting);
});

/**
 * Update a setting
 * PUT /api/settings/:key
 */
export const updateSetting = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined || value === null) {
        throw new ValidationError('Value is required');
    }

    const setting = await settingsService.setSetting(key, value, description);
    sendSuccess(res, 'Setting updated successfully', setting);
});

/**
 * Update multiple settings
 * POST /api/settings/bulk
 */
export const updateMultipleSettings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
        throw new ValidationError('Settings array is required');
    }

    const updatedSettings = await settingsService.setMultipleSettings(settings);
    sendSuccess(res, 'Settings updated successfully', updatedSettings);
});

/**
 * Delete a setting
 * DELETE /api/settings/:key
 */
export const deleteSetting = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key } = req.params;

    const deleted = await settingsService.deleteSetting(key);

    if (!deleted) {
        throw new ValidationError(`Setting with key "${key}" not found`);
    }

    sendSuccess(res, 'Setting deleted successfully', null);
});
