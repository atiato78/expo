import { Platform } from '@unimodules/core';
import { Contacts } from 'expo';

import { executeUnavailabileMethod } from '../TestUtils';

export const name = 'Contacts';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

/* AFAIK there is no native API for using Contacts on the web platform. */

export async function test({ describe, it, expect }) {
  describe('Contacts.addContactAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.addContactAsync));
  });
  describe('Contacts.writeContactToFileAsync()', () => {
    it(unavailableMessage, () =>
      executeUnavailabileMethod(expect, Contacts.writeContactToFileAsync)
    );
  });
  describe('Contacts.removeContactAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.removeContactAsync));
  });
  describe('Contacts.getContactsAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.getContactsAsync));
  });
  describe('Contacts.getContactByIdAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.getContactByIdAsync));
  });
  describe('Contacts.createGroupAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.createGroupAsync));
  });
  describe('Contacts.getGroupsAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.getGroupsAsync));
  });
  describe('Contacts.removeGroupAsync()', () => {
    it(unavailableMessage, () => executeUnavailabileMethod(expect, Contacts.removeGroupAsync));
  });
  describe('Contacts.getDefaultContainerIdAsync()', () => {
    it(unavailableMessage, () =>
      executeUnavailabileMethod(expect, Contacts.getDefaultContainerIdAsync)
    );
  });
}
