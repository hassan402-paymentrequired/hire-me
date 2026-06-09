import * as React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Search, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { InboxIcon } from '@heroicons/react/24/solid'
import { useIsMobile } from '@/hooks/use-mobile'

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

function SearchableSelectOptions({
  filteredOptions,
  emptyMessage,
  onSelect,
}: {
  filteredOptions: Array<{ value: string; label: string }>
  emptyMessage: string
  onSelect: (value: string) => void
}) {
  if (filteredOptions.length === 0) {
    return (
      <div className="py-6 text-center text-sm flex flex-col text-muted-foreground">
        <InboxIcon className="mx-auto mb-1 h-6 w-6" />
        <span className="font-heading">{emptyMessage}</span>
      </div>
    )
  }

  return (
    <>
      {filteredOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className="flex w-full items-center rounded-sm px-3 py-2.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted active:bg-muted"
        >
          {option.label}
        </button>
      ))}
    </>
  )
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
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchInputRef = React.useRef<HTMLInputElement>(null)

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

  const selectedOption = options.find((opt) => opt.value === value)

  const handleValueChange = (newValue: string) => {
    if (onChange) onChange(newValue)
    if (onValueChange) onValueChange(newValue)
    setOpen(false)
    setSearchQuery("")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearchQuery("")
    }
  }

  // Desktop only: focus search when dropdown opens. On mobile, autofocus
  // fights the virtual keyboard and causes the sheet/popover to collapse.
  React.useEffect(() => {
    if (!open || isMobile || !searchInputRef.current) {
      return
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)

    return () => window.clearTimeout(timer)
  }, [open, isMobile])

  const labelNode = label ? (
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
  ) : null

  const searchField = (
    <div className="flex items-center border-b px-3 py-2">
      <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      <Input
        ref={searchInputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
        onKeyDown={(e) => {
          e.stopPropagation()
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
            if (!isMobile) {
              searchInputRef.current?.focus()
            }
          }}
          className="ml-2 p-1 hover:bg-muted rounded-sm transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )

  if (isMobile) {
    const sheetTitle =
      typeof label === 'string'
        ? label.replace(/\*$/, '').trim()
        : 'Select an option'

    return (
      <div className={cn("space-y-1.5", className)}>
        {labelNode}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground flex h-10 w-full min-w-0 items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive",
            !selectedOption && "text-muted-foreground",
          )}
        >
          <span className="truncate text-left">
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </button>

        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden rounded-t-2xl border-t p-0"
          >
            <SheetHeader className="border-b px-4 py-3 text-left">
              <SheetTitle className="text-base">{sheetTitle}</SheetTitle>
            </SheetHeader>

            {searchField}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <SearchableSelectOptions
                filteredOptions={filteredOptions}
                emptyMessage={emptyMessage}
                onSelect={handleValueChange}
              />
            </div>
          </SheetContent>
        </Sheet>

        {error && (
          <p className="text-xs text-destructive mt-1">{error}</p>
        )}
      </div>
    )
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      {labelNode}
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        disabled={disabled}
        required={required}
        open={open}
        onOpenChange={handleOpenChange}
      >
        <SelectTrigger
          className={cn(
            "h-10",
            error && "border-destructive rounded"
          )}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption?.label || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="p-0">
          <div className="flex items-center border shadow-none rounded px-3 py-2 sticky top-0 bg-background z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              onKeyDown={(e) => {
                e.stopPropagation()
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

          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <div className="py-6 text-center text-sm flex flex-col text-muted-foreground">
                <InboxIcon className="mx-auto mb-1 h-6 w-6" />
                <span className="font-heading">{emptyMessage}</span>
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
