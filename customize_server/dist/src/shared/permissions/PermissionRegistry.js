"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRegistry = void 0;
const PermissionRepository_1 = require("../../infrastructure/repositories/PermissionRepository");
const permissionDefinitions_1 = require("./permissionDefinitions");
/** Syncs permission definitions from code to DB on startup; never deletes existing. */
class PermissionRegistry {
    constructor() {
        this.registeredPermissions = new Map();
        this.synced = false;
        this.permissionRepository = new PermissionRepository_1.PermissionRepository();
        // Pre-register all defined permissions
        for (const perm of permissionDefinitions_1.PERMISSION_DEFINITIONS) {
            this.registeredPermissions.set(perm.key, perm);
        }
    }
    getAll() {
        return Array.from(this.registeredPermissions.values());
    }
    isRegistered(key) {
        return this.registeredPermissions.has(key);
    }
    get(key) {
        return this.registeredPermissions.get(key);
    }
    /** In-memory only; not persisted to DB. */
    register(permission) {
        if (!this.registeredPermissions.has(permission.key)) {
            this.registeredPermissions.set(permission.key, permission);
        }
    }
    /** Insert new permissions; never delete or change existing. New ones default disabled. */
    async syncWithDatabase() {
        const permissionDTOs = (0, permissionDefinitions_1.getPermissionDTOs)();
        const result = await this.permissionRepository.upsertMany(permissionDTOs);
        this.synced = true;
        return {
            inserted: result.inserted,
            skipped: result.skipped,
            total: permissionDTOs.length,
        };
    }
    isSynced() {
        return this.synced;
    }
    getByModule() {
        const grouped = {};
        for (const perm of this.registeredPermissions.values()) {
            if (!grouped[perm.module]) {
                grouped[perm.module] = [];
            }
            grouped[perm.module].push(perm);
        }
        return grouped;
    }
    validatePermissionKeys(keys) {
        const invalid = [];
        for (const key of keys) {
            if (!this.registeredPermissions.has(key)) {
                invalid.push(key);
            }
        }
        return {
            valid: invalid.length === 0,
            invalid,
        };
    }
    getSystemPermissionKeys() {
        return Array.from(this.registeredPermissions.values())
            .filter((p) => p.isSystem)
            .map((p) => p.key);
    }
    isSystemPermission(key) {
        const perm = this.registeredPermissions.get(key);
        return perm?.isSystem ?? false;
    }
}
// Singleton instance
exports.permissionRegistry = new PermissionRegistry();
