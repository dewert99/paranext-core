import IDataProvider from '@shared/models/IDataProvider';
import dataProviderService from '@shared/services/DataProviderService';
import { useCallback, useMemo, useState } from 'react';
import useEvent from '@renderer/hooks/papi-hooks/useEvent';
import usePromise from '@renderer/hooks/papi-hooks/usePromise';
import { isString } from '@shared/util/Util';

/**
 * Gets a data provider with specified data type
 * @param dataType string data type to get data provider for
 * @returns undefined if the data provider has not been retrieved,
 *  data provider if it has been retrieved and is not disposed,
 *  and undefined again if the data provider is disposed
 *
 * @type `T` - the type of data provider to return. Use `IDataProvider<TSelector, TGetData, TSetData>`,
 *  specifying your own types, or provide a custom data provider type
 */
// User of this hook must provide types. Cannot use `unknown` here unfortunately because TypeScript would think
// we want the implementing IDataProvider types to be unknown as well
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDataProvider<T extends IDataProvider<any, any, any>>(
  dataType: string | undefined,
): T | undefined;
/**
 * Passes the provided data provider through. Used to support hooks that already have a dataProvider
 * @param dataProvider result of useDataProvider if you want this hook to just return the data provider again
 * @returns undefined if the data provider has not been retrieved,
 *  data provider if it has been retrieved and is not disposed,
 *  and undefined again if the data provider is disposed
 *
 * @type `T` - the type of data provider to return. Use `IDataProvider<TSelector, TGetData, TSetData>`,
 *  specifying your own types, or provide a custom data provider type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDataProvider<T extends IDataProvider<any, any, any>>(
  dataProvider: T | undefined,
): T | undefined;
/**
 * Gets a data provider with specified data type
 * @param dataProviderSource string data type to get data provider for OR dataProvider (result of useDataProvider if you
 * want this hook to just return the data provider again)
 * @returns undefined if the data provider has not been retrieved,
 *  data provider if it has been retrieved and is not disposed,
 *  and undefined again if the data provider is disposed
 *
 * @type `T` - the type of data provider to return. Use `IDataProvider<TSelector, TGetData, TSetData>`,
 *  specifying your own types, or provide a custom data provider type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDataProvider<T extends IDataProvider<any, any, any>>(
  dataProviderSource: string | T | undefined,
): T | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useDataProvider<T extends IDataProvider<any, any, any>>(
  dataProviderSource: string | T | undefined,
): T | undefined {
  // Check to see if they passed in the results of a useDataProvider hook or undefined
  const didReceiveDataProvider = !isString(dataProviderSource);

  // Get the data provider info for this data type
  // Note: do nothing if we received a data provider, but still run this hook. We must make sure to run the same number of hooks in all code paths)
  const [dataProviderInfo] = usePromise(
    useMemo(() => {
      return didReceiveDataProvider
        ? // We already have a data provider or undefined, so we don't need to run this promise
          undefined
        : async () =>
            // We have the data provider's type, so we need to get the provider
            dataProviderSource
              ? dataProviderService.get(dataProviderSource)
              : undefined;
    }, [didReceiveDataProvider, dataProviderSource]),
    undefined,
  );

  // Disable this hook when the data provider is disposed
  // Note: do nothing if we received a data provider, but still run this hook. We must make sure to run the same number of hooks in all code paths)
  const [isDisposed, setIsDisposed] = useState<boolean>(false);
  useEvent(
    !didReceiveDataProvider && dataProviderInfo && !isDisposed
      ? dataProviderInfo.onDidDispose
      : undefined,
    useCallback(() => setIsDisposed(true), []),
  );

  // If we received a data provider or undefined, return it
  if (didReceiveDataProvider) return dataProviderSource;

  // If we had to get a data provider, return it if it is not disposed
  return dataProviderInfo && !isDisposed
    ? // Type assert here - the user of this hook must make sure to provide the correct type
      (dataProviderInfo.dataProvider as T)
    : undefined;
}

export default useDataProvider;
