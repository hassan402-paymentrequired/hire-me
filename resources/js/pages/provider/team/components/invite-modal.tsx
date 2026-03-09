import { ReactNode } from 'react';

import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog';

interface InviteModalProps {
    showDialog: boolean;
    setShowDialog: (open: boolean) => void;
    dialogIcon: ReactNode;
    title: string;
    description: string;
    acceptLabel: string;
    rejectLabel: string;
    handleAccept: () => void;
    handleReject: () => void;
}

const InviteModal = ({
    showDialog,
    setShowDialog,
    dialogIcon,
    title,
    description,
    acceptLabel,
    rejectLabel,
    handleAccept,
    handleReject,
}: InviteModalProps) => {
    return (
        <CustomAlertDialog
            open={showDialog}
            onOpenChange={setShowDialog}
            icon={dialogIcon}
            title={title}
            description={description}
            acceptLabel={acceptLabel}
            rejectLabel={rejectLabel}
            onAccept={handleAccept}
            onReject={handleReject}
        />
    );
};

export default InviteModal;
