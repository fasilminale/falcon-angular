import {StatusModel} from '../invoice/status-model';

export class MilestoneModel {
  private readonly status: StatusModel;
  private readonly timestamp: string;
  private readonly user: string;
  private readonly comments: string;

  constructor(json?: any) {
    this.status = json?.status
      ? new StatusModel(json.status)
      : new StatusModel();
    this.timestamp = json?.timestamp ?? '';
    this.user = json?.user ?? '';
    this.comments = json?.comments ?? '';
  }

  public getStatus(): StatusModel {
    return this.status;
  }

  public getTimestamp(): string {
    return this.timestamp;
  }

  public getUser(): string {
    return this.user;
  }

  public getComments(): string {
    return this.comments;
  }
}
