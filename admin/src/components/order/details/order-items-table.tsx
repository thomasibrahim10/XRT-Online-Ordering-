import { useTranslation } from 'next-i18next';
import { Table } from '@/components/ui/table';
import { useIsRTL } from '@/utils/locals';
import { siteSettings } from '@/settings/site.settings';
import { Attachment } from '@/types';
import Image from 'next/image';
import usePrice from '@/utils/use-price';
import { NoDataFound } from '@/components/icons/no-data-found';

interface OrderItemsTableProps {
  products: any[];
}

export default function OrderItemsTable({ products }: OrderItemsTableProps) {
  const { t } = useTranslation('common');
  const { alignLeft, alignRight } = useIsRTL();

  const columns = [
    {
      dataIndex: 'image',
      key: 'image',
      width: 70,
      render: (image: any) => (
        <div className="relative h-[50px] w-[50px] overflow-hidden rounded-full border border-border-200">
          <Image
            src={image?.thumbnail ?? siteSettings.product.placeholder}
            alt="product"
            fill
            sizes="(max-width: 768px) 100vw"
            className="object-cover"
          />
        </div>
      ),
    },
    {
      title: t('table:table-item-products'),
      dataIndex: 'name',
      key: 'name',
      align: alignLeft,
      render: (name: string, item: any) => (
        <div>
          <span className="font-semibold text-heading">{name}</span>
          <br />
          <span className="text-sm text-body">
            {item.pivot ? item.pivot.order_quantity : item.quantity} x{' '}
            <span className="font-semibold">
              {item.pivot
                ? item.pivot.unit_price
                : (item.unit_price ?? item.price)}
            </span>
          </span>
        </div>
      ),
    },
    {
      title: t('table:table-item-total'),
      dataIndex: 'price',
      key: 'price',
      align: alignRight,
      render: (_: any, item: any) => <PriceCell item={item} />,
    },
  ];

  return (
    <div className="rounded-lg border border-border-200 bg-white shadow-sm">
      <Table
        //@ts-ignore
        columns={columns}
        emptyText={() => (
          <div className="flex flex-col items-center py-7">
            <NoDataFound className="w-52" />
            <div className="mb-1 pt-6 text-base font-semibold text-heading">
              {t('table:empty-table-data')}
            </div>
            <p className="text-[13px]">{t('table:empty-table-sorry-text')}</p>
          </div>
        )}
        data={products}
        rowKey="id"
        scroll={{ x: 300 }}
      />
    </div>
  );
}

const PriceCell = ({ item }: { item: any }) => {
  const { price } = usePrice({
    amount: parseFloat(
      item.pivot
        ? item.pivot.subtotal
        : (item.line_subtotal ?? item.subtotal ?? 0),
    ),
  });
  return <span className="font-semibold text-heading">{price}</span>;
};
