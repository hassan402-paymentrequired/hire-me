import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';

interface FormSelectProps {
  label?: string
  options: Array<{ value: string; label: string }>
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
  required?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
}

export function FormSelect({
  label,
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  required = false,
  placeholder = "Select...",
  disabled = false,
  className,
  error,
}: FormSelectProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange) onChange(newValue)
    if (onValueChange) onValueChange(newValue)
  }

  return (
    <div className={className}>
      {label && (
        <Label className={error ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger className={error ? "border-destructive" : ""}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm font-medium text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}
