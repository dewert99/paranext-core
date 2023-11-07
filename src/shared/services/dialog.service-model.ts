import { DialogTabTypes, DialogTypes } from '@renderer/components/dialogs/dialog-definition.model';
import { DialogOptions } from '@shared/models/dialog-options.model';

/**
 * JSDOC SOURCE dialogService
 *
 * Prompt the user for responses with dialogs
 */
export interface DialogService {
  /**
   * Shows a dialog to the user and prompts the user to respond
   *
   * @type `TReturn` - The type of data the dialog responds with
   * @param dialogType The type of dialog to show the user
   * @param options Various options for configuring the dialog that shows
   * @returns Returns the user's response or `null` if the user cancels
   *
   *   Note: canceling responds with `null` instead of `undefined` so that the dialog definition can
   *   use `undefined` as a meaningful value if desired.
   */
  showDialog<DialogTabType extends DialogTabTypes>(
    dialogType: DialogTabType,
    options?: DialogTypes[DialogTabType]['options'],
  ): Promise<DialogTypes[DialogTabType]['responseType'] | null>;
  /**
   * Shows a select project dialog to the user and prompts the user to select a dialog
   *
   * @param options Various options for configuring the dialog that shows
   * @returns Returns the user's selected project id or `null` if the user cancels
   */
  selectProject(options?: DialogOptions): Promise<string | null>;
}

/** Prefix on requests that indicates that the request is related to dialog operations */
export const CATEGORY_DIALOG = 'dialog';
