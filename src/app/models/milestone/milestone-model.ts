import {KeyedLabel} from '../generic/keyed-label';

export interface Milestone {
  type: KeyedLabel;
  timestamp: string;
  user: string;
  comments: string;
}
