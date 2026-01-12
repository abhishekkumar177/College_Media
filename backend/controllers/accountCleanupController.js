const mongoose = require("mongoose");
const User = require("../models/User");
const Account = require("../models/Account");
const Post = require("../models/Post");
const AuditLog = require("../models/AuditLog");

/**
 * =================================================
 * Delete User Account (Atomic Operation)
 * Fixes Partial Commit Issue
 * =================================================
 */
const deleteUserAccount = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { userId } = req.params;

    if (!userId) {
      const err = new Error("User ID is required");
      err.statusCode = 400;
      throw err;
    }

    /* =====================================
       🔐 TRANSACTION START
    ===================================== */
    await session.withTransaction(async () => {
      /* ---------- 1. FIND USER ---------- */
      const user = await User.findById(userId).session(session);
      if (!user) {
        const err = new Error("User not found");
        err.statusCode = 404;
        throw err;
      }

      /* ---------- 2. ARCHIVE ACCOUNT ---------- */
      const account = await Account.findOne({ user: userId }).session(session);

      if (account) {
        account.isArchived = true;
        account.archivedAt = new Date();
        await account.save({ session });
      }

      /* ---------- 3. DELETE POSTS ---------- */
      const postResult = await Post.deleteMany(
        { author: userId },
        { session }
      );

      if (postResult.deletedCount < 0) {
        const err = new Error("Failed to delete user posts");
        err.statusCode = 500;
        throw err;
      }

      /* ---------- 4. DELETE USER ---------- */
      await User.deleteOne({ _id: userId }, { session });

      /* ---------- 5. AUDIT LOG ---------- */
      await AuditLog.create(
        [
          {
            action: "USER_DELETED",
            entityId: userId,
            entityType: "User",
            metadata: {
              postsDeleted: postResult.deletedCount,
              archivedAccount: !!account,
            },
            createdAt: new Date(),
          },
        ],
        { session }
      );
    });

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    // Rollback handled automatically
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = { deleteUserAccount };
