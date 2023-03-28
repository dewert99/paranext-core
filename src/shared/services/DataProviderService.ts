/**
 * Handles registering data providers and serving data around the papi.
 * Exposed on the papi.
 */

import {
  DataProviderInfo,
  DisposableDataProviderInfo,
} from '@shared/models/DataProviderInfo';
import IDataProvider from '@shared/models/IDataProvider';
import IDataProviderEngine from '@shared/models/IDataProviderEngine';
import * as NetworkService from '@shared/services/NetworkService';
import networkObjectService from './NetworkObjectService';

/** Suffix on network objects that indicates that the network object is a data provider */
const DATA_PROVIDER_LABEL = 'data';

/** Builds the id for the data provider network object of the specified type */
const buildDataProviderObjectId = (dataType: string) =>
  `${dataType}-${DATA_PROVIDER_LABEL}`;

/** Whether this service has finished setting up */
let isInitialized = false;

/** Promise that resolves when this service is finished initializing */
let initializePromise: Promise<void> | undefined;

/** Sets up the service. Only runs once and always returns the same promise after that */
const initialize = () => {
  if (initializePromise) return initializePromise;

  initializePromise = (async (): Promise<void> => {
    if (isInitialized) return;

    // TODO: Might be best to make a singleton or something
    await NetworkService.initialize();

    isInitialized = true;
  })();

  return initializePromise;
};

/** Determine if a data provider with the provided type exists anywhere on the network */
async function has(dataType: string): Promise<boolean> {
  await initialize();

  return networkObjectService.has(buildDataProviderObjectId(dataType));
}

/**
 * Wrap a data provider engine to create a data provider that handles subscriptions for it
 * @param dataProviderEngine provider engine that handles setting and getting data as well as informing which listeners should get what updates
 * @returns data provider layering over the provided data provider engine
 */
function buildDataProvider<TSelector, TData>(
  dataProviderEngine: IDataProviderEngine<TSelector, TData>,
): IDataProvider<TSelector, TData> {
  return {
    set: dataProviderEngine.set.bind(dataProviderEngine),
    get: dataProviderEngine.get.bind(dataProviderEngine),
    subscribe: async (selector, callback) => {
      return async () => false;
    },
  };
}

/**
 * Creates a data provider to be shared on the network layering over the provided data provider engine.
 * @param dataType type of data that this provider serves
 * @param dataProviderEngine the object to layer over with a new data provider object
 * @returns information about the data provider including control over disposing of it.
 *  Note that this data provider is a new object distinct from the data provider engine passed in.
 * @type `TSelector` - the type of selector used to get some data from this provider.
 *  A selector is an object a caller provides to the data provider to tell the provider what subset of data it wants.
 *  Note: A selector must be stringifiable.
 * @type `TData` - the type of data provided by this data provider based on a provided selector
 */
async function registerEngine<TSelector, TData>(
  dataType: string,
  dataProviderEngine: IDataProviderEngine<TSelector, TData>,
): Promise<DisposableDataProviderInfo<TSelector, TData>> {
  await initialize();
  if (await has(dataType))
    throw new Error(
      `Data provider with type ${dataType} is already registered`,
    );

  // Validate that the data provider engine has what it needs
  // TODO: maybe we can require fewer of these functions and let people implement IDataProviderEngine with a smaller footprint?
  if (!dataProviderEngine.get || typeof dataProviderEngine.get !== 'function')
    throw new Error('Data provider engine does not have a get function');
  if (!dataProviderEngine.set || typeof dataProviderEngine.set !== 'function')
    throw new Error('Data provider engine does not have a set function');
  if (
    !dataProviderEngine.generateUpdates ||
    typeof dataProviderEngine.generateUpdates !== 'function'
  )
    throw new Error(
      'Data provider engine does not have a generateUpdates function',
    );

  const dataProvider = buildDataProvider(dataProviderEngine);

  const networkObjectInfo = await networkObjectService.set(
    buildDataProviderObjectId(dataType),
    dataProvider,
  );

  return {
    dataProvider: networkObjectInfo.networkObject,
    dispose: networkObjectInfo.dispose,
    onDidDispose: networkObjectInfo.onDidDispose,
  };
}

/**
 * Get a data provider that has previously been set up
 * @param dataType type of data that this provider serves
 * @returns information about the data provider with the specified type if one exists, undefined otherwise
 * @type `TSelector` - the type of selector used to get some data from this provider.
 *  A selector is an object a caller provides to the data provider to tell the provider what subset of data it wants.
 *  Note: A selector must be stringifiable.
 * @type `TData` - the type of data provided by this data provider based on a provided selector
 */
async function get<TSelector, TData>(
  dataType: string,
): Promise<DataProviderInfo<TSelector, TData> | undefined> {
  await initialize();

  const networkObjectInfo = await networkObjectService.get<
    IDataProvider<TSelector, TData>
  >(buildDataProviderObjectId(dataType));

  if (!networkObjectInfo) return undefined;

  return {
    dataProvider: networkObjectInfo.networkObject,
    onDidDispose: networkObjectInfo.onDidDispose,
  };
}

const dataProviderService = {
  has,
  registerEngine,
  get,
};

export default dataProviderService;
