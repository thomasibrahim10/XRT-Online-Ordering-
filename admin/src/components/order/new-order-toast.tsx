import { useTranslation } from 'next-i18next';
import { useAtom } from 'jotai';
import { newOrderModalStateAtom } from '@/store/order-atoms';

interface Props {
  newOrder: any;
  closeToast?: () => void;
}

export default function NewOrderToast({ newOrder, closeToast }: Props) {
  const { t } = useTranslation();
  const [, setModalState] = useAtom(newOrderModalStateAtom);

  const handleClick = () => {
    setModalState({ isOpen: true, order: newOrder });
  };

  if (!newOrder) return null;

  return (
    <div
      className="flex w-full md:w-[400px] items-center justify-between bg-white rounded-lg shadow-xl border-l-4 border-accent p-4 cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={handleClick}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-heading text-sm flex items-center gap-2">
          {t('text-new-order')}{' '}
          <span className="text-accent">#{newOrder.id}</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
        </h3>
        <div className="text-xs text-body flex items-center gap-2">
          <span className="font-semibold">
            {(newOrder as any)?.delivery?.name ??
              (newOrder as any)?.customer?.name ??
              'Guest'}
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-accent">
            {(newOrder as any)?.money?.subtotal ?? (newOrder as any)?.total}{' '}
            {(newOrder as any)?.money?.currency ?? 'USD'}
          </span>
        </div>
      </div>
    </div>
  );
}
