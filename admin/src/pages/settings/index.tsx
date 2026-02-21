import AdminLayout from '@/components/layouts/admin';
import Loader from '@/components/ui/loader/loader';
import { adminOnly } from '@/utils/auth-utils';
import { Routes } from '@/config/routes';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();

  useEffect(() => {
    router.replace(Routes.shopSettings);
  }, [router]);

  return <Loader text={t('common:text-loading')} />;
}
Settings.authenticate = {
  permissions: adminOnly,
};
Settings.Layout = AdminLayout;

export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['form', 'common'])),
  },
});
