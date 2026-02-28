// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Wuhu',
			defaultLocale: 'root',
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/wuhu-labs',
				},
			],
			customCss: [],
			sidebar: [
				{
					label: 'Getting Started',
					slug: 'guides/getting-started',
				},
				{
					label: 'Architecture',
					slug: 'guides/architecture',
				},
				{
					label: 'Download',
					slug: 'download',
				},
				{
					label: 'API Reference',
					items: [
						{
							label: 'wuhu-ai',
							link: '/docs/wuhu-ai/',
							attrs: { target: '_blank' },
						},
						{
							label: 'wuhu-core',
							link: '/docs/wuhu-core/',
							attrs: { target: '_blank' },
						},
					],
				},
			],
		}),
	],
});
