import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
}: FormSelectProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange) onChange(newValue)
    if (onValueChange) onValueChange(newValue)
  }

  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger>
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
    </div>
  )
}
