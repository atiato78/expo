import { Platform } from '@unimodules/core';
import { Calendar } from 'expo';

import { executeUnavailabileMethod } from '../TestUtils';

export const name = 'Calendar';

const unavailableMessage = `is unavailable on ${Platform.OS}`;

/* AFAIK there is no native API for using Contacts on the web platform. */

const unavailableMethods = [
  'getCalendarsAsync',
  'createCalendarAsync',
  'updateCalendarAsync',
  'deleteCalendarAsync',
  'getEventsAsync',
  'getEventAsync',
  'createEventAsync',
  'updateEventAsync',
  'deleteEventAsync',
  'getAttendeesForEventAsync',
  'createAttendeeAsync',
  'updateAttendeeAsync',
  'deleteAttendeeAsync',
  'getRemindersAsync',
  'getReminderAsync',
  'createReminderAsync',
  'updateReminderAsync',
  'deleteReminderAsync',
  'getSourcesAsync',
  'getSourceAsync',
  'requestPermissionsAsync',
  'requestRemindersPermissionsAsync',
  'openEventInCalendar',
];

export async function test({ describe, it, expect }) {
  function testUnavailableMethod(methodName) {
    describe(`${name}.${methodName}()`, () => {
      it(unavailableMessage, () => executeUnavailabileMethod(expect, Calendar[methodName]));
    });
  }
  unavailableMethods.forEach(testUnavailableMethod);
}
