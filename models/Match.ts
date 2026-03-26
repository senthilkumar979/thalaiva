import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IMatch {
  matchNumber: number;
  franchiseA: Types.ObjectId;
  franchiseB: Types.ObjectId;
  date: Date;
  venue: string;
  isScored: boolean;
}

export interface IMatchDocument extends IMatch {
  _id: Types.ObjectId;
}

const MatchSchema = new Schema<IMatch>(
  {
    matchNumber: { type: Number, required: true },
    franchiseA: { type: Schema.Types.ObjectId, ref: "Franchise", required: true },
    franchiseB: { type: Schema.Types.ObjectId, ref: "Franchise", required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true, trim: true },
    isScored: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MatchSchema.index({ matchNumber: 1 }, { unique: true });

export const Match: Model<IMatch> =
  mongoose.models.Match ?? mongoose.model<IMatch>("Match", MatchSchema);
