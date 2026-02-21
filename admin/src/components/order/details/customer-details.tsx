import { useTranslation } from 'next-i18next';
import { formatAddress } from '@/utils/format-address';
import { useFormatPhoneNumber } from '@/utils/format-phone-number';

interface CustomerDetailsProps {
  order: any;
}

export default function CustomerDetails({ order }: CustomerDetailsProps) {
  const { t } = useTranslation('common');

  const phoneNumber = useFormatPhoneNumber({
    customer_contact: order?.customer_contact as string,
  });

  return (
    <div className="flex flex-col gap-6 rounded-lg border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-heading">
        {t('text-customer-details')}
      </h3>

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-1">
          <h4 className="mb-2 text-sm font-semibold text-heading">
            {t('text-billing-address')}
          </h4>
          <div className="flex flex-col items-start space-y-1 text-sm text-body">
            <span className="font-medium text-heading">
              {order?.customer_name}
            </span>
            {order?.billing_address && (
              <span>{formatAddress(order.billing_address)}</span>
            )}
            {order?.customer_contact && <span>{phoneNumber}</span>}
          </div>
        </div>

        <div className="flex-1">
          <h4 className="mb-2 text-sm font-semibold text-heading">
            {t('text-shipping-address')}
          </h4>
          <div className="flex flex-col items-start space-y-1 text-sm text-body">
            <span className="font-medium text-heading">
              {order?.customer_name}
            </span>
            {order?.shipping_address && (
              <span>{formatAddress(order.shipping_address)}</span>
            )}
            {order?.customer_contact && <span>{phoneNumber}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
