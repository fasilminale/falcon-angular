export class StatusModel {
  private readonly statusLabel: string;
  private readonly milestoneLabel: string;
  private readonly key: string;

  constructor(json?: any) {
    this.statusLabel = json?.statusLabel ?? '';
    this.milestoneLabel = json?.milestoneLabel ?? '';
    this.key = json?.key ?? '';
  }

  public getStatusLabel(): string {
    return this.statusLabel;
  }

  public getMilestoneLabel(): string {
    return this.milestoneLabel;
  }

  public getKey(): string {
    return this.key;
  }

  public matches(key: string): boolean {
    return this.key === key;
  }
}
