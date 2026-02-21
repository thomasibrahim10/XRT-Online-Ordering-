"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.uploadAttachment = exports.uploadImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("../../shared/config/env");
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const memoryStorage = multer_1.default.memoryStorage();
// Local disk for attachments when not using Cloudinary. Vercel FS is read-only so we use tmp or skip.
const uploadsDir = process.env.VERCEL
    ? path_1.default.join(process.cwd(), 'tmp', 'uploads')
    : path_1.default.join(process.cwd(), 'uploads');
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
}
catch {
    // mkdir can fail on read-only FS; we fall back to memory/cloudinary below.
}
const useDiskStorage = env_1.env.ATTACHMENT_STORAGE !== 'cloudinary' && !process.env.VERCEL;
const diskStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname) || '.jpg';
        cb(null, `${unique}${ext}`);
    },
});
// Use Cloudinary for attachments when configured; otherwise disk (or memory on Vercel)
const useCloudinaryForAttachments = env_1.env.ATTACHMENT_STORAGE === 'cloudinary' &&
    !!env_1.env.CLOUDINARY_NAME &&
    !!env_1.env.CLOUDINARY_API_KEY &&
    !!env_1.env.CLOUDINARY_API_SECRET;
// Use memory when Cloudinary configured; upload to Cloudinary in controller (avoids multer-storage-cloudinary hanging)
const attachmentStorage = useCloudinaryForAttachments
    ? memoryStorage
    : useDiskStorage
        ? diskStorage
        : memoryStorage;
exports.uploadImage = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
exports.uploadAttachment = (0, multer_1.default)({
    storage: attachmentStorage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// CSV imports only: keep in memory
const importFileFilter = (req, file, cb) => {
    // Allow CSV files only
    if (file.mimetype === 'text/csv' ||
        file.mimetype === 'application/csv' ||
        file.originalname.endsWith('.csv')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only CSV files are allowed for imports'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: importFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for imports
    },
});
