import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

// GitHub Pages ではこのサイトを https://baco16g.github.io/pawgress/docs/ から配信する。
export default withMermaid(
  defineConfig({
    lang: 'ja',
    title: 'Pawgress Docs',
    description: 'Pawgress のプロダクト仕様・UX設計・実装構成ドキュメント',
    base: '/pawgress/docs/',
    cleanUrls: true,
    themeConfig: {
      nav: [
        { text: 'トップ', link: '/' },
        { text: 'アーキテクチャ', link: '/architecture' },
      ],
      sidebar: [
        {
          text: 'ドキュメント',
          items: [
            { text: 'プロダクト仕様', link: '/product-spec' },
            { text: 'UX仕様', link: '/ux-spec' },
            { text: 'アーキテクチャ', link: '/architecture' },
            { text: '品質目標', link: '/quality-targets' },
            { text: '開発の進め方', link: '/development-workflow' },
            { text: '用語集', link: '/glossary' },
          ],
        },
      ],
      socialLinks: [{ icon: 'github', link: 'https://github.com/baco16g/pawgress' }],
    },
  }),
)
