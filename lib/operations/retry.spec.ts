import { delay } from './delay';
import { retry, retryWithOptions } from './retry';

describe('Retry with options', () => {
  it('should call function and return result if everything is ok', async () => {
    const func = () => Promise.resolve('ok');

    const result = await retryWithOptions({}, func)();

    expect(result).toEqual('ok');
  });

  it('is auto curried', async () => {
    const func = () => Promise.resolve('ok');

    const result = await retryWithOptions({})(func)();

    expect(result).toEqual('ok');
  });

  it('should forward provided arguments', async () => {
    const func = (message: string) => Promise.resolve(message);

    const result = await retryWithOptions({}, func)('ok');

    expect(result).toEqual('ok');
  });

  it('could call non-promise function', async () => {
    const func = () => 'ok';

    const result = await retryWithOptions({}, func)();

    expect(result).toEqual('ok');
  });

  it('should retry the provided times and return last error if no success', () => {
    let calls = 0;
    const func = () => {
      calls++;
      return Promise.reject(new Error('oh no :('));
    };

    const retrying = retryWithOptions({ count: 2 }, func)();

    return retrying.then(
      () => Promise.reject(new Error('should have failed')),
      (error: Error) => {
        expect(error).toEqual(new Error('oh no :('));
        expect(calls).toEqual(3);
      }
    );
  });

  it('should call on try error callback for each errors', () => {
    const messages: string[] = [];
    const onTryError = delay(50, (error: Error) => {
      messages.push(error.message);
    });
    let count = 0;
    const func = () => {
      count++;
      messages.push(`call ${count}`);
      return Promise.reject(new Error(`error ${count}`));
    };

    const retrying = retryWithOptions({ count: 2, onTryError }, func)();

    return retrying.then(
      () => Promise.reject(new Error('should have failed')),
      () => {
        expect(messages).toEqual([
          'call 1',
          'error 1',
          'call 2',
          'error 2',
          'call 3'
        ]);
      }
    );
  });

  it('should wait for on try error callback if it contains a promise', () => {
    const errors: Error[] = [];
    const onTryError = (error: Error) => {
      errors.push(error);
    };
    let count = 0;
    const func = () => {
      count++;
      return Promise.reject(new Error(`oh no :( ${count}`));
    };

    const retrying = retryWithOptions({ count: 2, onTryError }, func)();

    return retrying.then(
      () => Promise.reject(new Error('should have failed')),
      () => {
        expect(errors).toEqual([
          new Error('oh no :( 1'),
          new Error('oh no :( 2')
        ]);
      }
    );
  });

  it('should call on final error callback with last error', () => {
    let finalError: Error | null = null;
    const onFinalError = (error: Error) => {
      finalError = error;
    };
    let count = 0;
    const func = () => {
      count++;
      return Promise.reject(new Error(`oh no :( ${count}`));
    };

    const retrying = retryWithOptions({ count: 2, onFinalError }, func)();

    return retrying.then(
      () => Promise.reject(new Error('should have failed')),
      () => {
        expect(finalError).toEqual(new Error('oh no :( 3'));
      }
    );
  });

  it('should wait for final error callback if it contains a promise', () => {
    let callbackDone = false;
    const onFinalError = delay(50, () => {
      callbackDone = true;
    });
    const func = () => Promise.reject(new Error('oh no :('));

    const retrying = retryWithOptions({ count: 2, onFinalError }, func)();

    return retrying.then(
      () => Promise.reject(new Error('should have failed')),
      () => {
        expect(callbackDone).toBeTruthy();
      }
    );
  });

  it('should retry and eventually succeed', async () => {
    let calls = 0;
    const func = () => {
      calls++;
      if (calls > 1) {
        return Promise.resolve('ok');
      }
      return Promise.reject(new Error('oh no :('));
    };

    await retryWithOptions({ count: 10 }, func)();

    expect(calls).toEqual(2);
  });

  it('should forward arguments each try and eventually succeed', async () => {
    let calls = 0;
    const func = (message: string) => {
      calls++;
      if (calls > 1) {
        return Promise.resolve(message);
      }
      return Promise.reject(new Error('oh no :('));
    };

    const result = await retryWithOptions({ count: 10 }, func)('ok');

    expect(result).toEqual('ok');
  });
});

describe('Retry', () => {
  it('should call function and return result if everything is ok', async () => {
    const func = () => Promise.resolve('ok');

    const result = await retry(3, func)();

    expect(result).toEqual('ok');
  });

  it('is auto curried', async () => {
    const func = () => Promise.resolve('ok');

    const result = await retry(3)(func)();

    expect(result).toEqual('ok');
  });

  it('should retry the provided times and return last error if no success', () => {
    let calls = 0;
    const func = () => {
      calls++;
      return Promise.reject(new Error('oh no :('));
    };

    const retrying = retry(2, func)();

    return retrying.then(
      () => Promise.reject(new Error('should have failed')),
      (error: Error) => {
        expect(error).toEqual(new Error('oh no :('));
        expect(calls).toEqual(3);
      }
    );
  });
});
