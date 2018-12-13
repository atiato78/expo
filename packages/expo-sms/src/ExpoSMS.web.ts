import filter from 'lodash.filter';
import qs from 'query-string';

import { SMSResponse } from './SMS.types';

function checkValue(value?: string[] | string): string | null {
  if (!value) {
    return null;
  }

  const arr = Array.isArray(value) ? value : [value];
  return arr.join(',');
}

export default {
  get name(): string {
    return 'ExpoSMS';
  },
  async isAvailableAsync(): Promise<boolean> {
    return true;
  },
  async sendSMSAsync(addresses: string[], message: string): Promise<SMSResponse> {
    const sms = filter({
      addresses,
      body: message,
    });

    const query = qs.stringify(sms);
    const queryComponent = query ? '?' + query : '';
    // const to = checkValue(addresses);
    // const recipientComponent = to || '';
    // const mailto = `sms:${recipientComponent}${queryComponent}`;

    // iOS 11.3.1
    const mailto = `sms:/open${queryComponent}`;
    window.open(mailto);

    return { result: 'initiated' };
  },
};
