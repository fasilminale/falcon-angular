import {KeyedLabel} from '../generic/keyed-label';

export class StatusModel implements KeyedLabel {
  public readonly label: string;
  public readonly key: string;

  constructor(json?: any) {
    this.label = json?.label ?? '';
    this.key = json?.key ?? '';
  }
}
