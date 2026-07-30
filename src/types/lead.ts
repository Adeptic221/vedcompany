export type LeadType = "car_request" | "callback";

export interface LeadPayload {
  type: LeadType;
  name: string;
  phone: string;
  message?: string;
  carId?: string;
  carLabel?: string;
  source?: string;
}

export interface LeadRecord extends LeadPayload {
  id: string;
  createdAt: string;
}

export interface LeadSubmitResult {
  success: boolean;
  id?: string;
  persisted?: boolean;
  error?: string;
}