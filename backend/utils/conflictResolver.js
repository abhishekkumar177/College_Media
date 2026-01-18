/**
 * Conflict Resolver Utility
 * Issue #923: Real-time Collaborative Features
 * 
 * Utilities for resolving conflicts in collaborative editing.
 */

const operationalTransformService = require('../services/operationalTransformService');

class ConflictResolver {

    /**
     * Resolve conflicts between multiple operations
     */
    resolveConflicts(operations) {
        if (operations.length <= 1) {
            return operations;
        }

        // Sort operations by timestamp
        const sorted = operations.sort((a, b) =>
            new Date(a.timestamp) - new Date(b.timestamp)
        );

        const resolved = [sorted[0]];

        // Transform each operation against all previous ones
        for (let i = 1; i < sorted.length; i++) {
            let currentOp = sorted[i].operation;

            // Transform against all previous operations
            for (let j = 0; j < i; j++) {
                const result = operationalTransformService.transform(
                    currentOp,
                    resolved[j].operation
                );
                currentOp = result.op1;
            }

            resolved.push({
                ...sorted[i],
                operation: currentOp
            });
        }

        return resolved;
    }

    /**
     * Detect conflicting operations
     */
    detectConflicts(op1, op2) {
        // Operations conflict if they affect overlapping ranges
        if (op1.type === 'insert' && op2.type === 'insert') {
            return op1.position === op2.position;
        }

        if (op1.type === 'delete' && op2.type === 'delete') {
            const end1 = op1.position + op1.length;
            const end2 = op2.position + op2.length;
            return !(end1 <= op2.position || end2 <= op1.position);
        }

        if (op1.type === 'insert' && op2.type === 'delete') {
            return op1.position >= op2.position &&
                op1.position < op2.position + op2.length;
        }

        if (op1.type === 'delete' && op2.type === 'insert') {
            return op2.position >= op1.position &&
                op2.position < op1.position + op1.length;
        }

        return false;
    }

    /**
     * Merge operations if possible
     */
    mergeOperations(op1, op2) {
        // Merge consecutive inserts
        if (op1.type === 'insert' && op2.type === 'insert' &&
            op1.position + op1.content.length === op2.position) {
            return {
                type: 'insert',
                position: op1.position,
                content: op1.content + op2.content
            };
        }

        // Merge consecutive deletes
        if (op1.type === 'delete' && op2.type === 'delete' &&
            op1.position === op2.position) {
            return {
                type: 'delete',
                position: op1.position,
                length: op1.length + op2.length
            };
        }

        return null;
    }

    /**
     * Optimize operation sequence
     */
    optimizeOperations(operations) {
        if (operations.length === 0) {
            return [];
        }

        const optimized = [operations[0]];

        for (let i = 1; i < operations.length; i++) {
            const last = optimized[optimized.length - 1];
            const current = operations[i];

            // Try to merge with last operation
            const merged = this.mergeOperations(last, current);

            if (merged) {
                optimized[optimized.length - 1] = merged;
            } else {
                optimized.push(current);
            }
        }

        return optimized;
    }

    /**
     * Calculate operation priority
     */
    calculatePriority(operation, context = {}) {
        let priority = 0;

        // Higher priority for operations from session owner
        if (context.isOwner) {
            priority += 10;
        }

        // Higher priority for newer operations
        const age = Date.now() - new Date(operation.timestamp).getTime();
        priority += Math.max(0, 10 - age / 1000); // Decay over 10 seconds

        // Higher priority for smaller operations
        if (operation.type === 'insert') {
            priority += Math.max(0, 5 - operation.content.length / 10);
        } else if (operation.type === 'delete') {
            priority += Math.max(0, 5 - operation.length / 10);
        }

        return priority;
    }

    /**
     * Resolve three-way merge
     */
    threeWayMerge(base, local, remote) {
        // If local and remote are the same, no conflict
        if (JSON.stringify(local) === JSON.stringify(remote)) {
            return { resolved: local, conflicts: [] };
        }

        // If local is same as base, use remote
        if (JSON.stringify(local) === JSON.stringify(base)) {
            return { resolved: remote, conflicts: [] };
        }

        // If remote is same as base, use local
        if (JSON.stringify(remote) === JSON.stringify(base)) {
            return { resolved: local, conflicts: [] };
        }

        // Both changed - need to merge
        const conflicts = [];

        // Apply operational transformation
        const result = operationalTransformService.transform(local, remote);

        return {
            resolved: result.op1,
            conflicts: [{
                local,
                remote,
                base,
                resolution: result.op1
            }]
        };
    }

    /**
     * Generate conflict report
     */
    generateConflictReport(operations) {
        const conflicts = [];

        for (let i = 0; i < operations.length; i++) {
            for (let j = i + 1; j < operations.length; j++) {
                if (this.detectConflicts(operations[i].operation, operations[j].operation)) {
                    conflicts.push({
                        operation1: operations[i],
                        operation2: operations[j],
                        type: this.getConflictType(operations[i].operation, operations[j].operation)
                    });
                }
            }
        }

        return {
            totalOperations: operations.length,
            conflictCount: conflicts.length,
            conflicts
        };
    }

    /**
     * Get conflict type
     */
    getConflictType(op1, op2) {
        if (op1.type === 'insert' && op2.type === 'insert') {
            return 'concurrent_insert';
        }
        if (op1.type === 'delete' && op2.type === 'delete') {
            return 'overlapping_delete';
        }
        if ((op1.type === 'insert' && op2.type === 'delete') ||
            (op1.type === 'delete' && op2.type === 'insert')) {
            return 'insert_delete_conflict';
        }
        return 'unknown';
    }
}

module.exports = new ConflictResolver();
