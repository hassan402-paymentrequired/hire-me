import React from 'react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    return (
        <SidebarGroup className="px-2 py-0">
            {items.map((t) => (
                <React.Fragment key={t.name}>
                    <SidebarGroupLabel className="uppercase mt-3">
                        {t.name}
                    </SidebarGroupLabel>

                    <SidebarMenu>
                        {t.links.map((item) =>
                            item.isLocked ? (
                                /* ── Locked item ── */
                                <SidebarMenuItem key={item.title}>
                                    <TooltipProvider delayDuration={0}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={{ children: `${item.title} — Coming soon` }}
                                                    className="opacity-50 cursor-not-allowed pointer-events-none select-none"
                                                >
                                                    {/* Mirror exact structure of normal item so icon sizing is untouched */}
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    {/* Lock pushed to the right via ml-auto */}
                                                    <LockKeyhole className="ml-auto w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                                </SidebarMenuButton>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>Coming soon</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </SidebarMenuItem>
                            ) : (
                                /* ── Normal item ── */
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={page.url?.startsWith(resolveUrl(item.href))}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        )}
                    </SidebarMenu>
                </React.Fragment>
            ))}
        </SidebarGroup>
    );
}