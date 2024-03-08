import { ASSET_STATUS } from '../assets/constants';

export type User = {
  role?: number;
  id: string;
  username: string;
};

export interface IUser {
  username: string;
  password: string;
}

export type ErrorField = {
  field: string;
  value: string;
  error: string | null;
};

type AssetType = 'Hardware fault' | 'Software fault' | 'Other';

export type Session = {
  update?: {
    name?: string;
    code?: string;
    type?: AssetType;
    note?: string;
    status?: ASSET_STATUS;
    closed?: boolean;
    updated?: boolean;
  };
  errorFields?: ErrorField[];
  messages?: string[];
  msgTone?: 'positive' | string;
  asset?: AssetPayload;
};

export type AssetPayload = {
  name?: string;
  code?: string;
  type?: AssetType;
  note?: string;
};
