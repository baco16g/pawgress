# Pawgress

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./public/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./public/logo-light.svg">
  <img alt="Pawgress" src="./public/logo-light.svg" width="360">
</picture>

犬・猫の相棒と一緒に、今日のタスクに取り組み一日を振り返るモバイルファーストの TODO アプリ。

## Core concept

タスク管理の負担を減らすという設計思想、日次ループ、やらないことの一覧は [docs/product-spec.md](./docs/product-spec.md) にまとめています。

## Documentation

| 文書                                                           | 役割                                                        |
| -------------------------------------------------------------- | ----------------------------------------------------------- |
| [docs/product-spec.md](./docs/product-spec.md)                 | プロダクト仕様（唯一の正式仕様）                            |
| [docs/ux-spec.md](./docs/ux-spec.md)                           | 情報設計・画面ごとの振る舞い                                |
| [docs/architecture.md](./docs/architecture.md)                 | 実装構成（レイヤー図・状態遷移・主要シーケンス図、Mermaid） |
| [docs/quality-targets.md](./docs/quality-targets.md)           | パフォーマンス・アクセシビリティ・品質目標                  |
| [docs/development-workflow.md](./docs/development-workflow.md) | 企画の背景・開発の進め方                                    |
| [docs/glossary.md](./docs/glossary.md)                         | 用語集（ユビキタス言語）                                    |

## Where to start（レビューの読み進め方）

1. [docs/architecture.md](./docs/architecture.md) — レイヤー構成・状態遷移・主要シーケンス図（Mermaid）で全体像を掴みます
2. [src/app/router/router.tsx](./src/app/router/router.tsx) — route定義の全体像
3. [src/features/today/routes/TodayRoute.tsx](./src/features/today/routes/TodayRoute.tsx) — Today lifecycle（詳細は `docs/architecture.md` §2）の中心
4. [src/domain/](./src/domain/) — Product Day・daily lifecycle reducer・History・Review・Settings・Task の business logic（React非依存の純粋なTypeScript）
5. [src/features/](./src/features/) — 製品機能ごとに route・screen・feature-local UI がまとまっています（today / inbox / review / history / settings / companion）
6. [src/shared/ui/](./src/shared/ui/) — featureに依存しない汎用UI primitive（Button、TaskItem、InlineAddRow など）

### ディレクトリ構成（layer architecture）

レイヤー間の import 制約と各層の内訳は [docs/architecture.md](./docs/architecture.md) §1 を参照してください。

- `src/testing/` — Storybook / テスト専用のfixture・ヘルパー（`.stories.tsx` / `.test.tsx` 以外からの import 不可）

### 品質ゲート

変更の最低条件となるコマンドは [docs/development-workflow.md](./docs/development-workflow.md) §15、アクセシビリティ基準は [docs/quality-targets.md](./docs/quality-targets.md) を参照してください。

## セットアップ

Node.js 22 系を使用します（[.nvmrc](./.nvmrc)）。

```bash
npm install
```

## 主なコマンド

| コマンド                                  | 内容                             |
| ----------------------------------------- | -------------------------------- |
| `npm run dev`                             | 開発サーバーを起動               |
| `npm run build`                           | 型チェック付き本番ビルド         |
| `npm run preview`                         | 本番ビルドをローカルでプレビュー |
| `npm run typecheck`                       | TypeScript の型チェックのみ      |
| `npm run lint` / `npm run lint:fix`       | ESLint                           |
| `npm run format` / `npm run format:check` | Prettier                         |
| `npm test`                                | Vitest（単体テスト）を1回実行    |
| `npm run test:watch`                      | Vitest をウォッチモードで実行    |
| `npm run storybook`                       | Storybook を起動                 |
| `npm run build-storybook`                 | Storybook の静的ビルド           |

`npm install` 時に Husky の Git フックが有効になります。
`pre-commit` で lint-staged（ESLint・Prettier）、`pre-push` で型チェックとユニットテストを実行します。

## デザインリファレンス

UI の検討では [Refero](https://refero.design/) や [kzhrknt/awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp) などの外部リファレンスも参考にしています。何を参考にしたか、どのように設計判断へ取り入れたかは [docs/development-workflow.md](./docs/development-workflow.md) §9 を参照してください。

## サードパーティアセット

相棒（犬・猫）キャラクターのドット絵アセットは CC0 の外部素材パックから採用しています。
出典・ライセンス・採用理由・不採用理由は
[src/features/companion/assets/NOTICE.md](./src/features/companion/assets/NOTICE.md)
を参照してください。
