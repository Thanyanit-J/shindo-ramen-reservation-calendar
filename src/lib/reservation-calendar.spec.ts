import { describe, expect, it } from 'vitest';
import messages from '$lib/content/messages.json';
import {
	createReservationCalendarFile,
	RESERVATION_DETAILS,
	type ReservationDetails
} from './reservation-calendar';

function formatUtc(date: Date): string {
	const parts = [
		date.getUTCFullYear().toString(),
		(date.getUTCMonth() + 1).toString().padStart(2, '0'),
		date.getUTCDate().toString().padStart(2, '0')
	];
	const time = [
		date.getUTCHours().toString().padStart(2, '0'),
		date.getUTCMinutes().toString().padStart(2, '0'),
		date.getUTCSeconds().toString().padStart(2, '0')
	];

	return `${parts.join('')}T${time.join('')}Z`;
}

describe('createReservationCalendarFile', () => {
	it('creates an ICS payload with the expected event details', () => {
		const reservationStartDatetime = '2026-04-10T19:30';
		const details: ReservationDetails = {
			...RESERVATION_DETAILS,
			location: 'True Space มหิดล ศาลายา',
			mapUrl: 'https://maps.app.goo.gl/4Q6c8Q6joNzXudCu5',
			description: 'Bring the booking reference.'
		};
		const startDate = new Date(reservationStartDatetime);
		const endDate = new Date(startDate.getTime() + details.durationMinutes * 60_000);
		const issuedAt = new Date(Date.UTC(2026, 3, 1, 9, 45, 0));
		const file = createReservationCalendarFile(reservationStartDatetime, { now: issuedAt, details });

		expect(file.filename).toBe('shindo-reservation-2026-04-10-1930.ics');
		expect(file.content).toContain('BEGIN:VCALENDAR');
		expect(file.content).toContain('BEGIN:VEVENT');
		expect(file.content).toContain(`DTSTAMP:${formatUtc(issuedAt)}`);
		expect(file.content).toContain(`DTSTART:${formatUtc(startDate)}`);
		expect(file.content).toContain(`DTEND:${formatUtc(endDate)}`);
		expect(file.content).toContain(`SUMMARY:${details.title}`);
		expect(file.content).toContain('LOCATION:True Space มหิดล ศาลายา');
		expect(file.content).toContain(
			String.raw`DESCRIPTION:Bring the booking reference.\nGoogle Maps: https://maps.app.goo.gl/4Q6c8Q6joNzXudCu5`
		);
		expect(file.content).toContain('URL:https://maps.app.goo.gl/4Q6c8Q6joNzXudCu5');
		expect(file.content).toContain('END:VEVENT');
		expect(file.content).toContain('END:VCALENDAR');
	});

	it('throws for invalid reservation times', () => {
		expect(() => createReservationCalendarFile('not-a-date')).toThrow(
			messages.errors.invalidReservationStartTime
		);
	});
});
