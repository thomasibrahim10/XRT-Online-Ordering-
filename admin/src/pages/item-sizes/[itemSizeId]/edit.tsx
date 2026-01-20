import Layout from '@/components/layouts/admin';
import ItemSizeForm from '@/components/item-size/item-size-form';
import { useRouter } from 'next/router';
import ErrorMessage from '@/components/ui/error-message';
import Loader from '@/components/ui/loader/loader';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useItemSizeQuery } from '@/data/item-size';
import { adminOnly } from '@/utils/auth-utils';

export default function EditItemSizePage() {
  const { query } = useRouter();
  const { t } = useTranslation();
  const id = query.itemSizeId as string;

  const { size, isLoading, error } = useItemSizeQuery(id);

  if (isLoading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!size) return <ErrorMessage message={t('common:text-not-found')} />;

  return (
    <>
      <div className="flex border-b border-dashed border-border-base pb-5 md:pb-7">
        <h1 className="text-lg font-semibold text-heading">
          {t('form:form-title-edit-item-size')}
        </h1>
      </div>
      <ItemSizeForm initialValues={size} />
    </>
  );
}

EditItemSizePage.authenticate = {
  permissions: adminOnly,
};
EditItemSizePage.Layout = Layout;

export const getServerSideProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
