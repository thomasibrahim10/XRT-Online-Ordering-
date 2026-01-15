
import { specs } from '../src/swagger';

console.log('Swagger Spec Loaded Successfully');
console.log('Title:', specs.info.title);
console.log('Version:', specs.info.version);
console.log('Path Count:', Object.keys(specs.paths).length);
console.log('Schema Count:', Object.keys(specs.components.schemas).length);

if (Object.keys(specs.paths).length === 0) {
    console.error('ERROR: No paths found!');
    process.exit(1);
}
if (Object.keys(specs.components.schemas).length === 0) {
    console.error('ERROR: No schemas found!');
    process.exit(1);
}
