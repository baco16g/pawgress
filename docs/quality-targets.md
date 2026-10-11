# Pawgress Quality Targets

測定可能な目標のみを記載し、実測していない項目を達成済みとして記載しません。

この文書は測定可能な品質目標、根拠、測定方法、既知の制約を定義します。`docs/product-spec.md`（何をするか）・`docs/ux-spec.md`（情報設計）とは独立した軸であり、どちらが優先するという関係にはありません。

区別する3分類:

```text
外部標準              — Core Web Vitals, WCAG 2.2 等、外部で定義された基準
Pawgress の品質基準    — Pawgress がリリース基準として採用する値
Pawgress のエンジニアリング予算 — 実測に基づく engineering 上の目安
```

Status 値:

```text
Pass
Fail
Not measured
Not applicable
```

作業中のメモは Evidence / Notes に書き、Status には書きません。

---

## 1. Accessibility

外部標準（`docs/product-spec.md` / `docs/ux-spec.md` と共有する最低要件）:

- WCAG 2.2 AA
- keyboard operable
- visible focus
- state を color のみで伝えません
- 200% zoom
- 320 CSS px reflow
- `prefers-reduced-motion` 対応
- screen reader で task state が理解できます

Normal text contrast >= 4.5:1、large text contrast >= 3:1（WCAG 2.2 AA、外部標準）。

### Touch target

- Minimum（外部標準, WCAG 2.2 AA / SC 2.5.8）: 24 × 24 CSS px、規定された例外があります。
- Enhanced（外部標準, WCAG 2.2 AAA / SC 2.5.5）: 44 × 44 CSS px、規定された例外があります。
- Primary control minimum（Pawgress の品質基準）: 44 × 44 CSS px。
- Recommended（Pawgress の品質基準）: 48 × 48 CSS px。

Pawgressのprimary control最低44pxは維持します。48pxは可能な限り満たす目標値です。Historyのdense date gridは最小24×40pxとし、月移動buttonは44×44px以上を維持します。Calendarだから自動的にWCAGの例外になるわけではありません。実測はspacing exceptionに依存せずAAの24×24pxを満たします。

根拠: [W3C SC 2.5.8 Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)、[SC 2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html)。

2026-10-11実測（production build、`npm run preview`、axe-core 4.13.0 を Playwright で注入、viewport 320/390/768/1440px × light/dark theme）。対象は到達可能な全画面・全状態（Today Setup / Active / Rest / Done、今日をやめる・今日を休む確認ダイアログ、Inbox、Review、History、Settings 本体 + サブ画面7件）。`<input>` がlabelで囲まれている場合は、実際にタップ可能な領域（label全体）で測定します（たとえばTaskItemの`<input>`自体は22×22pxですが、囲むlabelの行は`--touch-target-min: 44px`により44px以上です）。

| Target | Classification | Status | Evidence |
| --- | --- | --- | --- |
| WCAG 2.2 AA 準拠 | 外部標準 | Not measured | axe: 全画面・全viewport・両themeでviolations 0件。Lighthouse Accessibilityは100（自動判定24件中。手動確認が必要な10件はLighthouse側で対象外）。color-contrastがincompleteとなった要素はcomputed styleから実際の合成色で算出し、light/dark両themeで実測4.5:1基準を満たすことを確認済み（§3参照）。keyboard操作・visible focus・reduced motion・長い日本語タスク名の折り返しも確認済み（§3参照）。実機screen readerでの検証は未実施のため、AA全体準拠は申告しません |
| Touch target >= 24×24（SC 2.5.8） | 外部標準 | Pass | 到達可能な全画面・全状態×4 viewport×2 themeで24×24px未満の要素は0件 |
| Primary touch target >= 44×44 | Pawgress の品質基準 | Pass | 実際に操作するprimary control（チェックボックス行・ボタン・ナビリンク・入力欄・確認ダイアログ）は全画面で44px以上。44px未満として検出された2件はいずれもprimary controlの対象外: Historyのdense date grid（意図的に24px枠を採用、月移動buttonは44px以上を維持）と、Settings LicensesのCC0素材パック「配布元を見る」という補助的なinline link（94×27.5px、24px基準は満たす） |
| Touch target ~48×48（推奨） | Pawgress の品質基準 | Fail | 多くのprimary controlがちょうど44pxで、48pxまでは届いていません（例: Today Activeのタスク行・History月移動button等） |

---

## 2. Performance

### 2.1 Lighthouse（Pawgress の品質基準）

```text
Performance      >= 90
Accessibility    >= 95
Best Practices    >= 95
```

測定条件:

- production build（`npm run build` + `npm run preview`、またはそれに相当する static hosting）
- mobile Lighthouse profile
- 同一 fixture / route 条件で比較します
- 最低3回実行し median を報告します。best run を選びません。

Lighthouse スコアは lab evidence であり、production user の体験そのものを保証しません。

2026-10-11実測。条件: `npm run build`（gzip 202.80 KB、§2.3参照）→ `npm run preview` で `http://localhost:4173/pawgress/` を配信、Lighthouse CLI 12.8.2、headless Chrome、mobile form factor（`--screenEmulation.mobile --throttling-method=simulate`）、route固定（`/pawgress/` = Today Setupの初期状態、Inboxサンプル2件・未選択）で3回実行。3回のスコアはいずれも同一でした。

```text
Run 1: Performance 97 / Accessibility 100 / Best Practices 100
Run 2: Performance 97 / Accessibility 100 / Best Practices 100
Run 3: Performance 97 / Accessibility 100 / Best Practices 100
```

| Target | Status | Evidence |
| --- | --- | --- |
| Performance >= 90 | Pass | median 97（3回とも97） |
| Accessibility >= 95 | Pass | median 100（3回とも100）。Lighthouseのこのカテゴリは自動判定24件のみを採点し、手動確認が必要な10件（landmark、tab order等）は対象外のため、§1の「WCAG 2.2 AA 準拠」を直接保証しません |
| Best Practices >= 95 | Pass | median 100（3回とも100） |

### 2.2 Core Web Vitals（外部標準）

```text
LCP <= 2.5 s
INP <= 200 ms
CLS <= 0.1
```

Pawgress は小規模な mobile-first SPA であり、これらの標準 "Good" threshold をそのまま採用します。Pawgress 独自に厳格化しません。production field data（RUM）が無い間は `Not measured` として報告し、Lighthouse / TBT から INP を推定しません。field data がある場合は 75th percentile で評価します。

参考（lab evidence、§2.1と同一の測定条件）: LCP 2.3 s、CLS 0、TBT 0〜10 ms。これらはfield data（RUM）ではないため、上記のStatus判定を変更しません。

### 2.3 JS bundle budget（Pawgress のエンジニアリング予算）

```text
Initial JS (gzip) <= 250 KB
```

根拠: 実装初期段階（Today/Inbox/Review/History 等の機能実装前）で `npm run build` を実測したところ、initial JS chunk は raw 460.28 KB / gzip 186.18 KB（単一chunk、route-level code splitting 未導入、依存は react 19 / react-dom 19 / react-router 7 / clsx のみ）でした。固定の 150KB を根拠なく復活させず、実測値に対して今後の機能実装分の headroom を確保した値として 250KB を設定しました。

主要画面（Today/Inbox/Review/History/Settings）実装完了後の実測は **gzip 202.80 KB**（2026-10-11、全画面実装完了後の最新build）、250KB以内に収まっています。この予算250KBを確定とします。予算を超える場合はroute-level code splittingを検討します。

| Target | Classification | Status | Evidence |
| --- | --- | --- | --- |
| Initial JS gzip <= 250 KB | Pawgress のエンジニアリング予算 | Met（実測 202.80 KB） | `npm run build` output（2026-10-11） |

### 2.4 Measurement scenarios

全画面の実装完了後、Lighthouse測定（§2.1）のfixtureとして次を固定します。

```text
route:   /pawgress/（Today Setup画面）
state:   Inboxサンプル2件（牛乳を買う、資料を確認する）、未選択
history: 空（履歴0日分）
```

タスク件数やInbox件数が大きく異なるシナリオ（Inbox上限付近、History 1年分蓄積後等）での計測は、まだ固定fixtureを定義していません。

---

## 3. Known limitations

- Lighthouse は2026-10-11に3回実測済みです（§2.1）。Core Web Vitalsはproduction field data（RUM）を取得する仕組みが無いため、引き続き`Not measured`です。lab evidence（LCP/CLS/TBT）はあります。
- JSの予算（250KB）は確定しています。実測値（202.80 KB）は複数回のbuildではなく単一buildの測定です（bundle sizeはソースが同じであれば決定的なため、Lighthouseのような実行時変動はありません）。
- Touch target（§1）: 24×24px・primary 44×44pxは到達可能な全画面で実測しPassです。48×48px（推奨）はFailで、ほとんどのprimary controlがちょうど44pxに留まっています。

### History Calendar — partial verification

320 / 390 / 768 / 1440px、200%相当のCSS zoom proxy（1280px viewportで`document.documentElement.style.zoom = 2`、水平スクロール・コンテンツのクリップなしを確認）、keyboard操作、axe-core（violations 0）の検証を実施済みです。date gridの実測は41.14〜59.44px（幅）×40px（高さ）で、24×24px基準をPassし、44×44px基準は意図的に満たしません（§1参照）。ブラウザUIによるnative pinch-zoomと実機screen readerは未検証です。この検証範囲から全体のWCAG適合をPassにしません。

### Today / Review Atmosphere — color-contrast incomplete の手動確認結果

Today Setup/Rest/Done、Review共通の「Atmosphere」要素（date label、heading、supporting text）は、axeがcolor-contrastを`incomplete`として報告します（半透明色のため自動判定を見送る挙動）。computed styleから実際の合成色（alpha compositing）で算出した結果は次の通りです。

```text
light theme: date label / supporting text 6.0:1、heading 13.29:1（基準4.5:1）
dark theme:  date label / supporting text 8.6:1、heading 14.89:1（基準4.5:1）
```

いずれも基準を満たします。実機screen reader / ブラウザUIによるnative 200% zoomは未検証のまま残ります（上記のCSS zoom proxyによる確認のみ）。

参考文献:

- web.dev Core Web Vitals
- Chrome Lighthouse scoring documentation
- W3C WCAG 2.2
- Browserslist / Can I Use（`package.json` の `browserslist` フィールド参照）

Pawgress 独自の基準（Lighthouse 90/95/95、48×48推奨タッチ領域、250KB予算 等）を、WCAG / Core Web Vitals の必須要件として提示しません。
