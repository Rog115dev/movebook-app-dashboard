import mongoose, { Schema, type InferSchemaType, type Model } from 'mongoose';

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    userType: {
      type: String,
      enum: ['athlete', 'coach', 'club'],
      default: 'athlete',
    },
    country: { type: String, default: 'US', trim: true },
    firstName: { type: String, trim: true },
    surname: { type: String, trim: true },
    gender: { type: String, trim: true },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const UserModel: Model<UserDocument> =
  (mongoose.models.User as Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema);

export function publicUser(user: UserDocument) {
  return {
    id: String(user._id),
    name: user.name,
    username: user.username,
    email: user.email,
    userType: user.userType,
    country: user.country,
  };
}
