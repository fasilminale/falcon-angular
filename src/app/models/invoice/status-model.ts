export interface Status {
  readonly statusLabel: string;
  readonly milestoneLabel: string;
  readonly key: string;
}

export class StatusModel implements Status {
  public readonly statusLabel: string;
  public readonly milestoneLabel: string;
  public readonly key: string;

  constructor(json?: any) {
    this.statusLabel = json?.statusLabel ?? '';
    this.milestoneLabel = json?.milestoneLabel ?? '';
    this.key = json?.key ?? '';
  }
}
