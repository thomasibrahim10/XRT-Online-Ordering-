import { useState } from 'react';
import ConfirmationCard from '@/components/common/confirmation-card';
import {
  useModalAction,
  useModalState,
} from '@/components/ui/modal/modal.context';

const ConfirmationModalView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const [isConfirming, setIsConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const requireReason = Boolean(data?.requireReason);
  const confirmDisabled = requireReason && !reason.trim();

  async function handleConfirm(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    if (!data?.onConfirm) {
      closeModal();
      return;
    }
    if (requireReason && !reason.trim()) return;
    setIsConfirming(true);
    try {
      const result = requireReason ? data.onConfirm(reason.trim()) : data.onConfirm();
      if (result && typeof result.then === 'function') {
        await result;
      }
      data.onSuccess?.();
    } catch {
      // Mutation onError will show toast; avoid uncaught rejection
    } finally {
      setIsConfirming(false);
      closeModal();
    }
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleConfirm}
      title={data?.title || 'button-delete'}
      description={data?.description || 'delete-item-confirm'}
      deleteBtnText={data?.deleteBtnText || 'button-delete'}
      cancelBtnText={data?.cancelBtnText || 'button-cancel'}
      deleteBtnLoading={isConfirming}
      cancelBtnLoading={false}
      cancelBtnDisabled={isConfirming}
      reasonLabel={data?.reasonLabel}
      reasonPlaceholder={data?.reasonPlaceholder}
      reasonValue={reason}
      onReasonChange={setReason}
      confirmDisabled={confirmDisabled}
    />
  );
};

export default ConfirmationModalView;
