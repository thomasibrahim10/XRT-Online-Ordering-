
const fs = require('fs');
const path = require('path');

const MODELS_DIR = path.join(__dirname, '../src/infrastructure/database/models');
const SCHEMAS_DIR = path.join(__dirname, '../src/swagger/components/schemas');

function getModelFields(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fields = new Set();

    // Find "new Schema({"
    const schemaStartRegex = /new\s+Schema\s*<\s*[\w\d_]+\s*>\s*\(\s*{/g;
    let match = schemaStartRegex.exec(content);

    // Fallback for non-generic Schema
    if (!match) {
        const simpleRegex = /new\s+Schema\s*\(\s*{/g;
        match = simpleRegex.exec(content);
    }

    if (!match) return [];

    const startIndex = match.index + match[0].length - 1; // pointing to {

    // Extract the object block
    let braceCount = 0;
    let endIndex = startIndex;
    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') braceCount--;

        if (braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }

    const inner = content.substring(startIndex, endIndex);

    // Now simplified regex on the inner block to find top-level keys
    // Valid keys are "key: " where key is at depth 1
    // We can't easily parse nesting with regex alone, but we can try to match "key:"
    // provided it's not inside another braces.

    let depth = 0;
    let lastIndex = 0;
    for (let i = 0; i < inner.length; i++) {
        if (inner[i] === '{') depth++;
        else if (inner[i] === '}') depth--;

        if (depth === 1) { // We are inside the main object, looking for keys
            // Look for "key:" sequence
            // We'll scan char by char, but that's tedious in JS.
            // Alternative: Remove all nested blocks { ... } and [ ... ] 
            // then regex the remaining string.
        }
    }

    // Cheating: Remove nested braces to flatten structure roughly
    function removeNested(str) {
        let result = '';
        let lvl = 0;
        for (let char of str) {
            if (char === '{') {
                if (lvl === 0) result += '{';
                lvl++;
            } else if (char === '}') {
                lvl--;
                if (lvl === 0) result += '}';
            } else {
                if (lvl <= 1) result += char;
            }
        }
        return result;
    }

    const flattened = removeNested(inner);
    const keyRegex = /^\s*(\w+):/gm;
    let m;
    while ((m = keyRegex.exec(flattened)) !== null) {
        if (!['type', 'required', 'default', 'unique', 'index', 'enum', 'lowercase', 'trim', 'validate', 'min', 'max', 'select', 'match'].includes(m[1])) {
            fields.add(m[1]);
        }
    }

    return Array.from(fields);
}

function getSchemaProperties(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fields = new Set();

    // Look for properties: { ... }
    const propsMatch = content.match(/properties:\s*{/);
    if (!propsMatch) return [];

    const startIndex = propsMatch.index + propsMatch[0].length - 1; // pointing to {

    let braceCount = 0;
    let endIndex = startIndex;

    for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') braceCount++;
        else if (content[i] === '}') braceCount--;

        if (braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }

    const inner = content.substring(startIndex, endIndex);
    // Same flattening trick
    function removeNested(str) {
        let result = '';
        let lvl = 0;
        for (let char of str) {
            if (char === '{') {
                if (lvl === 0) result += '{';
                lvl++;
            } else if (char === '}') {
                lvl--;
                if (lvl === 0) result += '}';
            } else {
                if (lvl <= 1) result += char;
            }
        }
        return result;
    }

    const flattened = removeNested(inner);
    const keyRegex = /^\s*(\w+):/gm;
    let m;
    while ((m = keyRegex.exec(flattened)) !== null) {
        fields.add(m[1]);
    }

    return Array.from(fields);
}

const modelFiles = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.ts'));

console.log('--- Comparison Report ---');

modelFiles.forEach(modelFile => {
    const modelName = modelFile.replace('Model.ts', '');
    const schemaFile = `${modelName}.schema.ts`;
    const schemaPath = path.join(SCHEMAS_DIR, schemaFile);

    if (!fs.existsSync(schemaPath)) {
        console.log(`\n[MISSING SCHEMA] ${modelName}`);
        return;
    }

    const modelFields = getModelFields(path.join(MODELS_DIR, modelFile));
    const schemaProps = getSchemaProperties(schemaPath);
    const schemaPropSet = new Set(schemaProps);

    const missingInSchema = modelFields.filter(f => !schemaPropSet.has(f));

    const ignored = new Set(['timestamps', 'toJSON', 'toObject', '__v', 'password', 'loginAttempts', 'lockUntil', 'passwordChangedAt', 'passwordResetToken', 'passwordResetExpires', 'refreshToken', 'refreshTokenExpires', 'twoFactorSecret']);
    const relevantMissing = missingInSchema.filter(f => !ignored.has(f));

    if (relevantMissing.length > 0) {
        console.log(`\n[${modelName}] Missing in Schema:`);
        relevantMissing.forEach(f => console.log(`  - ${f}`));
    }
});
