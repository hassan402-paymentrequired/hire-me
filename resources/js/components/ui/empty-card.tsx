import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils";

interface EmptyCardProps {
  title: string;
  description?: string;
  image: string;
  buttonText?: string;
  buttonOnClick?: () => void;
  className?: string
}

export function EmptyCard({ title, description, image, buttonText, buttonOnClick, className }: EmptyCardProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="default">
          <img src={image} alt={title} width={100} height={100} className={cn(className)} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && (
          <EmptyDescription>
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>
      {buttonText && (
      <EmptyContent>
        <Button size="sm" onClick={buttonOnClick} className="rounded">{buttonText}</Button>
      </EmptyContent>
      )}
    </Empty>
  )
}
