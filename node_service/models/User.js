const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },

    isAdmin: { 
        type: Boolean,
        default: false
    },

    githubId: {
      type: String,
      unique: true,
      sparse: true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
