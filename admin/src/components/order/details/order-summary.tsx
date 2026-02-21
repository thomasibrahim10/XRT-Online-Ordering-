import { useTranslation } from 'next-i18next';
import usePrice from '@/utils/use-price';

interface OrderSummaryProps {
  order: any;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const { t } = useTranslation('common');

  const { price: subtotal } = usePrice({ amount: order?.amount! });
  const { price: shipping_charge } = usePrice({
    amount: order?.delivery_fee ?? 0,
  });
  const { price: tax } = usePrice({ amount: order?.sales_tax! });
  const { price: discount } = usePrice({ amount: order?.discount! ?? 0 });
  const { price: total } = usePrice({ amount: order?.paid_total! });
  const { price: wallet_total } = usePrice({
    amount: order?.wallet_point?.amount!,
  });
  const { price: amountDue } = usePrice({
    amount:
      order?.payment_status !== 'payment-success'
        ? order?.paid_total! - order?.wallet_point?.amount!
        : 0,
  });

  return (
    <div className="rounded-lg border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-heading">
        {t('text-order-summary')}
      </h3>

      <div className="flex flex-col space-y-3 border-b border-border-200 pb-5">
        <div className="flex items-center justify-between text-sm text-body">
          <span>{t('text-sub-total')}</span>
          <span>{subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-body">
          <span>{t('text-shipping-charge')}</span>
          <span>{shipping_charge}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-body">
          <span>{t('text-tax')}</span>
          <span>{tax}</span>
        </div>
        {order?.discount! > 0 && (
          <div className="flex items-center justify-between text-sm text-body text-red-500">
            <span>{t('text-discount')}</span>
            <span>-{discount}</span>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-col space-y-3">
        <div className="flex items-center justify-between text-base font-bold text-heading">
          <span>{t('text-total')}</span>
          <span>{total}</span>
        </div>

        {order?.wallet_point?.amount! > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-body">
              <span>{t('text-paid-from-wallet')}</span>
              <span>{wallet_total}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-heading">
              <span>{t('text-amount-due')}</span>
              <span>{amountDue}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
