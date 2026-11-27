import {
    AccountMenuNav,
    resolveAccountSection,
} from '@/components/site/account-menu-nav';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { usePage } from '@inertiajs/react';

interface UserMenuContentProps {
    user: User;
    showHelpCenter?: boolean;
}

export function UserMenuContent({
    user,
    showHelpCenter = true,
}: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { url } = usePage();
    const active = resolveAccountSection(url);

    return (
        <AccountMenuNav
            user={user}
            active={active}
            onNavigate={cleanup}
            showHelp={showHelpCenter}
        />
    );
}