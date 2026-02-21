import { useTranslation } from 'next-i18next';
import { OrderStatus, PaymentStatus } from '@/types';
import Button from '@/components/ui/button';
import { DownloadIcon } from '@/components/icons/download-icon';
import StatusColor from '@/components/order/status-color';
import Badge from '@/components/ui/badge/badge';
import cn from 'classnames';

interface OrderHeaderProps {
  order: any;
  onDownloadInvoice: () => void;
  loading?: boolean;
}

export default function OrderHeader({
  order,
  onDownloadInvoice,
  loading,
}: OrderHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col rounded-lg border border-border-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="mb-4 sm:mb-0">
        <h2 className="mb-2 text-xl font-bold text-heading">
          {t('form:input-label-order-id')}{' '}
          <span className="text-base font-normal text-body">
            #{order?.tracking_number}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            text={t(order?.order_status)}
            color={StatusColor(order?.order_status)}
            className="flex min-h-[2rem] items-center text-sm font-medium"
          />
          <Badge
            text={t(order?.payment_status)}
            color={StatusColor(order?.payment_status)}
            className="flex min-h-[2rem] items-center text-sm font-medium"
          />
        </div>
      </div>
      <Button
        onClick={onDownloadInvoice}
        loading={loading}
        className="w-full sm:w-auto"
      >
        <DownloadIcon className="h-4 w-4 me-3" />
        {t('text-download')} {t('text-invoice')}
      </Button>
    </div>
  );
}
