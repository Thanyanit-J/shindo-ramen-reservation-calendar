/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />

import { base, build, files, prerendered, version } from '$service-worker';

const worker = globalThis as unknown as ServiceWorkerGlobalScope;
const CACHE_PREFIX = 'shindo-calendar-';
const CACHE_NAME = `${CACHE_PREFIX}${version}`;
const APP_SHELL = `${base}/`;
const PRECACHE_URLS = [...new Set([APP_SHELL, ...build, ...files, ...prerendered])];
const PRECACHE_PATHS = new Set(
	PRECACHE_URLS.map((url) => new URL(url, worker.location.origin).pathname)
);

worker.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => cache.addAll(PRECACHE_URLS))
			.then(() => worker.skipWaiting())
	);
});

worker.addEventListener('activate', (event) => {
	event.waitUntil(
		Promise.all([
			caches
				.keys()
				.then((cacheNames) =>
					Promise.all(
						cacheNames
							.filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
							.map((cacheName) => caches.delete(cacheName))
					)
				),
			worker.clients.claim()
		])
	);
});

worker.addEventListener('fetch', (event) => {
	const { request } = event;

	if (request.method !== 'GET') {
		return;
	}

	const url = new URL(request.url);

	if (url.origin !== worker.location.origin) {
		return;
	}

	if (PRECACHE_PATHS.has(url.pathname)) {
		event.respondWith(cacheFirst(request));
		return;
	}

	event.respondWith(networkFirst(request, request.mode === 'navigate' ? APP_SHELL : undefined));
});

async function cacheFirst(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request, { ignoreSearch: true });

	return cachedResponse ?? fetch(request);
}

async function networkFirst(request: Request, fallbackUrl?: string): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);

	try {
		const response = await fetch(request);

		if (response.ok) {
			await cache.put(request, response.clone());
		}

		return response;
	} catch {
		const cachedResponse = await cache.match(request, {
			ignoreSearch: request.mode === 'navigate'
		});

		if (cachedResponse) {
			return cachedResponse;
		}

		if (fallbackUrl) {
			const fallbackResponse = await cache.match(fallbackUrl);

			if (fallbackResponse) {
				return fallbackResponse;
			}
		}

		return new Response('Offline', {
			status: 503,
			statusText: 'Offline',
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}
}
