const mongoose = require("mongoose");
const Account = require("../models/Account");

/**
 * =========================================
 * Transfer Balance (Atomic & Safe)
 * Fixes Partial Commit Issue
 * =========================================
 */
const transferBalance = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { fromId, toId, amount } = req.body;

    /* ------------------
       🧪 VALIDATION
    ------------------ */
    if (!fromId || !toId || !amount) {
      const err = new Error("Missing required fields");
      err.statusCode = 400;
      throw err;
    }

    if (fromId === toId) {
      const err = new Error("Cannot transfer to the same account");
      err.statusCode = 400;
      throw err;
    }

    if (amount <= 0) {
      const err = new Error("Transfer amount must be greater than zero");
      err.statusCode = 400;
      throw err;
    }

    /* ------------------
       🔐 START TRANSACTION
    ------------------ */
    await session.withTransaction(async () => {
      const fromAccount = await Account.findById(fromId).session(session);
      const toAccount = await Account.findById(toId).session(session);

      if (!fromAccount || !toAccount) {
        const err = new Error("Account not found");
        err.statusCode = 404;
        throw err;
      }

      if (fromAccount.balance < amount) {
        const err = new Error("Insufficient balance");
        err.statusCode = 400;
        throw err;
      }

      /* ------------------
         💰 UPDATE BALANCES
      ------------------ */
      fromAccount.balance -= amount;
      toAccount.balance += amount;

      await fromAccount.save({ session });
      await toAccount.save({ session });
    });

    res.status(200).json({
      success: true,
      message: "Transfer completed successfully",
    });
  } catch (error) {
    // Automatic rollback happens in withTransaction
    next(error);
  } finally {
    session.endSession(); // 🔥 ALWAYS close session
  }
};

module.exports = { transferBalance };
