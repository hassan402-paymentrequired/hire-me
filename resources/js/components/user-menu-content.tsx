import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { becomeProvider, logout } from '@/routes';
import business from '@/routes/business';
import { edit } from '@/routes/profile';
import { type User } from '@/types';
import { Link, router } from '@inertiajs/react';
import {
    Briefcase,
    LogOut,
    Settings,
    Wallet,
} from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal ">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
                {/* {user.wallet && (
                    <div className="mt-2 border-t border-border px-1 py-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                                Wallet Balance
                            </span>
                            <span className="font-semibold">
                                ₦
                                {user.wallet.available_balance.toLocaleString()}
                            </span>
                        </div>
                    </div>
                )} */}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {user.wallet && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full"
                            href="/wallet"
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Wallet className="mr-2" />
                            My Wallet
                        </Link>
                    </DropdownMenuItem>
                )}

                {user.has_provider_setup ? (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full"
                            href={business.dashboard()}
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Briefcase className="mr-2" />
                            Provider Dashboard
                        </Link>
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full"
                            href={becomeProvider()}
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Briefcase className="mr-2" />
                            Become a Provider
                        </Link>
                    </DropdownMenuItem>
                )}
                
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full"
                            href={edit()}
                            as="button"
                            prefetch
                            onClick={cleanup}
                        >
                            <Settings className="mr-2" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
