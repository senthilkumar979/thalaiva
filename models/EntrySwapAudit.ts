import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IEntrySwapAudit {
  swapWindow: Types.ObjectId;
  competition: Types.ObjectId;
  entry: Types.ObjectId;
  user: Types.ObjectId;
  /** 1 = tier1 (fantasy tier 1), 2 = tier2 (player tier 3), 3 = tier3 (player tier 5). */
  tierSlot: 1 | 2 | 3;
  playerOut: Types.ObjectId;
  playerIn: Types.ObjectId;
  effectiveFromMatchNumber: number;
  swapsRemainingAfter: number;
  captainUpdated: boolean;
  viceCaptainUpdated: boolean;
}

export interface IEntrySwapAuditDocument extends IEntrySwapAudit {
  _id: Types.ObjectId;
}

const EntrySwapAuditSchema = new Schema<IEntrySwapAudit>(
  {
    swapWindow: { type: Schema.Types.ObjectId, ref: "SwapWindow", required: true },
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    entry: { type: Schema.Types.ObjectId, ref: "Entry", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tierSlot: { type: Number, enum: [1, 2, 3], required: true },
    playerOut: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    playerIn: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    effectiveFromMatchNumber: { type: Number, required: true },
    swapsRemainingAfter: { type: Number, required: true, min: 0, max: 6 },
    captainUpdated: { type: Boolean, default: false },
    viceCaptainUpdated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EntrySwapAuditSchema.index({ entry: 1, createdAt: -1 });
EntrySwapAuditSchema.index({ swapWindow: 1, user: 1 });
EntrySwapAuditSchema.index({ competition: 1, user: 1 });

export const EntrySwapAudit: Model<IEntrySwapAudit> =
  mongoose.models.EntrySwapAudit ??
  mongoose.model<IEntrySwapAudit>("EntrySwapAudit", EntrySwapAuditSchema);
