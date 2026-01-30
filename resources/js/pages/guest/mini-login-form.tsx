import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { login } from '@/routes';

interface MiniLoginFormProps extends React.ComponentProps<'div'> {
    gate?: boolean;
    canRegister?: boolean;
}

export function MiniLoginForm({
    className,
    gate,
    canRegister,
    ...props
}: MiniLoginFormProps) {
   

    return (
        <div
        className={cn(
            'flex flex-col gap-6 p-6 mb-10',
            className,
        )}
        {...props}
    >
        <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-lg font-semibold">
                Login to continue viewing more providers
            </h2>
            <p className="text-muted-foreground text-sm">
                Sign in or create an account to explore the full list of
                service providers.
            </p>
            <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href={login().url}>
                <Button>
                        Get Started 
                        </Button>
                    </Link>
               
            </div>
        </div>
    </div>
    );
}
