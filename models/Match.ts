import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IMatch {
  matchNumber: number;
  franchiseA: Types.ObjectId;
  franchiseB: Types.ObjectId;
  date: Date;
  venue: string;
  isScored: boolean;
  /** Official player of the match — +50 fantasy points when in playing XI. */
  playerOfMatch?: Types.ObjectId;
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
    playerOfMatch: { type: Schema.Types.ObjectId, ref: "Player", required: false },
  },
  { timestamps: true }
);

MatchSchema.index({ matchNumber: 1 }, { unique: true });

if (process.env.NODE_ENV !== "production" && mongoose.models.Match) {
  delete mongoose.models.Match;
}

export const Match: Model<IMatch> =
  mongoose.models.Match ?? mongoose.model<IMatch>("Match", MatchSchema);
