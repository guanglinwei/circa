import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Account from "@/pages/Account";

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] flex flex-col justify-center">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <Account open={open} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

export default AccountDialog;
