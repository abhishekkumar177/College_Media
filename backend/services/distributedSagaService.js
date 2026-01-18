/**
 * Distributed Transaction Saga Service
 * Implements Saga pattern for distributed transactions
 */

const { tracer } = require('../config/tracing');
const logger = require('../utils/logger');

class SagaStep {
  constructor(name, action, compensation) {
    this.name = name;
    this.action = action;
    this.compensation = compensation;
  }
}

class SagaOrchestrator {
  constructor(steps) {
    this.steps = steps;
    this.completedSteps = [];
    this.isCompensating = false;
  }

  async execute(payload) {
    const span = tracer.startSpan('saga.execute');
    span.setAttribute('saga.steps', this.steps.length);
    span.setAttribute('saga.payload', JSON.stringify(payload));

    try {
      for (const step of this.steps) {
        if (this.isCompensating) break;

        const stepSpan = tracer.startSpan(`saga.step.${step.name}`);
        stepSpan.setAttribute('step.name', step.name);

        try {
          logger.info(`Executing saga step: ${step.name}`, { step: step.name, payload });
          await step.action(payload);
          this.completedSteps.push(step);
          stepSpan.setAttribute('step.success', true);
        } catch (error) {
          stepSpan.recordException(error);
          stepSpan.setAttribute('step.success', false);
          await this.compensate(error);
          throw error;
        } finally {
          stepSpan.end();
        }
      }

      span.setAttribute('saga.success', true);
      logger.info('Saga completed successfully', { steps: this.completedSteps.length });
      return { success: true, completedSteps: this.completedSteps.length };

    } catch (error) {
      span.recordException(error);
      span.setAttribute('saga.success', false);
      throw error;
    } finally {
      span.end();
    }
  }

  async compensate(originalError) {
    if (this.isCompensating) return;

    this.isCompensating = true;
    const span = tracer.startSpan('saga.compensate');
    span.setAttribute('compensation.reason', originalError.message);

    logger.warn('Starting saga compensation', { error: originalError.message });

    try {
      // Compensate in reverse order
      for (let i = this.completedSteps.length - 1; i >= 0; i--) {
        const step = this.completedSteps[i];
        const compSpan = tracer.startSpan(`saga.compensate.${step.name}`);

        try {
          if (step.compensation) {
            logger.info(`Compensating step: ${step.name}`);
            await step.compensation();
            compSpan.setAttribute('compensation.success', true);
          } else {
            logger.warn(`No compensation defined for step: ${step.name}`);
            compSpan.setAttribute('compensation.skipped', true);
          }
        } catch (compError) {
          compSpan.recordException(compError);
          compSpan.setAttribute('compensation.failed', true);
          logger.error(`Compensation failed for step: ${step.name}`, {
            step: step.name,
            error: compError.message
          });
          // Continue with other compensations even if one fails
        } finally {
          compSpan.end();
        }
      }

      span.setAttribute('compensation.completed', true);
    } catch (error) {
      span.recordException(error);
      span.setAttribute('compensation.failed', true);
    } finally {
      span.end();
    }
  }
}

class DistributedTransactionSagaService {
  constructor() {
    this.activeSagas = new Map();
  }

  /**
   * Create a user registration saga
   */
  createUserRegistrationSaga() {
    const steps = [
      new SagaStep(
        'validate_user',
        async (payload) => {
          // Validate user data
          if (!payload.email || !payload.username) {
            throw new Error('Invalid user data');
          }
          logger.info('User validation passed', { email: payload.email });
        },
        async () => {
          // No compensation needed for validation
          logger.info('Validation compensation: no action needed');
        }
      ),

      new SagaStep(
        'create_user_account',
        async (payload) => {
          // Create user account in database
          const User = require('../models/User');
          const user = await User.create({
            email: payload.email,
            username: payload.username,
            firstName: payload.firstName,
            lastName: payload.lastName
          });
          payload.userId = user._id;
          logger.info('User account created', { userId: user._id });
        },
        async (payload) => {
          // Delete user account
          if (payload.userId) {
            const User = require('../models/User');
            await User.findByIdAndDelete(payload.userId);
            logger.info('User account deleted during compensation', { userId: payload.userId });
          }
        }
      ),

      new SagaStep(
        'send_welcome_email',
        async (payload) => {
          // Send welcome email
          const emailService = require('./notificationService');
          await emailService.sendWelcomeEmail(payload.email, payload.firstName);
          logger.info('Welcome email sent', { email: payload.email });
        },
        async (payload) => {
          // Send apology email
          const emailService = require('./notificationService');
          await emailService.sendRegistrationFailedEmail(payload.email);
          logger.info('Registration failure email sent', { email: payload.email });
        }
      ),

      new SagaStep(
        'create_user_profile',
        async (payload) => {
          // Create user profile
          const Profile = require('../models/Profile');
          await Profile.create({
            userId: payload.userId,
            bio: '',
            avatar: null
          });
          logger.info('User profile created', { userId: payload.userId });
        },
        async (payload) => {
          // Delete user profile
          if (payload.userId) {
            const Profile = require('../models/Profile');
            await Profile.findOneAndDelete({ userId: payload.userId });
            logger.info('User profile deleted during compensation', { userId: payload.userId });
          }
        }
      )
    ];

    return new SagaOrchestrator(steps);
  }

  /**
   * Execute a saga with tracking
   */
  async executeSaga(sagaName, saga, payload) {
    const sagaId = `${sagaName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.activeSagas.set(sagaId, { saga, startTime: Date.now() });

    try {
      const result = await saga.execute(payload);
      logger.info(`Saga ${sagaId} completed successfully`, { sagaId, result });
      return result;
    } catch (error) {
      logger.error(`Saga ${sagaId} failed`, { sagaId, error: error.message });
      throw error;
    } finally {
      // Clean up after some time
      setTimeout(() => {
        this.activeSagas.delete(sagaId);
      }, 300000); // 5 minutes
    }
  }

  /**
   * Get saga statistics
   */
  getSagaStats() {
    return {
      activeSagas: this.activeSagas.size,
      sagas: Array.from(this.activeSagas.entries()).map(([id, data]) => ({
        id,
        duration: Date.now() - data.startTime
      }))
    };
  }
}

module.exports = new DistributedTransactionSagaService();