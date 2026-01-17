/**
 * Distributed Transaction Management
 * Saga Pattern (Orchestration Based)
 * ----------------------------------
 * Single-file demo for backend systems
 */

const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/**
 * Fake Service URLs (Assume separate microservices)
 */
const SERVICES = {
  USER: "http://user-service/api/users",
  WALLET: "http://wallet-service/api/wallet",
  EMAIL: "http://email-service/api/send"
};

/**
 * Saga Step Class
 */
class SagaStep {
  constructor(name, action, compensation) {
    this.name = name;
    this.action = action;
    this.compensation = compensation;
  }
}

/**
 * Saga Orchestrator
 */
class SagaOrchestrator {
  constructor(steps) {
    this.steps = steps;
    this.completedSteps = [];
  }

  async execute(payload) {
    try {
      for (const step of this.steps) {
        console.log(`▶ Executing step: ${step.name}`);
        await step.action(payload);
        this.completedSteps.push(step);
      }
      return { success: true };
    } catch (error) {
      console.error("❌ Saga failed. Starting rollback...");
      await this.rollback(payload);
      return { success: false, error: error.message };
    }
  }

  async rollback(payload) {
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      const step = this.completedSteps[i];
      try {
        console.log(`↩ Rolling back: ${step.name}`);
        await step.compensation(payload);
      } catch (err) {
        console.error(`Rollback failed for ${step.name}`, err.message);
      }
    }
  }
}

/**
 * Saga Steps Definitions
 */

/**
 * Step 1: Create User
 */
const createUserStep = new SagaStep(
  "Create User",
  async (data) => {
    console.log("User created:", data.userId);
    // await axios.post(SERVICES.USER, data);
  },
  async (data) => {
    console.log("User rollback:", data.userId);
    // await axios.delete(`${SERVICES.USER}/${data.userId}`);
  }
);

/**
 * Step 2: Create Wallet
 */
const createWalletStep = new SagaStep(
  "Create Wallet",
  async (data) => {
    console.log("Wallet created for user:", data.userId);
    // await axios.post(SERVICES.WALLET, data);
  },
  async (data) => {
    console.log("Wallet rollback for user:", data.userId);
    // await axios.delete(`${SERVICES.WALLET}/${data.userId}`);
  }
);

/**
 * Step 3: Send Welcome Email (Fail-prone step)
 */
const sendEmailStep = new SagaStep(
  "Send Email",
  async (data) => {
    console.log("Sending email...");
    throw new Error("Email service failed");
    // await axios.post(SERVICES.EMAIL, data);
  },
  async () => {
    console.log("No rollback needed for email");
  }
);

/**
 * API Endpoint
 */
app.post("/api/v1/register", async (req, res) => {
  const payload = {
    userId: "USR_" + Date.now(),
    email: req.body.email
  };

  const saga = new SagaOrchestrator([
    createUserStep,
    createWalletStep,
    sendEmailStep
  ]);

  const result = await saga.execute(payload);

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: "Transaction failed & rolled back",
      error: result.error
    });
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: payload
  });
});

/**
 * Server Start
 */
app.listen(3000, () => {
  console.log("Saga Orchestrator running on port 3000");
});
