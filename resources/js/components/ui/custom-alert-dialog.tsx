/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CustomAlertDialogProps {
    /** Whether the dialog is open */
    open: boolean
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void
    /** Icon to display at the top (ReactNode) */
    icon?: any
    /** Title text */
    title: string
    /** Description text */
    description: string
    /** Label for the accept/primary button */
    acceptLabel: string
    /** Label for the reject/secondary button */
    rejectLabel?: string
    /** Callback when accept button is clicked */
    onAccept: () => void
    /** Callback when reject button is clicked */
    onReject?: () => void
    /** Custom className for the content */
    className?: string
    /** Variant for accept button */
    acceptVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    /** Variant for reject button */
    rejectVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    /** Show reject button (default: true) */
    showReject?: boolean
}

/**
 * Custom Alert Dialog Component
 * 
 * A reusable alert dialog component that matches the design pattern
 * with icon, title, description, and two action buttons.
 * 
 * @example
 * ```tsx
 * <CustomAlertDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   icon={<MapPin className="size-12 text-green-500" />}
 *   title="Enable Location Services"
 *   description="We need your location to show you nearby service providers and give you the best experience."
 *   acceptLabel="Allow Location"
 *   rejectLabel="Not Now"
 *   onAccept={() => requestLocation()}
 *   onReject={() => setIsOpen(false)}
 * />
 * ```
 */
export function CustomAlertDialog({
    open,
    onOpenChange,
    icon,
    title,
    description,
    acceptLabel,
    rejectLabel = "Cancel",
    onAccept,
    onReject,
    className,
    acceptVariant = "default",
    rejectVariant = "outline",
    showReject = true,
}: CustomAlertDialogProps) {
    const handleAccept = () => {
        onAccept()
        onOpenChange(false)
    }

    const handleReject = () => {
        if (onReject) {
            onReject()
        }
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                className={cn(
                    "sm:max-w-md p-6 rounded-lg border-none shadow-lg",
                    className
                )}
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    {/* Icon */}
                    {icon && (
                        <div className="flex items-center justify-center mb-2">
                            {icon}
                        </div>
                    )}

                    {/* Title */}
                    <AlertDialogTitle className="text-xl font-semibold text-foreground">
                        {title}
                    </AlertDialogTitle>

                    {/* Description */}
                    <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </AlertDialogDescription>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 w-full pt-2">
                        {showReject && (
                            <Button
                                variant={rejectVariant}
                                onClick={handleReject}
                                className="flex-1 rounded"
                            >
                                {rejectLabel}
                            </Button>
                        )}
                        <Button
                            variant={acceptVariant}
                            onClick={handleAccept}
                            className={cn(
                                "flex-1 rounded",
                                !showReject && "w-full"
                            )}
                        >
                            {acceptLabel}
                        </Button>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}
