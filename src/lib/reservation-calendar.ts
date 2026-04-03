import messages from '$lib/content/messages.json';

export type ReservationDetails = {
	name: string;
	location: string;
	mapUrl?: string;
	durationMinutes: number;
	title: string;
	notes: string;
};

export type LocationOption = {
	id: string;
	label: string;
	mapUrl: string;
};

export type CalendarFile = {
	filename: string;
	content: string;
};

export const LOCATION_OPTIONS: LocationOption[] = [
	{
		id: 'shindo-ramen',
		label: 'Shindo Ramen',
		mapUrl: 'https://maps.app.goo.gl/M1ECt6TLt2BMG7ot7'
	},
	{
		id: 'true-space-mahidol-salaya',
		label: 'True Space มหิดล ศาลายา',
		mapUrl: 'https://maps.app.goo.gl/4Q6c8Q6joNzXudCu5'
	},
	{
		id: 'mahidol-gate-5',
		label: 'ม.มหิดล (ประตู 5)',
		mapUrl: 'https://maps.app.goo.gl/DCDewHmRujcA8zsW7'
	}
];

export const RESERVATION_DETAILS: ReservationDetails = {
	name: 'Shindo Ramen',
	location: LOCATION_OPTIONS[0].mapUrl,
	durationMinutes: 60,
	title: 'Shindo Ramen',
	notes: ''
};

function padDatePart(value: number): string {
	return value.toString().padStart(2, '0');
}

function formatIcsTimestamp(date: Date): string {
	return (
		date.getUTCFullYear().toString() +
		padDatePart(date.getUTCMonth() + 1) +
		padDatePart(date.getUTCDate()) +
		'T' +
		padDatePart(date.getUTCHours()) +
		padDatePart(date.getUTCMinutes()) +
		padDatePart(date.getUTCSeconds()) +
		'Z'
	);
}

function escapeIcsText(value: string): string {
	return value
		.replaceAll('\\', String.raw`\\`)
		.replaceAll(';', String.raw`\;`)
		.replaceAll(',', String.raw`\,`)
		.replaceAll('\n', String.raw`\n`);
}

function createFilename(startLocal: string): string {
	const [date = 'reservation', time = '0000'] = startLocal.split('T');

	return `shindo-reservation-${date}-${time.replace(':', '')}.ics`;
}

export function createReservationCalendarFile(
	startLocal: string,
	options: { now?: Date; details?: ReservationDetails } = {}
): CalendarFile {
	const startDate = new Date(startLocal);

	if (Number.isNaN(startDate.getTime())) {
		throw new TypeError(messages.errors.invalidReservationStartTime);
	}

	const details = options.details ?? RESERVATION_DETAILS;
	const endDate = new Date(startDate.getTime() + details.durationMinutes * 60_000);
	const issuedAt = options.now ?? new Date();
	const uid = `reservation-${startDate.getTime()}@shindo-calendar.local`;
	const description = details.notes;
	const content = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Shindo Calendar//Reservation Reminder//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${formatIcsTimestamp(issuedAt)}`,
		`DTSTART:${formatIcsTimestamp(startDate)}`,
		`DTEND:${formatIcsTimestamp(endDate)}`,
		`SUMMARY:${escapeIcsText(details.title)}`,
		`LOCATION:${escapeIcsText(details.mapUrl ?? details.location)}`,
		`DESCRIPTION:${escapeIcsText(description)}`,
		'END:VEVENT',
		'END:VCALENDAR'
	].join('\r\n');

	return {
		filename: createFilename(startLocal),
		content
	};
}
