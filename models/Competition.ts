import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ICompetition {
  name: string;
  description: string;
  createdBy: Types.ObjectId;
  entryDeadline: Date;
  isActive: boolean;
  participants: Types.ObjectId[];
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
    isActive: { type: Boolean, default: true },
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

CompetitionSchema.index({ isActive: 1, entryDeadline: 1 });

export const Competition: Model<ICompetition> =
  mongoose.models.Competition ?? mongoose.model<ICompetition>("Competition", CompetitionSchema);
