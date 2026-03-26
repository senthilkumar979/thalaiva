import mongoose, { Schema, type Model, type Types } from "mongoose";

export type PlayerTier = 1 | 3 | 5;
export type PlayerRole = "bat" | "bowl" | "allrounder" | "wk";

export interface IPlayer {
  name: string;
  franchise: Types.ObjectId;
  tier: PlayerTier;
  role: PlayerRole;
  isActive: boolean;
  totalFantasyPoints: number;
}

export interface IPlayerDocument extends IPlayer {
  _id: Types.ObjectId;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, trim: true },
    franchise: { type: Schema.Types.ObjectId, ref: "Franchise", required: true },
    tier: { type: Number, enum: [1, 3, 5], required: true },
    role: { type: String, enum: ["bat", "bowl", "allrounder", "wk"], required: true },
    isActive: { type: Boolean, default: true },
    totalFantasyPoints: { type: Number, default: 0 },
  },
  { timestamps: false }
);

PlayerSchema.index({ franchise: 1, tier: 1 });

export const Player: Model<IPlayer> =
  mongoose.models.Player ?? mongoose.model<IPlayer>("Player", PlayerSchema);
