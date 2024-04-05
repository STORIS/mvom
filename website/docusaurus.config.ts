import * as path from 'node:path';
import npm2YarnPlugin from '@docusaurus/remark-plugin-npm2yarn';
import type { Config } from '@docusaurus/types';
import { themes } from 'prism-react-renderer';

const { github: lightCodeTheme, dracula: darkCodeTheme } = themes;

const config: Config = {
	title: 'MVOM',
	tagline: 'An ORM for Multivalue Databases and Node.js',
	url: 'https://storis.github.io',
	baseUrl: '/mvom/',
	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	// TODO: Add a favicon
	// favicon: 'img/favicon.ico',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'STORIS', // Usually your GitHub org/user name.
	projectName: 'mvom', // Usually your repo name.

	// Even if you don't use internalization, you can use this field to set useful
	// metadata like html lang. For example, if your site is Chinese, you may want
	// to replace "en" with "zh-Hans".
	i18n: {
		defaultLocale: 'en',
		locales: ['en'],
	},

	presets: [
		[
			'@docusaurus/preset-classic',
			{
				docs: {
					sidebarPath: path.join(__dirname, 'sidebars.js'),
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl: 'https://github.com/STORIS/mvom/tree/main/website',
					lastVersion: 'current',
					versions: {
						current: {
							label: '2.0.0-rc.1',
						},
					},
					remarkPlugins: [[npm2YarnPlugin, { sync: true }]],
				},
				blog: false,
				theme: {
					customCss: require.resolve('./src/css/custom.css'),
				},
			},
		],
	],

	themeConfig: {
		navbar: {
			title: 'MVOM',
			// TODO: Add a Logo
			// logo: {
			// 	alt: 'My Site Logo',
			// 	src: 'img/logo.svg',
			// },
			items: [
				{
					type: 'doc',
					docId: 'Introduction/what_is_mvom',
					position: 'left',
					label: 'Documentation',
				},
				{
					type: 'docsVersion',
					label: '2.0.0-rc.1',
					position: 'right',
				},
				{
					href: 'https://github.com/storis/mvom',
					className: 'header-github-link',
					position: 'right',
				},
			],
		},
		footer: {
			style: 'dark',
			copyright: `Copyright © ${new Date().getFullYear()} STORIS, Inc. Built with Docusaurus.`,
		},
		prism: {
			theme: lightCodeTheme,
			darkTheme: darkCodeTheme,
		},
		algolia: {
			appId: 'UD0JDGWB9I',
			apiKey: 'e8179dd39c96308fa4aaeff9bea394e3', // this is public and can be committed
			indexName: 'mvom',
			contextualSearch: true,
		},
	},
};

export default config;
