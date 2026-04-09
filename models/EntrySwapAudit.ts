import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IEntrySwapAudit {
  swapWindow: Types.ObjectId;
  competition: Types.ObjectId;
  entry: Types.ObjectId;
  user: Types.ObjectId;
  /** player | leadership-only row (captain/vice change). */
  recordKind?: "player" | "leadership";
  /** 1–3 = tier slot; 0 = leadership-only record. */
  tierSlot: 0 | 1 | 2 | 3;
  /** Omitted for some leadership rows (e.g. first vice-captain assignment). */
  playerOut?: Types.ObjectId;
  playerIn?: Types.ObjectId;
  effectiveFromMatchNumber: number;
  swapsRemainingAfter: number;
  /** Points deducted for this line (negative). */
  penaltyPoints: number;
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
    recordKind: { type: String, enum: ["player", "leadership"], default: "player" },
    tierSlot: { type: Number, enum: [0, 1, 2, 3], required: true },
    playerOut: { type: Schema.Types.ObjectId, ref: "Player", required: false },
    playerIn: { type: Schema.Types.ObjectId, ref: "Player", required: false },
    effectiveFromMatchNumber: { type: Number, required: true },
    swapsRemainingAfter: { type: Number, required: true, min: 0, max: 6 },
    penaltyPoints: { type: Number, required: true, default: 0 },
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
