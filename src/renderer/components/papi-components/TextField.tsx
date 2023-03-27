﻿import { TextField as MuiTextField } from '@mui/material';

type TextFieldProps = {
  /**
   * The variant to use.
   * @default 'outlined'
   */
  variant?: 'outlined' | 'filled';
  /**
   * If `true`, the component is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * If `true`, the label is displayed in an error state.
   * @default false
   */
  hasError?: boolean;
  /**
   * If `true`, the input will take up the full width of its container.
   * @default false
   */
  isFullWidth?: boolean;
  /**
   * Text that gives the user instructions on what contents the TextField expects
   */
  helperText?: string;
  /**
   * The title of the TextField
   */
  label?: string;
  /**
   * The short hint displayed in the `input` before the user enters a value.
   */
  placeholder?: string;
  /**
   * If `true`, the label is displayed as required and the `input` element is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Additional css classes to help with unique styling of the button
   */
  className?: string;
  /**
   * Triggers when content of textfield is changed
   */
  onChange?: () => void;
  /**
   * Triggers when textfield gets focus
   */
  onFocus?: () => void;
  /**
   * Triggers when textfield loses focus
   */
  onBlur?: () => void;
};

function TextField({
  variant = 'outlined',
  isDisabled = false,
  hasError = false,
  isFullWidth = false,
  helperText,
  label,
  placeholder,
  isRequired = false,
  className,
  onChange,
  onFocus,
  onBlur,
}: TextFieldProps) {
  return (
    <MuiTextField
      variant={variant}
      disabled={isDisabled}
      error={hasError}
      fullWidth={isFullWidth}
      helperText={helperText}
      label={label}
      placeholder={placeholder}
      required={isRequired}
      className={`papi-textfield ${className ?? ''}`}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
}

export default TextField;
