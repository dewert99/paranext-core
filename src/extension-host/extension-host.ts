import '@extension-host/globalThis';
import { isClient } from '@shared/util/InternalUtil';
import * as NetworkService from '@shared/services/NetworkService';
import papi from '@shared/services/papi';
import { CommandHandler } from '@shared/util/PapiUtil';
import * as ExtensionService from '@extension-host/services/ExtensionService';
import logger from '@shared/util/logger';
import networkObjectService from '@shared/services/NetworkObjectService';

// #region Test logs

logger.log('Starting extension-host');
logger.log(`Extension host is${isClient() ? '' : ' not'} client`);
logger.log(`Extension host process.type = ${process.type}`);
logger.log(`Extension host process.env.NODE_ENV = ${process.env.NODE_ENV}`);
logger.warn('Extension host example warning');

// #endregion

// #region Services setup

const commandHandlers: { [commandName: string]: CommandHandler } = {
  addMany: async (...nums: number[]) => {
    /* const start = performance.now(); */
    /* const result = await papi.commands.sendCommand('addThree', 1, 4, 9); */
    /* logger.log(
      `addThree(...) = ${result} took ${performance.now() - start} ms`,
    ); */
    return nums.reduce((acc, current) => acc + current, 0);
  },
  throwErrorExtensionHost: async (message: string) => {
    throw new Error(
      `Test Error thrown in throwErrorExtensionHost command: ${message}`,
    );
  },
  getResourcesPath: async () => globalThis.resourcesPath,
};

NetworkService.initialize()
  .then(() => {
    // Set up test handlers
    Object.entries(commandHandlers).forEach(([commandName, handler]) => {
      papi.commands.registerCommand(commandName, handler);
    });

    // TODO: Probably should return Promise.all of these registrations
    return undefined;
  })
  .catch(logger.error);

// Need to wait a bit to initialize extensions in production because the extension host launches faster than the renderer.
// TODO: Fix this so we can await renderer connecting event or something
setTimeout(
  () => {
    ExtensionService.initialize();
  },
  globalThis.isPackaged ? 3000 : 0,
);

// #endregion

// #region network object test

(async () => {
  let testMain = await networkObjectService.get<{
    doStuff: (stuff: string) => Promise<string>;
  }>('test-main');
  testMain?.onDidDispose(async () => {
    logger.log('Disposed of test-main!');
    testMain = undefined;

    const unsubTestEH = await networkObjectService.set('test-extension-host', {
      getVerse: async () => {
        const results = `test-extension-host got verse: ${(
          await (await fetch('https://bible-api.com/matthew+24:14')).json()
        ).text.replace(/\\n/g, '')}`;
        logger.log(results);
        return results;
      },
    });

    const testEH = await networkObjectService.get('test-extension-host');
    testEH?.onDidDispose(() => logger.log('Disposed of test-extension-host!'));

    setTimeout(unsubTestEH, 10000);
  });

  logger.log(
    await Promise.resolve(
      `do stuff: ${testMain?.doStuff('extension host things')}`,
    ),
  );
})();

// #endregion
