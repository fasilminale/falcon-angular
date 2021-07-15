
/**
 * Throw this error to easily set up default behavior for Fake services.
 */
export class NeedSpyError extends Error {
  constructor(public readonly interfaceName: string,
              public readonly methodName: string) {
    super(`${interfaceName}#${methodName} needs to be spied on for this test!`);
  }
}
