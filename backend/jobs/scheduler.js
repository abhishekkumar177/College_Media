const cron = require('node-cron');
const logger = require('../utils/logger');

// Import all tasks
const cleanupSessions = require('./tasks/cleanupSessions');
const sendDigestEmail = require('./tasks/sendDigestEmail');
const archiveOldData = require('./tasks/archiveOldData');

/**
 * Task Registry - Centralized management of all scheduled tasks
 */
class Scheduler {
    constructor() {
        this.tasks = new Map();
        this.jobs = new Map();
        this.initialized = false;
    }

    /**
     * Register a task
     */
    register(task) {
        if (!task.name || !task.schedule || !task.execute) {
            throw new Error('Invalid task: must have name, schedule, and execute');
        }
        this.tasks.set(task.name, {
            ...task,
            lastRun: null,
            lastResult: null,
            runCount: 0
        });
        logger.info(`Task registered: ${task.name} (${task.schedule})`);
    }

    /**
     * Initialize and start all enabled tasks
     */
    start() {
        if (this.initialized) {
            logger.warn('Scheduler already initialized');
            return;
        }

        for (const [name, task] of this.tasks) {
            if (task.enabled) {
                this.scheduleTask(name, task);
            } else {
                logger.info(`Task ${name} is disabled, skipping`);
            }
        }

        this.initialized = true;
        logger.info(`Scheduler started with ${this.jobs.size} active tasks`);
    }

    /**
     * Schedule a single task
     */
    scheduleTask(name, task) {
        if (!cron.validate(task.schedule)) {
            logger.error(`Invalid cron schedule for ${name}: ${task.schedule}`);
            return;
        }

        const job = cron.schedule(task.schedule, async () => {
            logger.info(`Running scheduled task: ${name}`);
            try {
                const result = await task.execute();
                task.lastRun = new Date();
                task.lastResult = { success: true, ...result };
                task.runCount++;
            } catch (error) {
                task.lastRun = new Date();
                task.lastResult = { success: false, error: error.message };
                logger.error(`Task ${name} failed:`, error);
            }
        }, {
            scheduled: true,
            timezone: 'Asia/Kolkata' // Indian timezone
        });

        this.jobs.set(name, job);
        logger.info(`Task scheduled: ${name}`);
    }

    /**
     * Stop all tasks
     */
    stop() {
        for (const [name, job] of this.jobs) {
            job.stop();
            logger.info(`Task stopped: ${name}`);
        }
        this.jobs.clear();
        this.initialized = false;
    }

    /**
     * Enable a task
     */
    enable(name) {
        const task = this.tasks.get(name);
        if (!task) throw new Error(`Task not found: ${name}`);

        task.enabled = true;
        if (!this.jobs.has(name)) {
            this.scheduleTask(name, task);
        }
        return task;
    }

    /**
     * Disable a task
     */
    disable(name) {
        const task = this.tasks.get(name);
        if (!task) throw new Error(`Task not found: ${name}`);

        task.enabled = false;
        const job = this.jobs.get(name);
        if (job) {
            job.stop();
            this.jobs.delete(name);
        }
        return task;
    }

    /**
     * Manually trigger a task
     */
    async trigger(name) {
        const task = this.tasks.get(name);
        if (!task) throw new Error(`Task not found: ${name}`);

        logger.info(`Manually triggering task: ${name}`);
        const result = await task.execute();
        task.lastRun = new Date();
        task.lastResult = { success: true, ...result, manual: true };
        task.runCount++;
        return task.lastResult;
    }

    /**
     * Get status of all tasks
     */
    getStatus() {
        const status = [];
        for (const [name, task] of this.tasks) {
            status.push({
                name,
                description: task.description,
                schedule: task.schedule,
                enabled: task.enabled,
                running: this.jobs.has(name),
                lastRun: task.lastRun,
                lastResult: task.lastResult,
                runCount: task.runCount
            });
        }
        return status;
    }
}

// Create singleton instance
const scheduler = new Scheduler();

// Register all tasks
scheduler.register(cleanupSessions);
scheduler.register(sendDigestEmail);
scheduler.register(archiveOldData);

module.exports = scheduler;
