import {ParamMap} from '@angular/router';

/**
 * Throw this error to easily set up default behavior for Fake services.
 */
export class NeedSpyError extends Error {
  constructor(public readonly interfaceName: string,
              public readonly methodName: string) {
    super(`${interfaceName}#${methodName} needs to be spied on for this test!`);
  }
}

/**
 * Either provide a map to the constructor or let it create one for you.
 * The internal map is then used to mock the ParamMap from angular/routes
 */
export class MockParamMap implements ParamMap {

  /**
   * public so that you can easily manipulate data during tests
   */
  public map: Map<string, string[]>;

  constructor(map?: Map<string, string[]>) {
    this.map = map ?? new Map();
  }

  get keys(): string[] {
    return Array.from(this.map.keys());
  }

  get(name: string): string | null {
    const result = this.getAll(name);
    return result.length >= 1
      ? result[0]
      : null;
  }

  getAll(name: string): string[] {
    return this.map.get(name) ?? [];
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

}
