import { TextField as MuiTextField } from '@mui/material';
import { Input as ShadInput } from '@/components/shadcn-ui/input';
import { Label as ShadLabel } from '@/components/shadcn-ui/label';
import { ChangeEventHandler, FocusEventHandler } from 'react';

export type TextFieldProps = {
  /** Optional unique identifier */
  id?: string;
  /**
   * If `true`, the component is disabled.
   *
   * @default false
   */
  isDisabled?: boolean;
  /**
   * If `true`, the label is displayed in an error state.
   *
   * @default false
   */
  hasError?: boolean;
  /** Text that gives the user instructions on what contents the TextField expects */
  helperText?: string;
  /** The title of the TextField */
  label?: string;
  /** The short hint displayed in the `input` before the user enters a value. */
  placeholder?: string;
  /**
   * If `true`, the label is displayed as required and the `input` element is required.
   *
   * @default false
   */
  isRequired?: boolean;
  /** Additional css classes to help with unique styling of the text field */
  className?: string;
  /** Starting value for the text field if it is not controlled */
  defaultValue?: unknown;
  /** Value of the text field if controlled */
  value?: unknown;
  /** Triggers when content of textfield is changed */
  onChange?: ChangeEventHandler<HTMLInputElement>;
  /** Triggers when textfield gets focus */
  onFocus?: FocusEventHandler<HTMLInputElement>;
  /** Triggers when textfield loses focus */
  onBlur?: FocusEventHandler<HTMLInputElement>;
};

/**
 * Text input field
 *
 * Thanks to MUI for heavy inspiration and documentation
 * https://mui.com/material-ui/getting-started/overview/
 */
function TextFieldM({
  id,
  isDisabled = false,
  hasError = false,
  helperText,
  label,
  placeholder,
  isRequired = false,
  className,
  defaultValue,
  value,
  onChange,
  onFocus,
  onBlur,
}: TextFieldProps) {
  return (
    <MuiTextField
      variant={variant}
      id={id}
      disabled={isDisabled}
      error={hasError}
      fullWidth={isFullWidth}
      helperText={helperText}
      label={label}
      placeholder={placeholder}
      required={isRequired}
      className={`papi-textfield ${className ?? ''}`}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

function TextField({
  id,
  isDisabled = false,
  hasError = false,
  helperText,
  label,
  placeholder,
  isRequired = false,
  className,
  defaultValue,
  value,
  onChange,
  onFocus,
  onBlur,
}: TextFieldProps) {
  return (
    <div className="pr-grid pr-w-full pr-max-w-sm pr-items-center pr-gap-1.5">
      <ShadLabel
        htmlFor={id}
        className={hasError ? 'pr-text-red-600' : ''}
      >{`${label}${isRequired ? '*' : ''}`}</ShadLabel>
      <ShadInput
        id={id}
        disabled={isDisabled}
        // fullWidth={isFullWidth}
        placeholder={placeholder}
        required={isRequired}
        className={`papi-textfield ${className ?? ''} ${hasError ? 'pr-border-red-600' : ''}`}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <p>{helperText}</p>
    </div>
  );
}

export default TextField;
