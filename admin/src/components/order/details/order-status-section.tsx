import { useTranslation } from 'next-i18next';
import OrderStatusProgressBox from '@/components/order/order-status-progress-box';
import { OrderStatus, PaymentStatus } from '@/types';
import SelectInput from '@/components/ui/select-input';
import Button from '@/components/ui/button';
import ValidationError from '@/components/ui/form-validation-error';
import { Control } from 'react-hook-form';
import { ORDER_STATUS } from '@/utils/order-status';

interface OrderStatusSectionProps {
  order: any;
  control: Control<any>;
  errors: any;
  updating: boolean;
  onChangeStatus: (data: any) => void;
}

export default function OrderStatusSection({
  order,
  control,
  errors,
  updating,
  onChangeStatus,
}: OrderStatusSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-border-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold text-heading">
        {t('text-order-status')}
      </h3>

      <div className="mb-8">
        <OrderStatusProgressBox
          orderStatus={order?.order_status as OrderStatus}
          paymentStatus={order?.payment_status as PaymentStatus}
        />
      </div>

      {![OrderStatus.FAILED, OrderStatus.CANCELLED].includes(
        order?.order_status as OrderStatus,
      ) && (
        <form
          onSubmit={onChangeStatus}
          className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-end md:w-2/3 lg:w-1/2"
        >
          <div className="w-full">
            <SelectInput
              name="order_status"
              control={control}
              getOptionLabel={(option: any) => t(option.name)}
              getOptionValue={(option: any) => option.status}
              options={ORDER_STATUS.slice(0, 6)}
              placeholder={t('form:input-placeholder-order-status')}
            />
            <ValidationError message={t(errors?.order_status?.message)} />
          </div>
          <Button loading={updating} className="w-full sm:w-auto">
            {t('form:button-label-change-status')}
          </Button>
        </form>
      )}
    </div>
  );
}
