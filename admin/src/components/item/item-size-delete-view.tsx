import ConfirmationCard from '@/components/common/confirmation-card';
import { useModalAction, useModalState } from '@/components/ui/modal/modal.context';
import { useDeleteItemSizeMutation } from '@/data/item-size';

const ItemSizeDeleteView = () => {
  const { data } = useModalState();
  const { closeModal } = useModalAction();
  const { mutate: deleteSize, isPending: loading } = useDeleteItemSizeMutation();

  function handleDelete() {
    deleteSize(data);
    closeModal();
  }

  return (
    <ConfirmationCard
      onCancel={closeModal}
      onDelete={handleDelete}
      deleteBtnLoading={loading}
    />
  );
};

export default ItemSizeDeleteView;
