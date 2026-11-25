import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { TeamInviteEmailForm } from './team-invite-email-form';

export function TeamInviteDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const close = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[520px]">
                <div className="border-b border-[#0E3B2E]/10 px-6 py-5 dark:border-white/10">
                    <DialogTitle className="font-[Sora] text-xl font-semibold text-foreground">
                        Invite by email
                    </DialogTitle>
                    <DialogDescription className="mt-1 text-[14px] text-muted-foreground">
                        We’ll email them a link to join your business on
                        Proxideck.
                    </DialogDescription>
                </div>

                <div className="px-6 py-5">
                    <TeamInviteEmailForm onSuccess={close} />
                </div>
            </DialogContent>
        </Dialog>
    );
}