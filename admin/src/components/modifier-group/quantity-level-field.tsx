import Input from '@/components/ui/input';
import SwitchInput from '@/components/ui/switch-input';
import { Control, useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'next-i18next';
import { TrashIcon } from '@/components/icons/trash';
import Label from '@/components/ui/label';

interface Props {
    index: number;
    remove: () => void;
    control: Control<any>;
    errors: any;
    globalSizes?: any[];
}

export default function QuantityLevelField({ index, remove, control, errors, globalSizes = [] }: Props) {
    const { t } = useTranslation(['common', 'form']);
    const { register } = useFormContext();

    return (
        <div className="p-4 border border-border-200 rounded-lg bg-gray-50 hover:border-border-base transition-colors space-y-4">
            <div className="flex items-center justify-between sm:hidden">
                <span className="text-sm font-medium text-heading">Level {index + 1}</span>
                <button
                    type="button"
                    onClick={() => remove()}
                    className="text-red-500 hover:text-red-700 p-1"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Main Quantity Level Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-2">
                    <Input
                        label={t('form:input-label-quantity') || 'Quantity'}
                        {...register(`quantity_levels.${index}.quantity` as const, { valueAsNumber: true })}
                        type="number"
                        min="1"
                        error={t(errors.quantity_levels?.[index]?.quantity?.message!)}
                        variant="outline"
                    />
                </div>
                <div className="sm:col-span-4">
                    <Input
                        label={t('form:input-label-name') || 'Name'}
                        {...register(`quantity_levels.${index}.name` as const)}
                        type="text"
                        error={t(errors.quantity_levels?.[index]?.name?.message!)}
                        variant="outline"
                        placeholder="e.g., Light, Normal, Extra"
                    />
                </div>
                <div className="sm:col-span-2">
                    <Input
                        label={t('form:input-label-display-order') || 'Order'}
                        {...register(`quantity_levels.${index}.display_order` as const, { valueAsNumber: true })}
                        type="number"
                        min="0"
                        error={t(errors.quantity_levels?.[index]?.display_order?.message!)}
                        variant="outline"
                    />
                </div>
                <div className="sm:col-span-3 flex items-center gap-4 pt-0 sm:pt-7">
                    <SwitchInput
                        name={`quantity_levels.${index}.is_default`}
                        control={control}
                        label={t('form:input-label-default') || 'Default'}
                    />
                    <SwitchInput
                        name={`quantity_levels.${index}.is_active`}
                        control={control}
                        label={t('form:input-label-active') || 'Active'}
                    />
                </div>
                <div className="hidden sm:flex sm:col-span-1 items-center pt-7 justify-end">
                    <button
                        type="button"
                        onClick={() => remove()}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 -m-2"
                        title={t('common:text-delete')}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Nested Prices by Size */}
            <div className="bg-white p-4 rounded border border-border-100">
                <div className="mb-3">
                    <Label className="mb-0">{t('form:input-label-pricing-by-size') || 'Pricing by Size (Optional)'}</Label>
                    <p className="text-xs text-gray-500">
                        {t('form:pricing-by-size-helper') || 'Define price adjustments for this quantity level based on item size.'}
                    </p>
                </div>

                {globalSizes.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                        {t('form:no-global-sizes-available', { defaultValue: 'No global sizes available. Configure sizes in settings/items.' })}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {globalSizes.map((size: any) => (
                            <SizePriceInput
                                key={size.id}
                                size={size}
                                control={control}
                                nestIndex={index}
                            />
                        ))}
                    </div>
                )}
                {globalSizes.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                        Enter price difference (e.g. +2.00 or -1.00) for each size. Leave empty for no change.
                    </p>
                )}
            </div>
        </div>
    );
}

// Helper component to manage individual size price input
function SizePriceInput({ size, nestIndex, control }: any) {
    const { getValues } = useFormContext();
    const pricesName = `quantity_levels.${nestIndex}.prices_by_size`;

    // We watch the entire array to find our entry
    const prices = useFieldArray({
        control,
        name: pricesName
    });

    // Find index of this size in the array
    const fieldIndex = prices.fields.findIndex((f: any) => (f as any).size_id === size.id);
    const entry = fieldIndex >= 0 ? prices.fields[fieldIndex] : null;

    const handleBlur = (e: any) => {
        const val = e.target.value;
        const numVal = parseFloat(val);
        const currentFields = getValues(pricesName) || [];
        const idx = currentFields.findIndex((f: any) => f.size_id === size.id);

        if (val === '' || isNaN(numVal)) {
            if (idx >= 0) {
                prices.remove(idx);
            }
        } else {
            if (idx >= 0) {
                if (currentFields[idx].price !== numVal) {
                    prices.update(idx, { size_id: size.id, price: numVal });
                }
            } else {
                prices.append({ size_id: size.id, price: numVal });
            }
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <Label className="text-xs mb-0">{size.name} ({size.code})</Label>
            <Input
                name={`size-price-${size.id}`} // Dummy name to satisfy prop requirement
                type="number"
                step="0.01"
                placeholder="0.00"
                className="!h-9 !text-sm"
                defaultValue={entry ? (entry as any).price : ''}
                onBlur={handleBlur}
            />
        </div>
    );
}
