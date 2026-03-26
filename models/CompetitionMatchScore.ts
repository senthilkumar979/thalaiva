import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IPlayerPointsRow {
  player: Types.ObjectId;
  isCaptain: boolean;
  rawPoints: number;
  captainMultiplied: number;
}

export interface ICompetitionMatchScore {
  competition: Types.ObjectId;
  match: Types.ObjectId;
  entry: Types.ObjectId;
  user: Types.ObjectId;
  playersWithPoints: IPlayerPointsRow[];
  totalPointsThisMatch: number;
  rankThisMatch: number;
}

export interface ICompetitionMatchScoreDocument extends ICompetitionMatchScore {
  _id: Types.ObjectId;
}

const PlayerPointsRowSchema = new Schema<IPlayerPointsRow>(
  {
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    isCaptain: { type: Boolean, required: true },
    rawPoints: { type: Number, required: true },
    captainMultiplied: { type: Number, required: true },
  },
  { _id: false }
);

const CompetitionMatchScoreSchema = new Schema<ICompetitionMatchScore>(
  {
    competition: { type: Schema.Types.ObjectId, ref: "Competition", required: true },
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    entry: { type: Schema.Types.ObjectId, ref: "Entry", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    playersWithPoints: { type: [PlayerPointsRowSchema], default: [] },
    totalPointsThisMatch: { type: Number, required: true },
    rankThisMatch: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CompetitionMatchScoreSchema.index({ competition: 1, match: 1, entry: 1 }, { unique: true });

export const CompetitionMatchScore: Model<ICompetitionMatchScore> =
  mongoose.models.CompetitionMatchScore ??
  mongoose.model<ICompetitionMatchScore>("CompetitionMatchScore", CompetitionMatchScoreSchema);
