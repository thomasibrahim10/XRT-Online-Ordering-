import Card from '@/components/common/card';
import Button from '@/components/ui/button';
import Description from '@/components/ui/description';
import FileInput from '@/components/ui/file-input';
import Input from '@/components/ui/input';
import PhoneNumberInput from '@/components/ui/phone-input';
import TextArea from '@/components/ui/text-area';
import { useUpdateSettingsMutation } from '@/data/settings';
import { formatAddress } from '@/utils/format-address';
import { siteSettings } from '@/settings/site.settings';
import { Settings, UserAddress } from '@/types';
import { HeroSlide } from '@/types';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useFieldArray, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { landingSettingsValidationSchema } from './landing-settings-validation-schema';

type FormValues = {
  logo: any;
  collapseLogo: any;
  footer_text: string;
  siteLink: string;
  copyrightText: string;
  contactDetails: {
    location?: {
      city?: string;
      country?: string;
      state?: string;
      zip?: string;
      street_address?: string;
    };
    contact?: string;
    website?: string;
    emailAddress?: string;
  };
  messages: {
    closed_message: string;
    not_accepting_orders_message: string;
  };
  heroSlides: HeroSlide[];
};

type IProps = {
  settings: Settings;
};

export default function LandingSettingsForm({ settings }: IProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const { mutate: updateSettingsMutation, isPending: loading } =
    useUpdateSettingsMutation();
  const options = settings?.options ?? {};
  const max_fileSize = options?.server_info?.upload_max_filesize
    ? options.server_info.upload_max_filesize / 1024
    : 0;
  const logoInformation = (
    <span>
      {t('form:logo-help-text')} <br />
      {t('form:logo-dimension-help-text')} &nbsp;
      <span className="font-bold">
        {siteSettings.logo.width}x{siteSettings.logo.height} {t('common:pixel')}
      </span>
      <br />
      {t('form:size-help-text')} &nbsp;
      <span className="font-bold">{max_fileSize} MB </span>
    </span>
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(landingSettingsValidationSchema) as any,
    defaultValues: {
      logo: options?.logo ?? '',
      collapseLogo: options?.collapseLogo ?? '',
      footer_text: options?.footer_text ?? '',
      siteLink: options?.siteLink ?? '',
      copyrightText: options?.copyrightText ?? '',
      contactDetails: {
        ...options?.contactDetails,
        contact: options?.contactDetails?.contact ?? '',
        location: options?.contactDetails?.location ?? {},
        website: options?.contactDetails?.website ?? '',
        emailAddress: (options?.contactDetails as any)?.emailAddress ?? '',
      },
      messages: {
        closed_message: options?.messages?.closed_message ?? '',
        not_accepting_orders_message:
          options?.messages?.not_accepting_orders_message ?? '',
      },
      heroSlides: options?.heroSlides ?? [],
    },
  });

  const {
    fields: heroSlideFields,
    append: appendHeroSlide,
    remove: removeHeroSlide,
  } = useFieldArray({
    control,
    name: 'heroSlides',
  });

  function onSubmit(values: FormValues) {
    const contactDetails = {
      ...options?.contactDetails,
      ...values.contactDetails,
      location: values.contactDetails?.location
        ? {
            ...values.contactDetails.location,
            formattedAddress: formatAddress(
              values.contactDetails.location as UserAddress,
            ),
          }
        : options?.contactDetails?.location,
    };
    updateSettingsMutation({
      language: locale!,
      options: {
        ...options,
        logo: values.logo,
        collapseLogo: values.collapseLogo,
        footer_text: values.footer_text,
        siteLink: values.siteLink,
        copyrightText: values.copyrightText,
        contactDetails,
        messages: {
          closed_message: values.messages.closed_message,
          not_accepting_orders_message:
            values.messages.not_accepting_orders_message,
        },
        heroSlides: values.heroSlides ?? [],
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:input-label-logo')}
          details={logoInformation}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full logo-field-area sm:w-8/12 md:w-2/3">
          <FileInput name="logo" control={control} multiple={false} />

          <div className="mt-5">
            <span className="block mb-2 text-sm text-body">
              {t('Collapsed Logo')}
            </span>
            <FileInput name="collapseLogo" control={control} multiple={false} />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-information')}
          details={t('form:site-info-help-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="mb-5">
            <TextArea
              label={t('Closed Message')}
              toolTipText={t(
                'Message displayed when your restaurant is closed',
              )}
              {...register('messages.closed_message')}
              variant="outline"
              className="mb-5"
            />
          </div>

          <div className="mb-5">
            <TextArea
              label={t('Not Accepting Orders Message')}
              toolTipText={t(
                'Message displayed when you are not accepting orders',
              )}
              {...register('messages.not_accepting_orders_message')}
              variant="outline"
              className="mb-5"
            />
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:form-title-footer-information')}
          details={t('form:site-info-footer-description')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <TextArea
            label={t('Footer Description')}
            toolTipText={t(
              'Text displayed as a description in the website footer',
            )}
            {...register('footer_text')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:input-label-site-link')}
            toolTipText={t('form:input-tooltip-site-link')}
            {...register('siteLink')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('Copyright Text')}
            toolTipText={t('Copyright notice displayed in footer')}
            {...register('copyrightText')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('form:footer-address')}
          details={t('form:footer-address-helper-text')}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <Input
              label={t('text-city')}
              toolTipText={t('City where your business is located')}
              {...register('contactDetails.location.city')}
              variant="outline"
            />
            <Input
              label={t('text-country')}
              toolTipText={t('Country where your business operates')}
              {...register('contactDetails.location.country')}
              variant="outline"
            />
            <Input
              label={t('text-state')}
              toolTipText={t('State or province of your business')}
              {...register('contactDetails.location.state')}
              variant="outline"
            />
            <Input
              label={t('text-zip')}
              toolTipText={t('Postal or ZIP code')}
              {...register('contactDetails.location.zip')}
              variant="outline"
            />
            <TextArea
              label={t('text-street-address')}
              toolTipText={t('Full street address of your business')}
              {...register('contactDetails.location.street_address')}
              variant="outline"
              className="col-span-full"
            />
          </div>
          <PhoneNumberInput
            label={t('form:form-input-label-contact')}
            toolTipText={t('form:form-input-tip-contact')}
            name="contactDetails.contact"
            control={control}
          />
          <Input
            label={t('form:form-input-label-website')}
            toolTipText={t('form:form-input-tip-website')}
            {...register('contactDetails.website')}
            variant="outline"
            className="mb-5"
          />
          <Input
            label={t('form:form-input-label-email')}
            toolTipText={t('form:form-input-tip-email')}
            {...register('contactDetails.emailAddress')}
            variant="outline"
            className="mb-5"
          />
        </Card>
      </div>

      <div className="flex flex-wrap pb-8 my-5 border-b border-dashed border-border-base sm:my-8">
        <Description
          title={t('Hero Slider')}
          details={t(
            'Manage homepage banner slides with images, titles, and buttons',
          )}
          className="w-full px-0 pb-5 sm:w-4/12 sm:py-8 sm:pe-4 md:w-1/3 md:pe-5"
        />

        <Card className="w-full sm:w-8/12 md:w-2/3">
          {heroSlideFields.map((slide, index) => (
            <div
              key={slide.id}
              className="py-5 border-b border-dashed border-border-200 last:border-b-0"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">
                  {t('Slide')} {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeHeroSlide(index)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  {t('Remove')}
                </button>
              </div>

              <div className="mb-4">
                <FileInput
                  name={`heroSlides.${index}.bgImage`}
                  control={control}
                  multiple={false}
                  label={t('Background Image')}
                  toolTipText={t('Upload background image for this slide')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={t('Title')}
                  toolTipText={t('Main heading for this slide')}
                  {...register(`heroSlides.${index}.title`)}
                  variant="outline"
                />
                <Input
                  label={t('Subtitle')}
                  {...register(`heroSlides.${index}.subtitle`)}
                  variant="outline"
                />
                <Input
                  label={t('Offer Text')}
                  toolTipText={t('Promotional text e.g. "Sale 30% Off"')}
                  {...register(`heroSlides.${index}.offer`)}
                  variant="outline"
                />
                <Input
                  label={t('Button Text')}
                  toolTipText={t('Text displayed on the call-to-action button')}
                  {...register(`heroSlides.${index}.btnText`)}
                  variant="outline"
                />
                <Input
                  label={t('Button Link')}
                  toolTipText={t('URL the button links to')}
                  {...register(`heroSlides.${index}.btnLink`)}
                  variant="outline"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            onClick={() =>
              appendHeroSlide({
                bgImage: undefined,
                title: '',
                subtitle: '',
                offer: '',
                btnText: '',
                btnLink: '',
              })
            }
            className="w-full sm:w-auto mt-4"
            variant="outline"
          >
            {t('Add New Slide')}
          </Button>

          <div className="flex justify-end mt-6">
            <Button type="submit" loading={loading}>
              {t('form:button-label-save-settings')}
            </Button>
          </div>
        </Card>
      </div>
    </form>
  );
}
