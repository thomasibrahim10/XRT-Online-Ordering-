import parsePhoneNumber from 'libphonenumber-js';
import { useMemo } from 'react';

export const useFormatPhoneNumber = ({
  customer_contact,
}: {
  customer_contact: string;
}) => {
  const phoneNumber = useMemo(() => {
    if (!customer_contact) return '';
    try {
      const number = parsePhoneNumber(`+${customer_contact}`);
      return number?.formatInternational() ?? customer_contact;
    } catch (error) {
      return customer_contact;
    }
  }, [customer_contact]);

  return phoneNumber;
};
