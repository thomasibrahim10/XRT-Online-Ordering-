import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { newOrderAtom, newOrderModalStateAtom } from '@/store/order-atoms';
import Modal from '@/components/ui/modal/modal';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import dayjs from 'dayjs';
import cn from 'classnames';
import { DatePicker } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';
import { toast } from 'react-toastify';
import { useUpdateOrderMutation } from '@/data/order';

export default function NewOrderModal() {
  const { t } = useTranslation();
  const [modalState, setModalState] = useAtom(newOrderModalStateAtom);
  const [, setNewOrder] = useAtom(newOrderAtom);
  const { isOpen, order: newOrder } = modalState;

  const [selectedTimeOption, setSelectedTimeOption] = useState<
    number | 'custom' | null
  >(null);
  const [customDate, setCustomDate] = useState<Date | null>(null);

  const { mutate: updateOrder, isPending: updating } = useUpdateOrderMutation();

  const handleClose = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleAcceptOrder = () => {
    if (!newOrder) return;

    let preparationTime: number;

    if (selectedTimeOption === 'custom') {
      if (!customDate) {
        toast.error(t('text-invalid-custom-time') ?? 'Please select a time');
        return;
      }
      const hours = dayjs(customDate).hour();
      const minutes = dayjs(customDate).minute();
      preparationTime = hours * 60 + minutes;

      if (preparationTime <= 0) {
        toast.error(
          t('text-invalid-custom-time') ?? 'Please enter a valid time',
        );
        return;
      }
    } else if (selectedTimeOption) {
      preparationTime = selectedTimeOption;
    } else {
      toast.error(
        t('text-select-time-error') ?? 'Please select a preparation time',
      );
      return;
    }

    updateOrder(
      { id: newOrder.id, status: 'accepted' },
      {
        onSuccess: () => {
          toast.success(t('text-order-accepted-message', { time: preparationTime }));
          toast.dismiss(`order-${newOrder.id}`);
          setModalState({ isOpen: false, order: null });
          setNewOrder(null);
        },
      }
    );
  };

  if (!newOrder) return null;

  // Extraction Helpers
  const isDummy = (newOrder as any).isDummy || (newOrder as any).delivery; // loose check
  const customerName =
    (newOrder as any)?.delivery?.name ?? (newOrder as any)?.customer?.name;
  const contact =
    (newOrder as any)?.delivery?.phone ?? (newOrder as any)?.customer_contact;
  const address =
    (newOrder as any)?.delivery?.address?.formatted_address ??
    (newOrder as any)?.delivery?.address?.line1 ??
    (newOrder as any)?.shipping_address?.formatted_address ??
    (newOrder as any)?.billing_address?.formatted_address ??
    'N/A';

  const total = (newOrder as any)?.money?.subtotal ?? (newOrder as any)?.total;
  const currency = (newOrder as any)?.money?.currency ?? 'USD';
  const paymentMethod = (newOrder as any)?.payment_gateway ?? 'COD';
  const paymentStatus = (newOrder as any)?.payment_status ?? 'pending';
  const orderType = (newOrder as any)?.delivery_time ? 'Scheduled' : 'Standard'; // Simplified logic
  const items = (newOrder as any)?.products ?? [];

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <div className="flex flex-col w-[95vw] max-w-5xl bg-gray-50 rounded-lg overflow-hidden h-[90vh] md:h-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border-b border-gray-100 shadow-sm shrink-0">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-heading flex items-center gap-3">
              {t('text-new-order')}{' '}
              <span className="text-accent">#{newOrder.id}</span>
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
            </h2>
            <span className="text-sm text-body-dark">
              {dayjs((newOrder as any).created_at).format(
                'MMMM D, YYYY h:mm A',
              )}
            </span>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <div className="px-3 py-1 rounded-full text-sm font-semibold capitalize bg-accent/10 text-accent border border-accent/20">
              {paymentMethod}
            </div>
            <div
              className={cn(
                'px-3 py-1 rounded-full text-sm font-semibold capitalize border',
                paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-600 border-green-200'
                  : 'bg-yellow-100 text-yellow-600 border-yellow-200',
              )}
            >
              {paymentStatus}
            </div>
          </div>
        </div>

        {/* Content Section (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column: Items */}
            <div className="w-full md:w-2/3 flex flex-col gap-6">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-semibold text-heading">
                    {t('text-order-items')}
                  </h3>
                </div>
                {/* Simplified Table for Modal to avoid dependency issues if OrderItemsTable is complex, or reuse logic */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3">{t('text-item')}</th>
                        <th className="px-4 py-3 text-right">
                          {t('text-quantity')}
                        </th>
                        <th className="px-4 py-3 text-right">
                          {t('text-price')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, idx: number) => (
                        <tr
                          key={idx}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-heading">
                            <div className="flex items-center gap-2">
                              {/* Optional Image */}
                              <span>{item.name ?? item.name_snap}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {item.quantity ?? item.pivot?.order_quantity}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-heading">
                            {item.price ?? item.unit_price}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-heading mb-4">
                  {t('text-order-summary')}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-body">{t('text-sub-total')}</span>
                    <span className="font-semibold text-heading">
                      {(newOrder as any)?.money?.subtotal ??
                        (newOrder as any)?.total}{' '}
                      {currency}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-heading border-t border-gray-100 pt-2 mt-2">
                    <span>{t('text-total')}</span>
                    <span className="text-accent">
                      {(newOrder as any)?.money?.total ??
                        (newOrder as any)?.total}{' '}
                      {currency}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Customer Info */}
            <div className="w-full md:w-1/3 flex flex-col gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="font-semibold text-heading mb-4">
                  {t('text-customer-details')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-muted uppercase mb-1">
                      {t('text-name')}
                    </div>
                    <div className="font-medium text-heading">
                      {customerName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase mb-1">
                      {t('text-contact')}
                    </div>
                    <div className="font-medium text-heading">{contact}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted uppercase mb-1">
                      {t('text-delivery-address')}
                    </div>
                    <div className="font-medium text-heading text-sm">
                      {address}
                    </div>
                  </div>
                  {(newOrder as any)?.note && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm text-yellow-800">
                      <span className="font-bold block text-xs uppercase mb-1">
                        {t('text-note')}:
                      </span>
                      {(newOrder as any).note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 shrink-0">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-auto">
                <label className="block text-sm font-bold text-heading mb-2 uppercase tracking-wide">
                  {t('text-select-preparation-time')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeOption(time)}
                      className={cn(
                        'rounded-md border px-4 py-2 text-sm font-bold transition-all focus:outline-none shadow-sm',
                        selectedTimeOption === time
                          ? 'border-accent bg-accent text-white shadow-accent/30'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-accent hover:text-accent',
                      )}
                    >
                      {time} min
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedTimeOption('custom')}
                    className={cn(
                      'rounded-md border px-4 py-2 text-sm font-bold transition-all focus:outline-none shadow-sm',
                      selectedTimeOption === 'custom'
                        ? 'border-accent bg-accent text-white shadow-accent/30'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-accent hover:text-accent',
                    )}
                  >
                    {t('text-custom') ?? 'Custom'}
                  </button>
                </div>
                {selectedTimeOption === 'custom' && (
                  <div className="mt-3 animate-fadeIn max-w-[200px]">
                    <DatePicker
                      format="HH:mm"
                      showMeridian={false}
                      ranges={[]}
                      placeholder={t('text-select-time') ?? 'Select Time'}
                      value={customDate}
                      onChange={(date: Date | null) => {
                        setCustomDate(date);
                      }}
                      className="w-full"
                      cleanable={false}
                      placement="topStart"
                      size="md"
                      locale={{ ok: 'Done' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 w-full md:w-auto self-end">
                <Button
                  onClick={handleAcceptOrder}
                  loading={updating}
                  disabled={updating || !selectedTimeOption}
                  className="flex-1 md:flex-none h-12 px-8 bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/30 text-base"
                >
                  {t('text-accept-order')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
