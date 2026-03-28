import mongoose, { Schema, type Model, type Types } from "mongoose";
import { Player } from "./Player";

export interface IEntry {
  competition: Types.ObjectId;
  user: Types.ObjectId;
  customTeamName: string;
  tier1Players: Types.ObjectId[];
  tier2Players: Types.ObjectId[];
  tier3Players: Types.ObjectId[];
  captain: Types.ObjectId;
  /** Set on all new submissions; older entries may omit until updated. */
  viceCaptain?: Types.ObjectId;
  totalScore: number;
  /** Player swaps used in this competition (max 6). */
  swapCountUsed?: number;
  /** Captain changed at most once per competition (during a swap window). */
  captainChangeUsed?: boolean;
  /** Vice-captain changed at most once per competition (during a swap window). */
  viceCaptainChangeUsed?: boolean;
}

export interface IEntryDocument extends IEntry {
  _id: Types.ObjectId;
}

const EntrySchema = new Schema<IEntry>(
  {
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customTeamName: { type: String, required: true, trim: true },
    tier1Players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    tier2Players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    tier3Players: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    captain: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    viceCaptain: { type: Schema.Types.ObjectId, ref: "Player", required: false },
    totalScore: { type: Number, default: 0 },
    swapCountUsed: { type: Number, default: 0 },
    captainChangeUsed: { type: Boolean, default: false },
    viceCaptainChangeUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EntrySchema.index({ competition: 1, user: 1 }, { unique: true });

async function assertTierFranchiseUniqueness(
  tierPlayerIds: Types.ObjectId[]
): Promise<void> {
  if (tierPlayerIds.length !== 5) return;
  const players = await Player.find({ _id: { $in: tierPlayerIds } })
    .select("franchise")
    .lean();
  const franchises = players.map((p) => String(p.franchise));
  const unique = new Set(franchises);
  if (unique.size !== franchises.length) {
    throw new Error("Each tier must have 5 players from different franchises");
  }
}

EntrySchema.pre("save", async function () {
  await assertTierFranchiseUniqueness(this.tier1Players as Types.ObjectId[]);
  await assertTierFranchiseUniqueness(this.tier2Players as Types.ObjectId[]);
  await assertTierFranchiseUniqueness(this.tier3Players as Types.ObjectId[]);
  const all = [
    ...this.tier1Players.map(String),
    ...this.tier2Players.map(String),
    ...this.tier3Players.map(String),
  ];
  if (new Set(all).size !== 15) throw new Error("Duplicate player across tiers");
  if (!all.includes(String(this.captain))) throw new Error("Captain must be one of the 15 players");
  if (this.viceCaptain) {
    if (!all.includes(String(this.viceCaptain))) throw new Error("Vice-captain must be one of the 15 players");
    if (String(this.captain) === String(this.viceCaptain)) {
      throw new Error("Captain and vice-captain must be different players");
    }
    const [capDoc, viceDoc] = await Promise.all([
      Player.findById(this.captain).select("franchise").lean(),
      Player.findById(this.viceCaptain).select("franchise").lean(),
    ]);
    if (String(capDoc?.franchise) === String(viceDoc?.franchise)) {
      throw new Error("Captain and vice-captain must be from different franchises");
    }
  }
});

// Next.js dev hot reload can cache a stale model without newer paths (e.g. viceCaptain),
// which makes populate() throw StrictPopulateError. Re-register in development.
if (process.env.NODE_ENV !== "production" && mongoose.models.Entry) {
  delete mongoose.models.Entry;
}

export const Entry: Model<IEntry> =
  mongoose.models.Entry ?? mongoose.model<IEntry>("Entry", EntrySchema);
