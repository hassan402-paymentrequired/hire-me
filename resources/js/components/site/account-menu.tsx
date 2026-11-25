import {
    AccountMenuNav,
    type AccountSection,
} from '@/components/site/account-menu-nav';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export type { AccountSection } from '@/components/site/account-menu-nav';

export function AccountMenu({ active }: { active: AccountSection }) {
    const { auth } = usePage<SharedData>().props;

    return <AccountMenuNav user={auth.user} active={active} showHelp={false} />;
}