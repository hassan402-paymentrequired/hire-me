import { CustomAlertDialog } from '@/components/ui/custom-alert-dialog'


const InviteModal = ({
    showDialog,
    setShowDialog,
    dialogIcon,
    title,
    description,
    acceptLabel,
    rejectLabel,
    handleAccept,
    handleReject
}) => {
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
