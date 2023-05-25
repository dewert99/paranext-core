import {
  DataProviderDataType,
  DataProviderSubscriberOptions,
  DataProviderUpdateInstructions,
} from '@shared/models/data-provider.model';
import IDataProvider from '@shared/models/data-provider.interface';
import useEventAsync from '@renderer/hooks/papi-hooks/use-event-async.hook';
import { useMemo, useState } from 'react';
import { PapiEventAsync, PapiEventHandler } from '@shared/models/papi-event.model';
import useDataProvider from '@renderer/hooks/papi-hooks/use-data-provider.hook';
import { isString } from '@shared/utils/util';

type UseDataHook = {
  /**
   * Special React hook that subscribes to run a callback on a data provider's data with specified
   * selector on any data type that data provider serves.
   *
   * Usage: Specify the data type on the data provider with `useData.<data_type>` and use like any other
   * React hook. For example, `useData.Verse` lets you subscribe to verses from a data provider.
   *
   * @example When subscribing to John 11:35 on the `'quick-verse.quick-verse'` data provider, we need
   * to tell the useData.Verse hook what types we are using, so we get the Verse data types from the
   * quick verse data types as follows:
   * ```typescript
   * const [verseText, setVerseText, verseTextIsLoading] = useData.Verse<QuickVerseDataTypes['Verse']>(
   *   'quick-verse.quick-verse',
   *   'John 11:35',
   *   'Verse text goes here',
   * );
   * ```
   *
   * @param dataProviderSource string name of data provider to get OR dataProvider (result of useDataProvider if you
   * want to consolidate and only get the data provider once)
   * @param selector tells the provider what data this listener is listening for
   * @param defaultValue the initial value to return while first awaiting the data
   *
   *    WARNING: MUST BE STABLE - const or wrapped in useState, useMemo, etc. The reference must not be updated every render
   * @param subscriberOptions various options to adjust how the subscriber emits updates
   *
   *    WARNING: If provided, MUST BE STABLE - const or wrapped in useState, useMemo, etc. The reference must not be updated every render
   * @returns [data, setData, isLoading]
   *  - `data`: the current value for the data from the data provider with the specified data type and selector, either the defaultValue or the resolved data
   *  - `setData`: asynchronous function to request that the data provider update the data at this data type and selector. Returns true if successful.
   *    Note that this function does not update the data. The data provider sends out an update to this subscription if it successfully updates data.
   *  - `isLoading`: whether the data with the data type and selector is awaiting retrieval from the data provider
   */
  [DataType: string]: <TDataType extends DataProviderDataType>(
    // Seems TypeScript doesn't like using a generic string to index DataProviderDataTypes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataProviderSource: string | IDataProvider<any> | undefined,
    selector: TDataType['selector'],
    defaultValue: TDataType['getData'],
    subscriberOptions?: DataProviderSubscriberOptions,
  ) => [
    TDataType['getData'],
    // We don't know the data types available, so we can't have TypeScript checking here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((newData: TDataType['setData']) => Promise<DataProviderUpdateInstructions<any>>) | undefined,
    boolean,
  ];
};

function createUseDataHook(dataType: string) {
  return <TDataType extends DataProviderDataType>(
    // Seems TypeScript doesn't like using a generic string to index DataProviderDataTypes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataProviderSource: string | IDataProvider<any> | undefined,
    selector: TDataType['selector'],
    defaultValue: TDataType['getData'],
    subscriberOptions?: DataProviderSubscriberOptions,
  ): [
    TDataType['getData'],
    // We don't know the data types available, so we can't have TypeScript checking here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((newData: TDataType['setData']) => Promise<DataProviderUpdateInstructions<any>>) | undefined,
    boolean,
  ] => {
    // The data from the data provider at this selector
    const [data, setDataInternal] = useState<TDataType['getData']>(defaultValue);

    // Get the data provider for this data provider name
    // Seems TypeScript doesn't like using a generic string to index DataProviderDataTypes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataProvider = useDataProvider<IDataProvider<any>>(dataProviderSource);

    // Indicates if the data with the selector is awaiting retrieval from the data provider
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Wrap subscribe so we can call it as a normal PapiEvent in useEvent
    const wrappedSubscribeEvent: PapiEventAsync<TDataType['getData']> | undefined = useMemo(
      () =>
        dataProvider
          ? async (eventCallback: PapiEventHandler<TDataType['getData']>) => {
              const unsub = await dataProvider[
                `subscribe${dataType as keyof typeof dataProviderSource}`
              ](
                selector,
                (subscriptionData: TDataType['getData']) => {
                  eventCallback(subscriptionData);
                  // When we receive updated data, mark that we are not loading
                  setIsLoading(false);
                },
                subscriberOptions,
              );

              return async () => {
                // When we change data type or selector, mark that we are loading
                setIsLoading(true);
                return unsub();
              };
            }
          : undefined,
      [dataProvider, selector, subscriberOptions],
    );

    // Subscribe to the data provider
    useEventAsync(wrappedSubscribeEvent, setDataInternal);

    // TODO: cache latest setStateAction and fire until we have dataProvider instead of having setData be undefined until we have dataProvider?
    /** Send an update to the backend to update the data. Let the update handle actually updating our data here */
    const setData = useMemo(
      () =>
        dataProvider
          ? async (newData: TDataType['setData']) =>
              dataProvider[`set${dataType as keyof typeof dataProviderSource}`](selector, newData)
          : undefined,
      [dataProvider, selector],
    );

    return [data, setData, isLoading];
  };
}

// People can make whatever data hook they want
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useDataCachedHooks: UseDataHook = {};

/**
 * Special React hook that subscribes to run a callback on a data provider's data with specified
 * selector on any data type that data provider serves.
 *
 * Usage: Specify the data type on the data provider with `useData.<data_type>` and use like any other
 * React hook. For example, `useData.Verse` lets you subscribe to verses from a data provider.
 *
 * @example When subscribing to John 11:35 on the `'quick-verse.quick-verse'` data provider, we need
 * to tell the useData.Verse hook what types we are using, so we get the Verse data types from the
 * quick verse data types as follows:
 * ```typescript
 * const [verseText, setVerseText, verseTextIsLoading] = useData.Verse<QuickVerseDataTypes['Verse']>(
 *   'quick-verse.quick-verse',
 *   'John 11:35',
 *   'Verse text goes here',
 * );
 * ```
 *
 * @param dataProviderSource string name of data provider to get OR dataProvider (result of useDataProvider if you
 * want to consolidate and only get the data provider once)
 * @param selector tells the provider what data this listener is listening for
 * @param defaultValue the initial value to return while first awaiting the data
 *
 *    WARNING: MUST BE STABLE - const or wrapped in useState, useMemo, etc. The reference must not be updated every render
 * @param subscriberOptions various options to adjust how the subscriber emits updates
 *
 *    WARNING: If provided, MUST BE STABLE - const or wrapped in useState, useMemo, etc. The reference must not be updated every render
 * @returns [data, setData, isLoading]
 *  - `data`: the current value for the data from the data provider with the specified data type and selector, either the defaultValue or the resolved data
 *  - `setData`: asynchronous function to request that the data provider update the data at this data type and selector. Returns true if successful.
 *    Note that this function does not update the data. The data provider sends out an update to this subscription if it successfully updates data.
 *  - `isLoading`: whether the data with the data type and selector is awaiting retrieval from the data provider
 */
const useData: UseDataHook = new Proxy(useDataCachedHooks, {
  get(obj, prop) {
    // Pass promises through
    if (prop === 'then') return obj[prop as keyof typeof obj];

    // Special react prop to tell if it's a component
    if (prop === '$$typeof') return undefined;

    // If we have already generated the hook, return the cached version
    if (prop in useDataCachedHooks)
      return useDataCachedHooks[prop as keyof typeof useDataCachedHooks];

    // Build a new useData hook
    if (!isString(prop)) throw new Error('Must provide a string to the useData hook proxy');

    const newHook = createUseDataHook(prop);

    // Save the hook in the cache to be used later
    useDataCachedHooks[prop as keyof typeof useDataCachedHooks] = newHook;

    return newHook;
  },
  set() {
    // Doing this makes no sense
    throw new Error('Cannot set useData hook');
  },
});

export default useData;
