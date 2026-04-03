<script lang="ts">
	import { onDestroy, tick } from 'svelte';
	import messages from '$lib/content/messages.json';
	import {
		createReservationCalendarFile,
		LOCATION_OPTIONS,
		RESERVATION_DETAILS
	} from '$lib/reservation-calendar';

	const reservationFormatter = new Intl.DateTimeFormat('th-TH', {
		dateStyle: 'full',
		timeStyle: 'short'
	});

	const timeSlots: string[] = [];
	for (let h = 11; h <= 20; h++) {
		timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
		if (h < 20) timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
	}

	let reservationDate = $state('');
	let reservationTime = $state('');
	let selectedLocationId = $state(LOCATION_OPTIONS[0].id);
	let errorMessage = $state('');
	let downloadHref = $state('');
	let downloadFilename = $state('');
	let downloadLink = $state<HTMLAnchorElement | null>(null);
	let selectedLocation = $derived(
		LOCATION_OPTIONS.find((option) => option.id === selectedLocationId) ?? LOCATION_OPTIONS[0]
	);

	const reservationPreview = $derived.by(() => {
		if (!reservationDate || !reservationTime) {
			return '';
		}

		const reservationStart = `${reservationDate}T${reservationTime}`;

		if (!reservationStart) {
			return '';
		}

		const parsedDate = new Date(reservationStart);

		return Number.isNaN(parsedDate.getTime()) ? '' : reservationFormatter.format(parsedDate);
	});

	function releaseDownload(): void {
		if (downloadHref) {
			URL.revokeObjectURL(downloadHref);
			downloadHref = '';
		}
	}

	function getReservationStart(): string {
		if (!reservationDate || !reservationTime) {
			return '';
		}

		return `${reservationDate}T${reservationTime}`;
	}

	async function handleSubmit(): Promise<void> {
		const reservationStart = getReservationStart();

		if (!reservationStart) {
			errorMessage = messages.errors.missingReservationDateTime;
			return;
		}

		try {
			const calendarFile = createReservationCalendarFile(reservationStart, {
				details: {
					...RESERVATION_DETAILS,
					location: selectedLocation.label,
					mapUrl: selectedLocation.mapUrl
				}
			});

			releaseDownload();
			downloadFilename = calendarFile.filename;
			downloadHref = URL.createObjectURL(
				new Blob([calendarFile.content], {
					type: 'text/calendar;charset=utf-8'
				})
			);
			errorMessage = '';

			await tick();
			downloadLink?.click();
		} catch (error) {
			releaseDownload();
			errorMessage =
				error instanceof Error ? error.message : messages.errors.unableToGenerateCalendarFile;
		}
	}

	function handleReservationInput(): void {
		if (errorMessage) {
			errorMessage = '';
		}
	}

	onDestroy(() => {
		releaseDownload();
	});
</script>

<svelte:head>
	<title>Create Shindo Calendar</title>
	<meta
		name="description"
		content="Create a downloadable calendar reminder for Shindo Ramen reservation."
	/>
</svelte:head>

<main class="min-h-screen bg-background px-4 py-6 text-neutral-900 sm:px-6 sm:py-10">
	<div class="mx-auto flex max-w-xl flex-col gap-5">
		<section
			class="overflow-hidden rounded-3xl border border-background-300 bg-background-50 shadow-sm"
		>
			<div class="border-b border-background-300 bg-primary-100 px-5 py-5 sm:px-8 sm:py-7">
				<h1 class="text-3xl leading-snug font-semibold text-neutral-900 sm:text-4xl">
					สร้าง Event เตือนจอง Shindo Ramen
				</h1>
			</div>

			<div class="px-5 py-5 sm:px-8 sm:py-8">
				<div class="space-y-5">
					<div class="rounded-3xl border border-background-300 bg-background-100 p-4 sm:p-5">
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label
									for="reservation-date"
									class="text-sm font-medium text-neutral-700"
								>
									วันที่จอง
								</label>
								<input
									id="reservation-date"
									name="reservation-date"
									type="date"
									bind:value={reservationDate}
									oninput={handleReservationInput}
									class="mt-2 block w-full rounded-2xl border border-background-300 bg-background-50 px-4 py-3 text-base text-neutral-900 shadow-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
								/>
							</div>
							<div>
								<label
									for="reservation-time"
									class="text-sm font-medium text-neutral-700"
								>
									เวลาจอง
								</label>
								<input
									id="reservation-time"
									name="reservation-time"
									type="time"
									list="time-slots"
									bind:value={reservationTime}
									onchange={handleReservationInput}
									class="mt-2 block w-full rounded-2xl border border-background-300 bg-background-50 px-4 py-3 text-base text-neutral-900 shadow-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
								/>
								<datalist id="time-slots">
									{#each timeSlots as slot}
										<option value={slot}></option>
									{/each}
								</datalist>
							</div>
						</div>
						<div class="mt-4">
							<p class="text-sm font-medium text-neutral-700">
								ปักหมุดที่ไหน
							</p>
							<div class="mt-2 flex flex-wrap gap-2">
								{#each LOCATION_OPTIONS as option}
									<button
										type="button"
										onclick={() => {
											selectedLocationId = option.id;
											handleReservationInput();
										}}
										class={`rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-background ${
											selectedLocationId === option.id
												? 'border-primary-600 bg-primary text-primary-foreground'
												: 'border-background-300 bg-background-50 text-neutral-700 hover:border-primary-300 hover:bg-primary-50'
										}`}
										aria-pressed={selectedLocationId === option.id}
									>
										{option.label}
									</button>
								{/each}
							</div>
						</div>
						{#if reservationPreview}
							<p class="mt-3 text-sm font-medium text-neutral-700">
								{messages.feedback.selectedPrefix}<br>{reservationPreview}
							</p>
						{/if}
						{#if errorMessage}
							<p class="mt-3 rounded-2xl bg-semantic-danger px-3 py-2 text-sm text-neutral-foreground">
								{errorMessage}
							</p>
						{/if}
					</div>

					<div class="flex flex-col items-center gap-3">
						<button
							type="button"
							onclick={handleSubmit}
							class="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-primary-600 bg-primary px-5 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-background"
						>
							ดาวน์โหลดลงปฏิทิน
						</button>
					</div>

					<a
						bind:this={downloadLink}
						href={downloadHref}
						download={downloadFilename}
						class="hidden"
						aria-hidden="true"
						tabindex="-1"
					>
					</a>
				</div>
			</div>
		</section>
	</div>
</main>
