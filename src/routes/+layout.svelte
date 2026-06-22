<script lang="ts">
	import { asset } from '$app/paths';
	import './layout.css';

	let { children } = $props();

	const faviconHref = asset('/icons/icon-192.png');
	const manifestHref = asset('/manifest.webmanifest');
	const appleTouchIconHref = asset('/icons/apple-touch-icon.png');
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="192x192" href={faviconHref} />
	<link rel="manifest" href={manifestHref} />
	<link rel="apple-touch-icon" href={appleTouchIconHref} />
	<meta name="theme-color" content="#d6a77a" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />
	<meta name="apple-mobile-web-app-title" content="Shindo Calendar" />
</svelte:head>
{@render children()}
