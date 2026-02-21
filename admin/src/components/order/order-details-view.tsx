import { useTranslation } from 'next-i18next';
import OrderItemsTable from '@/components/order/details/order-items-table';
import OrderSummary from '@/components/order/details/order-summary';
import CustomerDetails from '@/components/order/details/customer-details';
import OrderInfo from '@/components/order/details/order-info';
import { Order } from '@/types';
import dayjs from 'dayjs';
import {
  getOrderStatusLabelKey,
  getOrderStatusColors,
  isScheduledOrder,
  useUpdateOrderMutation,
} from '@/data/order';
import { useModalAction } from '@/components/ui/modal/modal.context';
import cn from 'classnames';

interface OrderDetailsViewProps {
  order: Order;
  onClose?: () => void;
}

export default function OrderDetailsView({ order, onClose }: OrderDetailsViewProps) {
  const { t } = useTranslation();
  const { mutateAsync: updateOrderAsync, isPending: isUpdating } = useUpdateOrderMutation();
  const { openModal } = useModalAction();
  const status = order?.order_status ?? '';
  const scheduled = isScheduledOrder(order);
  const isCompleted = ['completed', 'canceled', 'cancelled', 'pending'].includes(status.toLowerCase());
  const isInProgress = !isCompleted && !scheduled;
  const colors = getOrderStatusColors(status, scheduled);

  return (
    <div className="flex flex-col w-[95vw] max-w-4xl bg-gray-50 rounded-lg overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-heading">
            {t('text-order-details')}{' '}
            <span className="text-accent">#{order?.tracking_number}</span>
          </h2>
          <span className="text-sm text-body-dark">
            {order?.created_at
              ? dayjs(order?.created_at).format('MMMM D, YYYY h:mm A')
              : ''}
          </span>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider',
              colors.badge,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
            {t(`common:${getOrderStatusLabelKey(status, scheduled)}`)}
          </span>
          {isInProgress && (
            <button
              type="button"
              onClick={() => openModal('CONFIRM_ACTION', {
                title: t('common:text-cancel-order'),
                description: t('common:text-cancel-order-confirm'),
                deleteBtnText: t('common:text-cancel-order'),
                cancelBtnText: t('common:text-back'),
                requireReason: true,
                reasonLabel: 'text-cancel-reason',
                reasonPlaceholder: 'text-cancel-reason-placeholder',
                onConfirm: (reason: string) => updateOrderAsync({
                  id: String(order.id),
                  status: 'canceled',
                  cancelled_reason: reason,
                }),
                onSuccess: onClose,
              })}
              disabled={isUpdating}
              className={cn(
                'inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 uppercase tracking-wider transition-colors hover:bg-red-100 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1',
                isUpdating && 'cursor-not-allowed opacity-50',
              )}
            >
              {t('common:text-cancel-order')}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-6">
        {/* Left Column: Items */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-semibold text-heading">
                {t('text-order-items')}
              </h3>
            </div>
            <OrderItemsTable products={order?.products ?? []} />
          </div>

          {order && <OrderSummary order={order} />}
        </div>

        {/* Right Column: Customer & Order Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          {order && <CustomerDetails order={order} />}
          {order && <OrderInfo order={order} />}
        </div>
      </div>
    </div>
  );
}
