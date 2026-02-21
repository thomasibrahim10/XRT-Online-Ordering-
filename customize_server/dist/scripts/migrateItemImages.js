"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const connection_1 = require("../src/infrastructure/database/connection");
const ItemModel_1 = require("../src/infrastructure/database/models/ItemModel");
const env_1 = require("../src/shared/config/env");
async function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs_1.default.createWriteStream(destPath);
        https_1.default
            .get(url, (response) => {
            if (response.statusCode !== 200) {
                file.close();
                fs_1.default.unlink(destPath, () => {
                    reject(new Error(`Failed to download ${url}. Status code: ${response.statusCode}`));
                });
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        })
            .on('error', (err) => {
            file.close();
            fs_1.default.unlink(destPath, () => {
                reject(err);
            });
        });
    });
}
function getUploadsBaseUrl() {
    // Public base URL where uploads are served from customize_server
    // Default: http://localhost:<PORT>
    const port = env_1.env.PORT || 3001;
    const host = process.env.UPLOADS_BASE_URL ||
        `http://localhost:${port}`;
    return host.replace(/\/$/, '');
}
async function migrateItemImages() {
    try {
        console.log('Connecting to database...');
        await (0, connection_1.connectDatabase)();
        console.log('✅ Connected to MongoDB');
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        const uploadsBaseUrl = getUploadsBaseUrl();
        const cloudinaryRegex = /res\.cloudinary\.com/i;
        const items = await ItemModel_1.ItemModel.find({
            $or: [
                { image: cloudinaryRegex },
                { image: /^\/uploads\//i }, // previously migrated as relative paths
            ],
        });
        if (!items.length) {
            console.log('No items found needing image migration. Nothing to do.');
            return;
        }
        console.log(`Found ${items.length} items with Cloudinary or relative /uploads images. Starting migration...`);
        for (const item of items) {
            const imageUrl = item.image;
            if (!imageUrl)
                continue;
            // Case 1: relative /uploads path -> just normalize to absolute URL
            if (imageUrl.startsWith('/uploads/')) {
                const filename = imageUrl.split('/').pop() || imageUrl.replace('/uploads/', '');
                item.image = `${uploadsBaseUrl}/uploads/${filename}`;
                item.image_public_id = filename;
                await item.save();
                console.log(`✅ Normalized item ${item._id} image to ${uploadsBaseUrl}/uploads/${filename}`);
                continue;
            }
            // Case 2: Cloudinary URL -> download then point to local uploads URL
            if (cloudinaryRegex.test(imageUrl)) {
                try {
                    const urlObj = new URL(imageUrl);
                    const urlPath = urlObj.pathname || '';
                    const urlName = urlPath.split('/').pop() || '';
                    const urlExt = path_1.default.extname(urlName) || '.jpg';
                    const publicId = item.image_public_id ||
                        urlName.replace(urlExt, '') ||
                        item._id.toString();
                    const safeBase = publicId.split('/').pop() || publicId;
                    const filename = `${safeBase}${urlExt}`;
                    const destPath = path_1.default.join(uploadsDir, filename);
                    console.log(`➡️  Migrating item ${item._id} image from Cloudinary to ${destPath}`);
                    // Download the image to local uploads folder
                    await downloadImage(imageUrl, destPath);
                    item.image = `${uploadsBaseUrl}/uploads/${filename}`;
                    item.image_public_id = filename;
                    await item.save();
                    console.log(`✅ Migrated item ${item._id} image to ${uploadsBaseUrl}/uploads/${filename}`);
                }
                catch (err) {
                    console.error(`❌ Failed to migrate image for item ${item._id}:`, err);
                }
            }
        }
        console.log('🎉 Item image migration completed.');
    }
    catch (error) {
        console.error('❌ Error during item image migration:', error);
    }
    finally {
        const mongoose = await Promise.resolve().then(() => __importStar(require('mongoose')));
        await mongoose.default.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
}
migrateItemImages();
