export interface AdminFranchise {
  _id: string;
  name: string;
  shortCode: string;
  logoUrl?: string;
}

export interface AdminMatchRow {
  _id: string;
  matchNumber: number;
  date: string;
  venue: string;
  isScored: boolean;
  franchiseA: AdminFranchise;
  franchiseB: AdminFranchise;
}
