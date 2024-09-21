import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    totalUsedTime: {
      type: Number,
      default: 0,
    },
    maximumAllowedTime: {
      type: Number,
      default: 10,
    },
    lastUsageTimestamp: {
      type: Date,
      default: Date.now,
    },
    isActiveUser: {
      type: Boolean,
      default: true,
    },
    usageDetails: {
      usageCount: {
        type: Number,
        default: 0,
      },
      usageDates: {
        type: [Date],
        default: [],
      },
    },
  },
  { timeseries: true }
);

export default mongoose.model('User', userSchema);
