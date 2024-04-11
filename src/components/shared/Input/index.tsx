import React from "react";

import styles from "./input.module.css";

interface InputProps {
  fullWidth?: boolean;
  label: string;
  value: string;
  type?: "text" | "password";
  validation?: (value: string) => boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  fullWidth,
  label,
  value,
  type,
  validation,
  onChange,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className={styles.input_container}>
      <input
        value={value}
        onChange={onChange}
        placeholder={label}
        type={type || "text"}
        className={styles.input}
        onFocus={() => setIsFocused(true)}
        style={fullWidth ? { flex: 1 } : {}}
      />

      {isFocused && validation && !validation(value) && (
        <span className={styles.error}>Invalid {label}</span>
      )}
    </div>
  );
};
