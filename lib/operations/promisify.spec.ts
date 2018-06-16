import { ErrorFirstCallback, promisify } from './promisify';

describe('Promisify', () => {
  describe('creates a function that', () => {
    it('should resolve the value in callback', () => {
      const func = (callback: ErrorFirstCallback) => {
        setTimeout(() => {
          callback(null, 'hello');
        });
      };

      const promisified = promisify(func);

      return promisified().then(result => {
        expect(result).toEqual('hello');
      });
    });

    it('should reject the error in callback', () => {
      const func = (callback: ErrorFirstCallback) => {
        setTimeout(() => {
          callback(new Error('bleh'));
        });
      };

      const promisified = promisify(func);

      return promisified().then(
        () => Promise.reject(new Error('Should fail')),
        rejection => expect(rejection.message).toEqual('bleh')
      );
    });
  });

  it('should pass all arguments to the created function', () => {
    const func = (arg1: string, arg2: string, callback: ErrorFirstCallback) => {
      setTimeout(() => {
        callback(null, [arg1, arg2]);
      });
    };

    const promisified = promisify(func);

    return promisified('hello', 'world').then(args => {
      expect(args).toEqual(['hello', 'world']);
    });
  });
});
