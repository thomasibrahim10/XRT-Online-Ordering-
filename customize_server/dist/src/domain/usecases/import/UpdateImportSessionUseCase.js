"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateImportSessionUseCase = void 0;
const ImportValidationService_1 = require("../../../shared/services/ImportValidationService");
class UpdateImportSessionUseCase {
    constructor(importSessionRepository) {
        this.importSessionRepository = importSessionRepository;
    }
    async execute(sessionId, user_id, data) {
        const session = await this.importSessionRepository.findById(sessionId, user_id);
        if (!session) {
            throw new Error('Import session not found');
        }
        // If parsedData is being updated, re-validate
        if (data.parsedData) {
            const parsedData = data.parsedData;
            if (typeof parsedData !== 'object' || parsedData === null) {
                throw new Error('Invalid parsedData: must be an object');
            }
            const validation = ImportValidationService_1.ImportValidationService.validate(parsedData, session.business_id, (session.originalFiles && session.originalFiles[0]) || 'import.csv');
            data.validationErrors = validation.errors;
            data.validationWarnings = validation.warnings;
            // Update status based on validation
            if (validation.errors.length > 0) {
                data.status = 'draft';
            }
            else {
                data.status = 'validated';
            }
        }
        return await this.importSessionRepository.update(sessionId, user_id, data);
    }
}
exports.UpdateImportSessionUseCase = UpdateImportSessionUseCase;
