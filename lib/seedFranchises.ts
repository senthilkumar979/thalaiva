import { Franchise } from "@/models/Franchise";

const IPL_FRANCHISES = [
  { name: "Chennai Super Kings", shortCode: "CSK", logoUrl: "" },
  { name: "Mumbai Indians", shortCode: "MI", logoUrl: "" },
  { name: "Royal Challengers Bengaluru", shortCode: "RCB", logoUrl: "" },
  { name: "Kolkata Knight Riders", shortCode: "KKR", logoUrl: "" },
  { name: "Delhi Capitals", shortCode: "DC", logoUrl: "" },
  { name: "Punjab Kings", shortCode: "PBKS", logoUrl: "" },
  { name: "Rajasthan Royals", shortCode: "RR", logoUrl: "" },
  { name: "Sunrisers Hyderabad", shortCode: "SRH", logoUrl: "" },
  { name: "Gujarat Titans", shortCode: "GT", logoUrl: "" },
  { name: "Lucknow Super Giants", shortCode: "LSG", logoUrl: "" },
] as const;

export async function seedFranchisesIfEmpty(): Promise<number> {
  const count = await Franchise.countDocuments();
  if (count > 0) return 0;
  await Franchise.insertMany(IPL_FRANCHISES.map((f) => ({ ...f })));
  return IPL_FRANCHISES.length;
}
