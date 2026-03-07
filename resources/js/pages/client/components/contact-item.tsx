/* eslint-disable @typescript-eslint/no-explicit-any */
export const ContactItem = ({
        icon: Icon,
        label,
        value,
        href,
    }: {
        icon: any;
        label: string;
        value: string;
        href?: string;
    }) => (
        <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs text-muted-foreground">{label}</p>
                {href ? (
                    <a
                        href={href}
                        className="text-sm font-medium break-words transition-colors hover:text-primary"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-sm leading-relaxed font-medium break-words">
                        {value}
                    </p>
                )}
            </div>
        </div>
    );