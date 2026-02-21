"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const asyncHandler_1 = require("../../shared/utils/asyncHandler");
const response_1 = require("../../shared/utils/response");
const env_1 = require("../../shared/config/env");
const logger_1 = require("../../shared/utils/logger");
const CloudinaryStorage_1 = require("../../infrastructure/cloudinary/CloudinaryStorage");
/** Normalize req.files to an array (multer .any() returns array; some typings use object). */
function normalizeFiles(req) {
    const raw = req.files;
    if (!raw)
        return [];
    if (Array.isArray(raw))
        return raw;
    if (typeof raw === 'object') {
        const list = [];
        Object.values(raw).forEach((v) => {
            if (Array.isArray(v))
                list.push(...v);
            else if (v && typeof v === 'object' && v.originalname)
                list.push(v);
        });
        return list;
    }
    return [];
}
function getBaseUrl(req) {
    const fromEnv = env_1.env.PUBLIC_ORIGIN;
    if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
        return fromEnv.trim().replace(/\/$/, '');
    }
    return `${req.protocol}://${req.get('host') || ''}`.replace(/\/$/, '');
}
const useCloudinary = env_1.env.ATTACHMENT_STORAGE === 'cloudinary' &&
    !!env_1.env.CLOUDINARY_NAME &&
    !!env_1.env.CLOUDINARY_API_KEY &&
    !!env_1.env.CLOUDINARY_API_SECRET;
class AttachmentController {
    constructor() {
        this.imageStorage = new CloudinaryStorage_1.CloudinaryStorage();
        this.upload = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const files = normalizeFiles(req);
            logger_1.logger.info('AttachmentController.upload: files count =', files.length);
            if (files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded. Make sure you selected an image (max 5MB).',
                });
            }
            const baseUrl = getBaseUrl(req);
            if (useCloudinary) {
                const attachments = [];
                for (const file of files) {
                    const result = await this.imageStorage.uploadImage(file, 'xrttech/attachments');
                    attachments.push({
                        id: result.public_id,
                        thumbnail: result.secure_url,
                        original: result.secure_url,
                        file_name: file.originalname,
                    });
                }
                logger_1.logger.info('AttachmentController.upload: returning', attachments.length, 'attachments (Cloudinary)');
                return (0, response_1.sendSuccess)(res, 'Files uploaded successfully', attachments);
            }
            const attachments = files.map((file) => {
                let url = file.secure_url || file.url || file.path;
                if (url && typeof url === 'string' && !url.startsWith('http')) {
                    url = `${baseUrl}/uploads/${file.filename || file.originalname}`;
                }
                const imageUrl = url || '';
                const publicId = file.public_id || file.filename || file.originalname;
                return {
                    id: publicId,
                    thumbnail: imageUrl,
                    original: imageUrl,
                    file_name: file.originalname,
                };
            });
            logger_1.logger.info('AttachmentController.upload: returning', attachments.length, 'attachments');
            return (0, response_1.sendSuccess)(res, 'Files uploaded successfully', attachments);
        });
    }
}
exports.AttachmentController = AttachmentController;
