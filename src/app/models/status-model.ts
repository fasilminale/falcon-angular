export class StatusModel{
  label = '';
  key = '';

  constructor(json?: any) {
    if (json?.label) { this.label = json.label; }
    if (json?.key) { this.key = json.key; }
  }

  public getLabel(): string {
    return `${this.label}`;
  }
}
