import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMealPreference extends Document {
  userId: string;
  userEmail: string;
  date: string; // YYYY-MM-DD
  lunch: 'VEG' | 'NON_VEG' | 'NONE';
  dinner: 'VEG' | 'NON_VEG' | 'NONE';
  updatedBy: 'student' | 'admin';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MealPreferenceSchema = new Schema<IMealPreference>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    lunch: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'NONE'],
      default: 'NONE',
    },
    dinner: {
      type: String,
      enum: ['VEG', 'NON_VEG', 'NONE'],
      default: 'NONE',
    },
    updatedBy: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    note: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : '';
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index to ensure uniqueness per user per date
MealPreferenceSchema.index({ userId: 1, date: 1 }, { unique: true });

const MealPreference: Model<IMealPreference> =
  mongoose.models.MealPreference ||
  mongoose.model<IMealPreference>('MealPreference', MealPreferenceSchema);

export default MealPreference;
