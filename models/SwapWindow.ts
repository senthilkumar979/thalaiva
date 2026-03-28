import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface ISwapWindow {
  competition: Types.ObjectId;
  /** floor(scoredMatches / 15) when the window was opened. */
  blockSequence: number;
  isOpen: boolean;
  openedAt: Date;
  closedAt?: Date;
}

export interface ISwapWindowDocument extends ISwapWindow {
  _id: Types.ObjectId;
}

const SwapWindowSchema = new Schema<ISwapWindow>(
  {
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    blockSequence: { type: Number, required: true, min: 1 },
    isOpen: { type: Boolean, default: true },
    openedAt: { type: Date, required: true },
    closedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

SwapWindowSchema.index({ competition: 1, openedAt: -1 });

export const SwapWindow: Model<ISwapWindow> =
  mongoose.models.SwapWindow ?? mongoose.model<ISwapWindow>("SwapWindow", SwapWindowSchema);
