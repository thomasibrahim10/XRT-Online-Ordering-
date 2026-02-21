import * as yup from 'yup';

export const generalSettingsValidationSchema = yup.object().shape({
  minimumOrderAmount: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .moreThan(-1, 'form:error-sale-price-must-positive'),
});
