/**
 * Operational Transform Service
 * Issue #923: Real-time Collaborative Features
 * 
 * Implements operational transformation for conflict-free collaborative editing.
 */

class OperationalTransformService {

    /**
     * Transform operation against another operation
     * Based on the OT algorithm for text editing
     */
    transform(op1, op2) {
        // If operations are on different positions, no transformation needed
        if (op1.position < op2.position) {
            return { op1, op2 };
        }

        // Transform based on operation types
        if (op1.type === 'insert' && op2.type === 'insert') {
            return this.transformInsertInsert(op1, op2);
        } else if (op1.type === 'insert' && op2.type === 'delete') {
            return this.transformInsertDelete(op1, op2);
        } else if (op1.type === 'delete' && op2.type === 'insert') {
            return this.transformDeleteInsert(op1, op2);
        } else if (op1.type === 'delete' && op2.type === 'delete') {
            return this.transformDeleteDelete(op1, op2);
        }

        return { op1, op2 };
    }

    /**
     * Transform two insert operations
     */
    transformInsertInsert(op1, op2) {
        if (op1.position < op2.position) {
            // op2 position shifts by op1 length
            return {
                op1,
                op2: { ...op2, position: op2.position + op1.content.length }
            };
        } else if (op1.position > op2.position) {
            // op1 position shifts by op2 length
            return {
                op1: { ...op1, position: op1.position + op2.content.length },
                op2
            };
        } else {
            // Same position - use tie-breaking (e.g., by user ID or timestamp)
            return {
                op1,
                op2: { ...op2, position: op2.position + op1.content.length }
            };
        }
    }

    /**
     * Transform insert against delete
     */
    transformInsertDelete(op1, op2) {
        if (op1.position <= op2.position) {
            // Delete position shifts by insert length
            return {
                op1,
                op2: { ...op2, position: op2.position + op1.content.length }
            };
        } else if (op1.position >= op2.position + op2.length) {
            // Insert position shifts back by delete length
            return {
                op1: { ...op1, position: op1.position - op2.length },
                op2
            };
        } else {
            // Insert is within delete range - adjust both
            return {
                op1: { ...op1, position: op2.position },
                op2: { ...op2, length: op2.length + op1.content.length }
            };
        }
    }

    /**
     * Transform delete against insert
     */
    transformDeleteInsert(op1, op2) {
        if (op2.position <= op1.position) {
            // Delete position shifts by insert length
            return {
                op1: { ...op1, position: op1.position + op2.content.length },
                op2
            };
        } else if (op2.position >= op1.position + op1.length) {
            // Insert position shifts back by delete length
            return {
                op1,
                op2: { ...op2, position: op2.position - op1.length }
            };
        } else {
            // Insert is within delete range
            return {
                op1: { ...op1, length: op1.length + op2.content.length },
                op2: { ...op2, position: op1.position }
            };
        }
    }

    /**
     * Transform two delete operations
     */
    transformDeleteDelete(op1, op2) {
        if (op1.position + op1.length <= op2.position) {
            // op2 shifts back by op1 length
            return {
                op1,
                op2: { ...op2, position: op2.position - op1.length }
            };
        } else if (op2.position + op2.length <= op1.position) {
            // op1 shifts back by op2 length
            return {
                op1: { ...op1, position: op1.position - op2.length },
                op2
            };
        } else {
            // Overlapping deletes - merge them
            const start = Math.min(op1.position, op2.position);
            const end1 = op1.position + op1.length;
            const end2 = op2.position + op2.length;
            const end = Math.max(end1, end2);

            return {
                op1: { ...op1, position: start, length: end - start },
                op2: { ...op2, position: start, length: 0 } // op2 becomes no-op
            };
        }
    }

    /**
     * Apply operation to text
     */
    applyOperation(text, operation) {
        switch (operation.type) {
            case 'insert':
                return this.applyInsert(text, operation);
            case 'delete':
                return this.applyDelete(text, operation);
            case 'retain':
                return text;
            default:
                throw new Error(`Unknown operation type: ${operation.type}`);
        }
    }

    /**
     * Apply insert operation
     */
    applyInsert(text, operation) {
        const { position, content } = operation;
        return text.slice(0, position) + content + text.slice(position);
    }

    /**
     * Apply delete operation
     */
    applyDelete(text, operation) {
        const { position, length } = operation;
        return text.slice(0, position) + text.slice(position + length);
    }

    /**
     * Compose two operations
     */
    compose(op1, op2) {
        // If op2 is at the end of op1's insertion
        if (op1.type === 'insert' && op2.type === 'insert' &&
            op1.position + op1.content.length === op2.position) {
            return {
                type: 'insert',
                position: op1.position,
                content: op1.content + op2.content
            };
        }

        // If op2 deletes what op1 inserted
        if (op1.type === 'insert' && op2.type === 'delete' &&
            op1.position === op2.position && op1.content.length === op2.length) {
            return null; // Operations cancel out
        }

        // Otherwise, return both operations
        return [op1, op2];
    }

    /**
     * Invert operation (for undo)
     */
    invert(operation, originalText) {
        switch (operation.type) {
            case 'insert':
                return {
                    type: 'delete',
                    position: operation.position,
                    length: operation.content.length
                };
            case 'delete':
                return {
                    type: 'insert',
                    position: operation.position,
                    content: originalText.slice(operation.position, operation.position + operation.length)
                };
            default:
                return operation;
        }
    }

    /**
     * Transform operation against a list of operations
     */
    transformAgainstOperations(operation, operations) {
        let transformed = operation;

        for (const op of operations) {
            const result = this.transform(transformed, op);
            transformed = result.op1;
        }

        return transformed;
    }

    /**
     * Validate operation
     */
    validateOperation(operation, textLength) {
        if (operation.position < 0 || operation.position > textLength) {
            throw new Error('Invalid operation position');
        }

        if (operation.type === 'delete') {
            if (operation.position + operation.length > textLength) {
                throw new Error('Delete operation exceeds text length');
            }
        }

        return true;
    }
}

module.exports = new OperationalTransformService();
