import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { newOrderAtom, newOrderModalStateAtom } from '@/store/order-atoms';
import { toast } from 'react-toastify';
import { useTranslation } from 'next-i18next';
import { useUpdateOrderMutation } from '@/data/order';
import NewOrderToast from './new-order-toast';

export default function NewOrderNotification() {
  const { t } = useTranslation();
  const [newOrder, setNewOrder] = useAtom(newOrderAtom);
  const [, setModalState] = useAtom(newOrderModalStateAtom);

  const { mutate: updateOrder } = useUpdateOrderMutation();

  useEffect(() => {
    if (newOrder) {
      // 1. Play Sound (Create new instance every time for overlapping)
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch((error) => console.error('Audio play failed:', error));

      const orderId = newOrder.id;
      const toastId = `order-${orderId}`;

      // 2. Show Toast Notification
      // Use generic toast for full custom control without default styles
      toast(<NewOrderToast newOrder={newOrder} />, {
        toastId: toastId, // Unique ID for programmatic dismissal
        position: 'top-right',
        autoClose: false, // Persistent until accepted/closed
        closeOnClick: false,
        draggable: false,
        hideProgressBar: true,
        closeButton: false, // Hide default close button
        style: {
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
          minWidth: '350px', // Ensure it has enough width
          transform: 'translateX(-2rem)', // Move left as requested
        },
        className: 'p-0 bg-transparent shadow-none', // Tailwind overrides just in case
        bodyClassName: 'p-0 m-0',
      });

      // 3. Auto-Accept Timer (20 seconds)
      const timer = setTimeout(() => {
        if (toast.isActive(toastId)) {
          updateOrder(
            { id: orderId, status: 'accepted' },
            {
              onSuccess: () => {
                toast.success(t('text-order-auto-accepted') + ` #${orderId}`);
                toast.dismiss(toastId);
                setModalState((prev) =>
                  prev.isOpen && prev.order?.id === orderId
                    ? { isOpen: false, order: null }
                    : prev
                );
                setNewOrder(null);
              },
            }
          );
        }
      }, 20000);

      return () => clearTimeout(timer);
    }
  }, [newOrder, setModalState, setNewOrder, t, updateOrder]);

  return null;
}
