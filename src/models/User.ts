import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  roomNumber: string;
  year: number;
  course: 'B.Tech' | 'M.Tech' | 'MCA';
  role: 'student' | 'admin';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Student or Admin name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Academic year is required (1-4)'],
      min: 1,
      max: 4,
    },
    course: {
      type: String,
      enum: ['B.Tech', 'M.Tech', 'MCA'],
      default: 'B.Tech',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    phone: {
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

// Prevent mongoose model re-compilation in development hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
