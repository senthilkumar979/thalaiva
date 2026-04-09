import mongoose, { Schema, type Model, type Types } from "mongoose";

/** Full squad snapshot; effective from this match number (inclusive) by global match order. */
export interface IEntryRosterVersion {
  entry: Types.ObjectId;
  competition: Types.ObjectId;
  effectiveFromMatchNumber: number;
  tier1Players: Types.ObjectId[];
  tier2Players: Types.ObjectId[];
  tier3Players: Types.ObjectId[];
  captain: Types.ObjectId;
  viceCaptain?: Types.ObjectId;
}

export interface IEntryRosterVersionDocument extends IEntryRosterVersion {
  _id: Types.ObjectId;
}

const EntryRosterVersionSchema = new Schema<IEntryRosterVersion>(
  {
    entry: { type: Schema.Types.ObjectId, ref: "Entry", required: true },
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    effectiveFromMatchNumber: { type: Number, required: true, min: 1 },
    tier1Players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    tier2Players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    tier3Players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    captain: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    viceCaptain: { type: Schema.Types.ObjectId, ref: "Player", required: false },
  },
  { timestamps: true }
);

EntryRosterVersionSchema.index({ entry: 1, effectiveFromMatchNumber: -1 });
EntryRosterVersionSchema.index({ competition: 1, entry: 1 });

export const EntryRosterVersion: Model<IEntryRosterVersion> =
  mongoose.models.EntryRosterVersion ??
  mongoose.model<IEntryRosterVersion>("EntryRosterVersion", EntryRosterVersionSchema);
