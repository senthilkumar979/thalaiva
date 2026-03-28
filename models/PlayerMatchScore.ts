import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IBattingStats {
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  isOut: boolean;
}

export interface IBowlingStats {
  wickets: number;
  oversBowled: number;
  maidenOvers: number;
  runsConceded: number;
  dotBalls: number;
  /** Admin-flagged hat-trick (see scoring rules). */
  hasHattrick: boolean;
}

export interface IFieldingStats {
  catches: number;
  stumpings: number;
  runOuts: number;
  /** Shared-credit run-out assists. */
  assistedRunOuts: number;
}

export interface IPlayerMatchScore {
  player: Types.ObjectId;
  match: Types.ObjectId;
  Batting: IBattingStats;
  Bowling: IBowlingStats;
  Fielding: IFieldingStats;
  /** Selected as part of the playing XI for this match (+2 when true). */
  participated?: boolean;
  fantasyPoints: number;
}

export interface IPlayerMatchScoreDocument extends IPlayerMatchScore {
  _id: Types.ObjectId;
}

const BattingSchema = new Schema<IBattingStats>(
  {
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
  },
  { _id: false }
);

const BowlingSchema = new Schema<IBowlingStats>(
  {
    wickets: { type: Number, default: 0 },
    oversBowled: { type: Number, default: 0 },
    maidenOvers: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    dotBalls: { type: Number, default: 0 },
    hasHattrick: { type: Boolean, default: false },
  },
  { _id: false }
);

const FieldingSchema = new Schema<IFieldingStats>(
  {
    catches: { type: Number, default: 0 },
    stumpings: { type: Number, default: 0 },
    runOuts: { type: Number, default: 0 },
    assistedRunOuts: { type: Number, default: 0 },
  },
  { _id: false }
);

const PlayerMatchScoreSchema = new Schema<IPlayerMatchScore>(
  {
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    Batting: { type: BattingSchema, required: true },
    Bowling: { type: BowlingSchema, required: true },
    Fielding: { type: FieldingSchema, required: true },
    participated: { type: Boolean, default: false },
    fantasyPoints: { type: Number, required: true },
  },
  { timestamps: false }
);

PlayerMatchScoreSchema.index({ player: 1, match: 1 }, { unique: true });

export const PlayerMatchScore: Model<IPlayerMatchScore> =
  mongoose.models.PlayerMatchScore ??
  mongoose.model<IPlayerMatchScore>("PlayerMatchScore", PlayerMatchScoreSchema);
