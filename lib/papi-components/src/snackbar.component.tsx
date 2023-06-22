import { Snackbar as MuiSnackbar, SnackbarCloseReason, SnackbarOrigin } from '@mui/material';
import { SyntheticEvent, ReactElement, ReactNode } from 'react';
import './snackbar.component.css';

export type CloseReason = SnackbarCloseReason;
export type AnchorOrigin = SnackbarOrigin;

export type SnackbarContentProps = {
  /**
   * The action to display, renders after the message
   */
  action?: ReactNode;

  /**
   * The message to display
   */
  message?: ReactNode;

  /**
   * Additional css classes to help with unique styling of the snackbar, internal
   */
  className?: string;
};

export type SnackbarProps = {
  /**
   * If true, the component is shown
   * @default false
   */
  isOpen?: boolean;

  /**
   * The number of milliseconds to wait before automatically calling onClose()
   * @default null
   */
  autoHideDuration?: number | null;

  /**
   * Additional css classes to help with unique styling of the snackbar, external
   */
  className?: string;

  /**
   * Optional, used to control the open prop
   * event: Event | SyntheticEvent<Element, Event>, reason: string
   */
  onClose?: (event: SyntheticEvent<any> | Event, reason: CloseReason) => void;

  /**
   * The anchor of the `Snackbar`.
   * the horizontal alignment is ignored.
   * @default vertical: 'bottom', horizontal: 'left'
   */
  anchorOrigin?: AnchorOrigin;

  /**
   * Replace the `SnackbarContent` component.
   */
  children?: ReactElement<any, any>;

  ContentProps?: SnackbarContentProps;
};

/**
 * Snackbar that provides brief notifications
 *
 * Thanks to MUI for heavy inspiration and documentation
 * https://mui.com/material-ui/getting-started/overview/
 */
function Snackbar({
  autoHideDuration = null,
  isOpen = false,
  className,
  onClose,
  anchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  ContentProps = {
    action: '',
    message: '',
    className: `papi-snackbar ${className ?? ''}`,
  },
  children,
}: SnackbarProps) {
  const snackbar = (
    <MuiSnackbar
      autoHideDuration={autoHideDuration}
      className={`papi-snackbar ${className ?? ''}`}
      open={isOpen}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      ContentProps={ContentProps}
    >
      {children}
    </MuiSnackbar>
  );
  return snackbar;
}

export default Snackbar;