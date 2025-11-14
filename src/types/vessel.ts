export type VesselStatus = 'Active' | 'Under Maintenance';

export interface Vessel {
  _id: string;
  name: string;
  imo: string;
  flag: string;
  type: string;
  status: VesselStatus;
  lastInspectionDate?: string;
  openIssuesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVesselData {
  name: string;
  imo: string;
  flag: string;
  type: string;
  status?: VesselStatus;
  lastInspectionDate?: string;
}

export interface UpdateVesselData extends Partial<CreateVesselData> {}

