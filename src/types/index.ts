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

export type Session = {
  update?: {
    name?: string;
    code?: string;
    type?: string;
    note?: string;
    status?: ASSET_STATUS;
    closed?: boolean;
    updated?: boolean;
  };
  errorFields?: object; // todo: type
  messages?: string[];
  msgTone?: 'positive' | string;
  asset?: AssetPayload;
};

export type AssetPayload = {
  name?: string;
  code?: string;
  type?: string;
  note?: string;
};
