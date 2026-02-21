import Card from '@/components/common/card';
import GooglePlacesAutocomplete from '@/components/form/google-places-autocomplete';
import * as socialIcons from '@/components/icons/social';
import DatePicker from '@/components/ui/date-picker';
import { addDays, addMinutes, isSameDay, isToday } from 'date-fns';
import { COUNTRY_LOCALE } from '@/components/settings/payment/country-locale';
import { CURRENCY } from '@/data/currencies';
import { PAYMENT_GATEWAY } from '@/components/settings/payment/payment-gateway';
import WebHookURL from '@/components/settings/payment/webhook-url';
import { settingsValidationSchema } from '@/components/settings/settings-validation-schema';
import Alert from '@/components/ui/alert';
import Badge from '@/components/ui/badge/badge';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import ValidationError from '@/components/ui/form-validation-error';
import Input from '@/components/ui/input';
import Label from '@/components/ui/label';
import Loader from '@/components/ui/loader/loader';
import { useModalAction } from '@/components/ui/modal/modal.context';
import PaymentSelect from '@/components/ui/payment-select';
import PhoneNumberInput from '@/components/ui/phone-input';
import { useUpdateSettingsMutation } from '@/data/settings';
import { ServerInfo, Settings, ShopSocialInput } from '@/types';

import { getIcon } from '@/utils/get-icon';
import { formatPrice } from '@/utils/use-price';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { socialIcon } from '@/settings/site.settings';

type FormValues = {
  siteTitle: string;
  siteSubtitle: string;
  minimumOrderAmount: number;
  server_info: ServerInfo;
  copyrightText: string;
};

type paymentGatewayOption = {
  name: string;
  title: string;
};

// const socialIcon = [
//   {
//     value: 'FacebookIcon',
//     label: 'Facebook',
//   },
//   {
//     value: 'InstagramIcon',
//     label: 'Instagram',
//   },
//   {
//     value: 'TwitterIcon',
//     label: 'Twitter',
//   },
//   {
//     value: 'YouTubeIcon',
//     label: 'Youtube',
//   },
// ];

export const updatedIcons = socialIcon.map((item: any) => {
  item.label = (
    <div className="flex items-center text-body space-s-4">
      <span className="flex items-center justify-center w-4 h-4">
        {getIcon({
          iconList: socialIcons,
          iconName: item.value,
          className: 'w-4 h-4',
        })}
      </span>
      <span>{item.label}</span>
    </div>
  );
  return item;
});

type IProps = {
  settings?: Settings | null;
};

// TODO: Split Settings
export default function SettingsForm({ settings }: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const [isCopied, setIsCopied] = useState(false);
  const today = new Date();
  const { mutate: updateSettingsMutation, isPending: loading } =
    useUpdateSettingsMutation();
  const { language, options } = settings ?? {};
  const [serverInfo, SetSeverInfo] = useState(options?.server_info);

  const {
    register,
    handleSubmit,
    control,
    getValues,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    shouldUnregister: true,
    //@ts-ignore
    resolver: yupResolver(settingsValidationSchema),
    defaultValues: {
      ...options,
      server_info: serverInfo,

      copyrightText: options?.copyrightText ?? '',
    },
  });

  const { openModal } = useModalAction();

  // const upload_max_filesize = options?.server_info?.upload_max_filesize! / 1024;
  // const isNotDefaultSettingsPage = Config.defaultLanguage !== locale;

  async function onSubmit(values: any) {
    updateSettingsMutation({
      language: locale,
      options: {
        ...options,
        ...values,
        server_info: serverInfo,
        logo: values?.logo,
        collapseLogo: values?.collapseLogo,
        footer_text: options?.footer_text,
        contactDetails: {
          ...options?.contactDetails,
          ...values.contactDetails,
        },
        heroSlides: options?.heroSlides ?? [],
        messages: options?.messages ?? {},
        copyrightText: values.copyrightText,
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <Input
            label={t('Site Title')}
            toolTipText={t('Your business name displayed in the browser tab')}
            {...register('siteTitle')}
            error={t(errors.siteTitle?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('Site Subtitle')}
            toolTipText={t('A tagline or short description for your business')}
            {...register('siteSubtitle')}
            error={t(errors.siteSubtitle?.message!)}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('Minimum Order Amount')}
            {...register('minimumOrderAmount')}
            type="number"
            error={t(errors.minimumOrderAmount?.message!)}
            variant="outline"
            className="mb-5"
            // disabled={isNotDefaultSettingsPage}
          />

          <div className="mb-5">
            <PhoneNumberInput
              label={t('form:form-input-label-contact')}
              toolTipText={t('form:form-input-tip-contact')}
              name="contactDetails.contact"
              control={control}
              className="mb-5"
            />
          </div>

        </Card>
      </div>

      <div className="text-end">
        <Button
          loading={loading}
          disabled={loading}
          className="text-sm md:text-base"
        >
          {t('form:button-label-save-settings')}
        </Button>
      </div>
    </form>
  );
}
