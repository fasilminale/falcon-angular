import {Status} from '../invoice/status-model';

export interface Milestone {
  status: Status;
  timestamp: string;
  user: string;
  comments: string;
}
