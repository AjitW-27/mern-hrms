import { Button as SharedButton } from "../common/UI";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const AuthInputField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  required = false,
  autoComplete,
  className = "",
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold tracking-wide text-slate-700 uppercase"
        >
          {label} {required && <span className="text-status-danger">*</span>}
        </label>
      )}

      <div className="relative rounded-[4px]">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`w-full block py-3 text-sm text-slate-900 bg-white border rounded-[4px] transition-colors duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? "pl-11" : "pl-4"
          } ${isPassword ? "pr-11" : "pr-4"} ${
            error
              ? "border-status-danger focus:border-status-danger focus:ring-status-danger/20"
              : "border-slate-200 focus:border-primary focus:ring-primary/20 hover:border-slate-300"
          }`}
        />

        {isPassword && (
          <SharedButton variant="ghost"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </SharedButton>
        )}
      </div>

      {error && (
        <p className="text-xs text-status-danger font-medium mt-1 flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default AuthInputField;

