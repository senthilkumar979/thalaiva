import mongoose, { Schema, type Model, type Types } from "mongoose";

export interface IFranchise {
  name: string;
  shortCode: string;
  logoUrl: string;
}

export interface IFranchiseDocument extends IFranchise {
  _id: Types.ObjectId;
}

const FranchiseSchema = new Schema<IFranchise>(
  {
    name: { type: String, required: true, trim: true },
    shortCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    logoUrl: { type: String, default: "" },
  },
  { timestamps: false }
);

export const Franchise: Model<IFranchise> =
  mongoose.models.Franchise ?? mongoose.model<IFranchise>("Franchise", FranchiseSchema);
