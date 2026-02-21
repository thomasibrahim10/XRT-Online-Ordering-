"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const connection_1 = require("./infrastructure/database/connection");
const middlewares_1 = require("./application/middlewares");
const auth_routes_1 = __importDefault(require("./application/routes/auth.routes"));
const business_routes_1 = __importDefault(require("./application/routes/business.routes"));
const category_routes_1 = __importDefault(require("./application/routes/category.routes"));
const settings_routes_1 = __importDefault(require("./application/routes/settings.routes"));
const public_routes_1 = __importDefault(require("./application/routes/public.routes"));
const role_routes_1 = __importDefault(require("./application/routes/role.routes"));
const attachment_routes_1 = __importDefault(require("./application/routes/attachment.routes"));
const item_routes_1 = __importDefault(require("./application/routes/item.routes"));
const customer_routes_1 = __importDefault(require("./application/routes/customer.routes"));
const mock_routes_1 = __importDefault(require("./application/routes/mock.routes"));
const modifier_group_routes_1 = __importDefault(require("./application/routes/modifier-group.routes"));
const modifier_routes_1 = __importDefault(require("./application/routes/modifier.routes"));
const item_size_routes_1 = __importDefault(require("./application/routes/item-size.routes"));
const import_routes_1 = __importDefault(require("./application/routes/import.routes"));
const permission_routes_1 = __importDefault(require("./application/routes/permission.routes"));
const price_routes_1 = __importDefault(require("./application/routes/price.routes"));
const kitchen_section_routes_1 = __importDefault(require("./application/routes/kitchen-section.routes"));
const tax_routes_1 = __importDefault(require("./application/routes/tax.routes"));
const shipping_routes_1 = __importDefault(require("./application/routes/shipping.routes"));
const coupon_routes_1 = __importDefault(require("./application/routes/coupon.routes"));
const testimonial_routes_1 = __importDefault(require("./application/routes/testimonial.routes"));
const order_routes_1 = __importDefault(require("./application/routes/order.routes"));
const env_1 = require("./shared/config/env");
const logger_1 = require("./shared/utils/logger");
// Import swagger config - using relative path from src to config directory
const swagger_1 = require("./swagger");
const app = (0, express_1.default)();
// Trigger restart for helmet config change
// Database connection
// Database connection will be established in startServer function
// Global middlewares
// Skip body parsing for any route that accepts multipart/form-data so Multer gets the raw stream (otherwise upload hangs)
const skipBodyParsing = (req) => req.path.startsWith('/attachments') ||
    req.originalUrl.includes('/attachments') ||
    req.path.startsWith('/import') ||
    req.originalUrl.includes('/import') ||
    req.path.startsWith('/items') ||
    req.originalUrl.includes('/items') ||
    req.path.startsWith('/categories') ||
    req.originalUrl.includes('/categories');
app.use((req, res, next) => {
    if (skipBodyParsing(req)) {
        return next();
    }
    express_1.default.json({ limit: '10mb' })(req, res, next);
});
app.use((req, res, next) => {
    if (skipBodyParsing(req)) {
        return next();
    }
    express_1.default.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});
app.use((0, cookie_parser_1.default)());
app.use(middlewares_1.corsMiddleware);
app.use(middlewares_1.securityMiddleware);
app.use(middlewares_1.compressionMiddleware);
app.use(middlewares_1.rateLimitMiddleware);
app.use(middlewares_1.requestLogger);
// Serve uploaded files (when using disk storage for attachments)
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'XRT Customized System API',
        version: '1.0.0',
        endpoints: {
            auth: `${env_1.env.API_BASE_URL}/auth`,
            businesses: `${env_1.env.API_BASE_URL}/businesses`,
            categories: `${env_1.env.API_BASE_URL}/categories`,
            items: `${env_1.env.API_BASE_URL}/items`,
            itemSizes: `${env_1.env.API_BASE_URL}/items/{itemId}/sizes`,
            modifierGroups: `${env_1.env.API_BASE_URL}/modifier-groups`,
            modifiers: `${env_1.env.API_BASE_URL}/modifier-groups/{groupId}/modifiers`,
            settings: `${env_1.env.API_BASE_URL}/settings`,
        },
        documentation: {
            swagger: '/api-docs',
            openApi: '/api-docs.json',
        },
        timestamp: new Date().toISOString(),
    });
});
// API Documentation (Swagger)
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'XRT API Documentation',
}));
// OpenAPI JSON spec
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swagger_1.specs);
});
// Middleware to ensure database connection in serverless environment
app.use(async (req, res, next) => {
    if (process.env.VERCEL) {
        try {
            await (0, connection_1.connectDatabase)();
            next();
        }
        catch (error) {
            logger_1.logger.error('Database connection failed in middleware:', error);
            res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: process.env.NODE_ENV === 'development' ? error : undefined,
            });
            return; // Ensure no further processing
        }
    }
    else {
        next();
    }
});
// API Routes
app.use(`${env_1.env.API_BASE_URL}/auth`, auth_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/businesses`, business_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/categories`, category_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/settings`, settings_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/public`, public_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/roles`, role_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/permissions`, permission_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/attachments`, (req, res, next) => {
    next();
}, attachment_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/items`, item_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/sizes`, item_size_routes_1.default); // Nested routes for item sizes
app.use(`${env_1.env.API_BASE_URL}/customers`, customer_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/modifier-groups`, modifier_group_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/import`, import_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/kitchen-sections`, kitchen_section_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}`, modifier_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/prices`, price_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}`, mock_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/taxes`, tax_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/shippings`, shipping_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/coupons`, coupon_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/testimonials`, testimonial_routes_1.default);
app.use(`${env_1.env.API_BASE_URL}/orders`, order_routes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});
// Error handler (must be last)
app.use(middlewares_1.errorHandler);
let server;
// Middleware to ensure database connection in serverless environment
const startServer = async () => {
    try {
        await (0, connection_1.connectDatabase)();
        // Start server only if not running on Vercel
        // In Vercel, the app is exported and handled by the platform
        if (!process.env.VERCEL) {
            const PORT = env_1.env.PORT;
            server = app.listen(PORT, () => {
                logger_1.logger.info(`🚀 Server running on port ${PORT}`);
                logger_1.logger.info(`📝 Environment: ${env_1.env.NODE_ENV}`);
                logger_1.logger.info(`📡 API available at http://localhost:${PORT}${env_1.env.API_BASE_URL}`);
                if (env_1.env.ATTACHMENT_STORAGE === 'cloudinary' && env_1.env.CLOUDINARY_NAME) {
                    logger_1.logger.info(`☁️ Image uploads: Cloudinary (${env_1.env.CLOUDINARY_NAME})`);
                }
                else {
                    logger_1.logger.info(`📁 Image uploads: disk (set CLOUDINARY_* + ATTACHMENT_STORAGE=cloudinary for Cloudinary)`);
                }
            });
            // Handle port already in use error
            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    logger_1.logger.error(`❌ Port ${PORT} is already in use!`);
                    logger_1.logger.error(`💡 To fix this, run: lsof -ti:${PORT} | xargs kill -9`);
                    logger_1.logger.error(`   Or manually kill the process using port ${PORT}`);
                    process.exit(1);
                }
                else {
                    logger_1.logger.error(`❌ Server error: ${err.message}`);
                    throw err;
                }
            });
        }
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        // Only exit in standard environment, not Vercel
        if (!process.env.VERCEL) {
            process.exit(1);
        }
    }
};
if (!process.env.VERCEL) {
    startServer();
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('UNHANDLED REJECTION! 💥');
    logger_1.logger.error(`Error: ${err.name} - ${err.message}`);
    // Do not exit process in serverless environment
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error('UNCAUGHT EXCEPTION! 💥');
    logger_1.logger.error(`Error: ${err.name} - ${err.message}`);
    // Do not exit process in serverless environment
});
exports.default = app;
