import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ICompetition {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  entryDeadline: Date;
  /** When true, no new or updated entries (admin override). */
  entriesFrozen: boolean;
  isActive: boolean;
  participants: Types.ObjectId[];
  /** Admin-only: player swap window open for this league. */
  swapWindowOpen?: boolean;
  activeSwapWindow?: Types.ObjectId;
}

export interface ICompetitionDocument extends ICompetition {
  _id: Types.ObjectId;
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    entryDeadline: { type: Date, required: true },
    entriesFrozen: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    swapWindowOpen: { type: Boolean, default: false },
    activeSwapWindow: { type: Schema.Types.ObjectId, ref: "SwapWindow", required: false },
  },
  { timestamps: true }
);

CompetitionSchema.index({ isActive: 1, entryDeadline: 1 });

export const Competition: Model<ICompetition> =
  mongoose.models.Competition ?? mongoose.model<ICompetition>("Competition", CompetitionSchema);
