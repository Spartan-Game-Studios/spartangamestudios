import { defineConfig } from 'vitepress';

// The wiki is a VitePress static site served at /wiki/, built into the main
// site's dist so it deploys alongside the React app on one GitHub Pages site.
// Content is markdown under wiki/<game>/, edited via pull request.
export default defineConfig({
  base: '/wiki/',
  outDir: '../dist/wiki',
  lang: 'en-US',
  title: 'Spartan Game Studios Wiki',
  description: 'Community-maintained wikis for Spartan Game Studios games.',
  appearance: 'force-dark',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    siteTitle: 'SGS Wiki',
    nav: [
      { text: 'Boothill', link: '/boothill/' },
      { text: 'Inkbreak', link: '/inkbreak/' },
      { text: 'Nightside', link: '/nightside/' },
      { text: '← spartangamestudios.com', link: 'https://spartangamestudios.com' },
    ],
    sidebar: {
      '/boothill/': [
        {
          text: 'Boothill',
          items: [
            { text: 'Overview', link: '/boothill/' },
            { text: 'Operators', link: '/boothill/operators' },
          ],
        },
      ],
      '/inkbreak/': [{ text: 'Inkbreak', items: [{ text: 'Overview', link: '/inkbreak/' }] }],
      '/nightside/': [{ text: 'Nightside', items: [{ text: 'Overview', link: '/nightside/' }] }],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Spartan-Game-Studios' }],
    editLink: {
      pattern: 'https://github.com/Spartan-Game-Studios/spartangamestudios/edit/main/wiki/:path',
      text: 'Edit this page on GitHub',
    },
    footer: {
      message: 'Edit these pages with a pull request — no account needed.',
      copyright: 'Spartan Game Studios',
    },
    search: { provider: 'local' },
  },
});
