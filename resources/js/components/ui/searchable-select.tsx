import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchableSelectProps {
  label?: string | React.ReactNode
  options: Array<{ value: string; label: string }>
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onValueChange?: (value: string) => void
  required?: boolean
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  error?: string
  emptyMessage?: string
}

export function SearchableSelect({
  label,
  options,
  value,
  defaultValue,
  onChange,
  onValueChange,
  required = false,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  className,
  error,
  emptyMessage = "No results found",
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return options
    }
    const query = searchQuery.toLowerCase()
    return options.filter((option) =>
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value)

  const handleValueChange = (newValue: string) => {
    if (onChange) onChange(newValue)
    if (onValueChange) onValueChange(newValue)
    setOpen(false)
    setSearchQuery("") // Clear search on selection
  }

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open && searchInputRef.current) {
      // Small delay to ensure the input is rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      // Clear search when dropdown closes
      setSearchQuery("")
    }
  }, [open])

  return (
    <div className={className}>
      {label && (
        <Label className={cn("text-sm font-medium", error && "text-destructive")}>
          {typeof label === 'string' ? (
            <>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </>
          ) : (
            label
          )}
        </Label>
      )}
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger 
          className={cn(
            "h-10",
            error && "border-destructive"
          )}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption?.label || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="p-0">
          {/* Search Input */}
          <div className="flex items-center border-b px-3 py-2 sticky top-0 bg-background z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              onKeyDown={(e) => {
                // Prevent closing dropdown when typing
                e.stopPropagation()
                // Close on Escape
                if (e.key === "Escape") {
                  setOpen(false)
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setSearchQuery("")
                  searchInputRef.current?.focus()
                }}
                className="ml-2 p-1 hover:bg-muted rounded-sm transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  )
}
