const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "alumni", "admin"],
      default: "student",
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    alumniDetails: {
      company: { type: String, trim: true },
      designation: { type: String, trim: true },
      industry: { type: String, trim: true },
      graduationYear: Number,
      linkedinProfile: { type: String, trim: true },
      isOpenToMentorship: { type: Boolean, default: true },
    },

    profilePicture: { type: String, default: null },
    profileBanner: { type: String, default: null },

    followerCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },

    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      follows: { type: Boolean, default: true },
    },

    settings: {
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "auto",
      },
    },

    profileVisibility: {
      type: String,
      enum: ["public", "followers", "private"],
      default: "public",
    },

    isVerified: { type: Boolean, default: false },
    isPrivate: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    lastLoginAt: Date,

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletionReason: { type: String, default: null },
    scheduledDeletionDate: { type: Date, default: null },
  },
  {
    timestamps: true,

    // 🔥 OPTIMISTIC LOCKING
    optimisticConcurrency: true, // enables version check
    versionKey: "__v", // explicit (clarity for reviewer)
  }
);

/* ------------------
   🔐 SAFE SAVE HELPER
------------------ */
userSchema.methods.safeSave = async function () {
  try {
    return await this.save();
  } catch (err) {
    if (err.name === "VersionError") {
      const conflictError = new Error(
        "Concurrent update detected. Please retry your request."
      );
      conflictError.statusCode = 409;
      conflictError.code = "CONCURRENT_UPDATE_CONFLICT";
      throw conflictError;
    }
    throw err;
  }
};

/* ------------------
   🧠 BUSINESS METHODS
------------------ */
userSchema.methods.deactivate = async function (reason = null) {
  this.isActive = false;
  this.deletionReason = reason;
  return this.safeSave();
};

userSchema.methods.reactivate = async function () {
  this.isActive = true;
  this.deletionReason = null;
  return this.safeSave();
};

userSchema.methods.softDelete = async function (reason = null) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletionReason = reason;
  this.isActive = false;
  this.scheduledDeletionDate = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  );
  return this.safeSave();
};

userSchema.methods.restore = async function () {
  this.isDeleted = false;
  this.deletedAt = null;
  this.deletionReason = null;
  this.scheduledDeletionDate = null;
  this.isActive = true;
  return this.safeSave();
};

userSchema.methods.blockUser = async function (userIdToBlock) {
  if (!this.blockedUsers.includes(userIdToBlock)) {
    this.blockedUsers.push(userIdToBlock);
    this.followers = this.followers.filter(
      (id) => id.toString() !== userIdToBlock.toString()
    );
    this.following = this.following.filter(
      (id) => id.toString() !== userIdToBlock.toString()
    );
    return this.safeSave();
  }
  return this;
};

userSchema.methods.unblockUser = async function (userIdToUnblock) {
  this.blockedUsers = this.blockedUsers.filter(
    (id) => id.toString() !== userIdToUnblock.toString()
  );
  return this.safeSave();
};

userSchema.methods.isUserBlocked = function (userId) {
  return this.blockedUsers.some(
    (id) => id.toString() === userId.toString()
  );
};

module.exports = mongoose.model("User", userSchema);
