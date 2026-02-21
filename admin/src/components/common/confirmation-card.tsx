import { TrashIcon } from '@/components/icons/trash';
import Button from '@/components/ui/button';
import { useTranslation } from 'next-i18next';
import cn from 'classnames';

type ConfirmationCardProps = {
  onCancel: () => void;
  onDelete: () => void;
  title?: string;
  icon?: any;
  description?: string;
  cancelBtnClassName?: string;
  deleteBtnClassName?: string;
  cancelBtnText?: string;
  deleteBtnText?: string;
  cancelBtnLoading?: boolean;
  deleteBtnLoading?: boolean;
  /** When true, cancel (Back) button is disabled but does not show loading spinner */
  cancelBtnDisabled?: boolean;
  /** When set, show a required reason textarea; confirm is disabled until reason is non-empty */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonValue?: string;
  onReasonChange?: (value: string) => void;
  confirmDisabled?: boolean;
};

const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  onCancel,
  onDelete,
  icon,
  title = 'button-delete',
  description = 'delete-item-confirm',
  cancelBtnText = 'button-cancel',
  deleteBtnText = 'button-delete',
  cancelBtnClassName,
  deleteBtnClassName,
  cancelBtnLoading,
  deleteBtnLoading,
  cancelBtnDisabled = false,
  reasonLabel,
  reasonPlaceholder,
  reasonValue = '',
  onReasonChange,
  confirmDisabled = false,
}) => {
  const { t } = useTranslation('common');
  const showReason = Boolean(reasonLabel && onReasonChange);
  return (
    <div className="m-auto w-full max-w-sm rounded-md bg-light p-4 pb-6 sm:w-[24rem] md:rounded-xl">
      <div className="w-full h-full text-center">
        <div className="flex flex-col justify-between h-full">
          {icon ? (
            icon
          ) : (
            <TrashIcon className="w-12 h-12 m-auto mt-4 text-accent" />
          )}
          <p className="mt-4 text-xl font-bold text-heading">{t(title)}</p>
          <p className="px-6 py-2 leading-relaxed text-body-dark dark:text-muted">
            {t(description)}
          </p>
          {showReason && (
            <div className="mt-4 px-2 text-left">
              <label className="mb-1.5 block text-sm font-medium text-heading">
                {t(reasonLabel)}
              </label>
              <textarea
                value={reasonValue}
                onChange={(e) => onReasonChange?.(e.target.value)}
                placeholder={reasonPlaceholder ? t(reasonPlaceholder) : undefined}
                className="w-full min-h-[80px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-heading placeholder:text-gray-400 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                rows={3}
              />
            </div>
          )}
          <div className="flex items-center justify-between w-full mt-8 space-s-4">
            <div className="w-1/2">
              <Button
                type="button"
                onClick={onCancel}
                loading={cancelBtnLoading}
                disabled={cancelBtnLoading || cancelBtnDisabled}
                variant="custom"
                className={cn(
                  'w-full rounded bg-accent py-2 px-4 text-center text-base font-semibold text-light shadow-md transition duration-200 ease-in hover:bg-accent-hover focus:bg-accent-hover focus:outline-none',
                  cancelBtnClassName,
                )}
              >
                {t(cancelBtnText)}
              </Button>
            </div>

            <div className="w-1/2">
              <Button
                type="button"
                onClick={onDelete}
                loading={deleteBtnLoading}
                disabled={deleteBtnLoading || confirmDisabled}
                variant="custom"
                className={cn(
                  'w-full rounded bg-red-600 py-2 px-4 text-center text-base font-semibold text-light shadow-md transition duration-200 ease-in hover:bg-red-700 focus:bg-red-700 focus:outline-none',
                  deleteBtnClassName,
                )}
              >
                {t(deleteBtnText)}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationCard;
