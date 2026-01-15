
const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '../src/application/routes');
const SWAGGER_DIR = path.join(__dirname, '../src/swagger/modules');
const API_BASE_URL = '/api/v1'; // Hardcoded for simplicity or read from file

const routePrefixes = {
    'auth.routes.ts': '/auth',
    'business.routes.ts': '/businesses',
    'category.routes.ts': '/categories',
    'settings.routes.ts': '/settings',
    'role.routes.ts': '/roles',
    'permission.routes.ts': '/permissions',
    'withdraw.routes.ts': '/withdraws',
    'attachment.routes.ts': '/attachments',
    'item.routes.ts': '/items',
    'item-size.routes.ts': '/sizes',
    'customer.routes.ts': '/customers',
    'modifier-group.routes.ts': '/modifier-groups',
    'import.routes.ts': '/import',
    'modifier.routes.ts': '', // mounted at base
    'mock.routes.ts': ''      // mounted at base
};

function getDefinedRoutes(filename) {
    const filePath = path.join(ROUTES_DIR, filename);
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, 'utf-8');
    const routes = [];

    // Regex for router.verb('path', ...)
    // Note: path might be '/' or '/:id' or '/foo'
    const regex = /router\.(get|post|put|delete|patch)\(\s*['"]([^'"]+)['"]/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
        let routePath = match[2];
        if (routePath === '/') routePath = ''; // Append nothing
        routes.push({
            method: match[1],
            path: routePath
        });
    }
    return routes;
}

function getSwaggerPaths() {
    // We scan all module files and aggregate all paths
    const files = fs.readdirSync(SWAGGER_DIR).filter(f => f.endsWith('.swagger.ts'));
    const paths = new Set();

    files.forEach(f => {
        const content = fs.readFileSync(path.join(SWAGGER_DIR, f), 'utf-8');
        // Simple regex: 'url': {
        const regex = /'([\/a-zA-Z0-9_\-{}]+)':\s*{/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            paths.add(match[1]);
        }
    });
    return paths;
}

const swaggerPaths = getSwaggerPaths();

console.log('--- Route Comparison Report ---');

Object.entries(routePrefixes).forEach(([filename, prefix]) => {
    const routes = getDefinedRoutes(filename);

    routes.forEach(r => {
        // Construct full URL
        // Join with slashes correctly
        let fullPath = `${API_BASE_URL}${prefix}${r.path}`;

        // Express params are :param, Swagger is {param}
        const swaggerStylePath = fullPath.replace(/:(\w+)/g, '{$1}');

        if (!swaggerPaths.has(swaggerStylePath)) {
            console.log(`[MISSING IN SWAGGER] ${r.method.toUpperCase()} ${swaggerStylePath} (from ${filename})`);
        }
    });
});
