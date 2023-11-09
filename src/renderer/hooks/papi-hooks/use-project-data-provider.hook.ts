import { papiFrontendProjectDataProviderService } from '@shared/services/project-data-provider.service';
import { ProjectTypes, ProjectDataTypes } from 'papi-shared-types';
import createUseNetworkObjectHook from '@renderer/hooks/hook-generators/create-use-network-object-hook.util';
import IDataProvider from '@shared/models/data-provider.interface';

/**
 * Takes the parameters passed into the hook and returns the `projectDataProviderSource` associated
 * with those parameters.
 *
 * @param projectType Indicates what you expect the `projectType` to be for the project with the
 *   specified id. The TypeScript type for the returned project data provider will have the project
 *   data provider type associated with this project type. If this argument does not match the
 *   project's actual `projectType` (according to its metadata), a warning will be logged
 * @param projectDataProviderSource String name of the id of the project to get OR
 *   projectDataProvider (result of useProjectDataProvider, if you want this hook to just return the
 *   data provider again)
 * @returns `projectDataProviderSource` for getting the project data provider
 */
function mapParametersToProjectDataProviderSource<ProjectType extends ProjectTypes>(
  _projectType: ProjectType,
  projectDataProviderSource: string | IDataProvider<ProjectDataTypes[ProjectType]> | undefined,
) {
  return projectDataProviderSource;
}

/**
 * Gets a project data provider with specified provider name
 *
 * @param projectType Indicates what you expect the `projectType` to be for the project with the
 *   specified id. The TypeScript type for the returned project data provider will have the project
 *   data provider type associated with this project type. If this argument does not match the
 *   project's actual `projectType` (according to its metadata), a warning will be logged
 * @param projectDataProviderSource String name of the id of the project to get OR
 *   projectDataProvider (result of useProjectDataProvider, if you want this hook to just return the
 *   data provider again)
 * @returns `undefined` if the project data provider has not been retrieved, the requested project
 *   data provider if it has been retrieved and is not disposed, and undefined again if the project
 *   data provider is disposed
 */

// Assert to specific data type for this hook.
// eslint-disable-next-line no-type-assertion/no-type-assertion
const useProjectDataProvider = createUseNetworkObjectHook(
  papiFrontendProjectDataProviderService.getProjectDataProvider,
  mapParametersToProjectDataProviderSource,
) as <ProjectType extends ProjectTypes>(
  projectType: ProjectType,
  projectDataProviderSource: string | IDataProvider<ProjectDataTypes[ProjectType]> | undefined,
) => IDataProvider<ProjectDataTypes[ProjectType]> | undefined;

export default useProjectDataProvider;
