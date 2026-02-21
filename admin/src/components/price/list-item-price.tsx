import usePrice from '@/utils/use-price';

type ListItemPriceProps = {
  value: number;
  className?: string;
};

const ListItemPrice = ({ value, className }: ListItemPriceProps) => {
  const { price } = usePrice({
    amount: value ? value : 0,
  });
  return <span className={className}>{price}</span>;
};

export default ListItemPrice;
