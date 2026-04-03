import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import messages from '$lib/content/messages.json';
import ReservationPage from './+page.svelte';

describe('reservation page', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:reservation');
		vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
	});

	it('guards empty submission and completes the download flow', async () => {
		render(ReservationPage);

		const pageShell = page.getByRole('main');
		const downloadButton = page.getByRole('button', { name: 'ดาวน์โหลดลงปฏิทิน' });
		const reservationDateInput = page.getByLabelText('วันที่จอง');
		const reservationTimeInput = page.getByLabelText('เวลาจอง');
		const reservationLocationButton = page.getByRole('button', {
			name: 'True Space มหิดล ศาลายา'
		});

		await expect.element(pageShell).toHaveClass(/bg-background/);
		await expect.element(downloadButton).toHaveClass(/bg-primary/);

		await downloadButton.click();
		await expect
			.element(page.getByText(messages.errors.missingReservationDateTime))
			.toBeInTheDocument();

		await reservationDateInput.fill('2026-04-10');
		await reservationTimeInput.fill('19:30');
		await reservationLocationButton.click();
		await downloadButton.click();

		await expect
			.element(page.getByText(new RegExp(messages.feedback.selectedPrefix)))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('link', { name: 'ดูหมุดแผนที่' }))
			.toHaveAttribute('href', 'https://maps.app.goo.gl/4Q6c8Q6joNzXudCu5');
	});
});
