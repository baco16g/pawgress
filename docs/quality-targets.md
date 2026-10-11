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

| Target | Classification | Status | Evidence |
| --- | --- | --- | --- |
| WCAG 2.2 AA 準拠 | 外部標準 | Not measured | Today Active実装済み、axe検査は複数画面で違反0件だが、全体適合・実機支援技術は未検証 |
| Touch target >= 24×24（SC 2.5.8） | 外部標準 | Not measured | History date gridは最小実測24.56×40px（195px＋15px gutter）。全画面適合は未検証 |
| Primary touch target >= 44×44 | Pawgress の品質基準 | Not measured | Inline Addのinput / 追加、History月移動buttonは44px以上を実測済み。全画面の監査は未完了 |
| Touch target ~48×48（推奨） | Pawgress の品質基準 | Not measured | 全画面では未測定 |

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

| Target | Status | Evidence |
| --- | --- | --- |
| Performance >= 90 | Not measured | Today Active実装済み。Lighthouseは未測定 |
| Accessibility >= 95 | Not measured | 同上 |
| Best Practices >= 95 | Not measured | 同上 |

### 2.2 Core Web Vitals（外部標準）

```text
LCP <= 2.5 s
INP <= 200 ms
CLS <= 0.1
```

Pawgress は小規模な mobile-first SPA であり、これらの標準 "Good" threshold をそのまま採用します。Pawgress 独自に厳格化しません。production field data（RUM）が無い間は `Not measured` として報告し、Lighthouse / TBT から INP を推定しません。field data がある場合は 75th percentile で評価します。

### 2.3 JS bundle budget（Pawgress のエンジニアリング予算）

```text
Initial JS (gzip) <= 250 KB
```

根拠: 実装初期段階（Today/Inbox/Review/History 等の機能実装前）で `npm run build` を実測したところ、initial JS chunk は raw 460.28 KB / gzip 186.18 KB（単一chunk、route-level code splitting 未導入、依存は react 19 / react-dom 19 / react-router 7 / clsx のみ）でした。固定の 150KB を根拠なく復活させず、実測値に対して今後の機能実装分の headroom を確保した値として 250KB を設定しました。

主要画面（Today/Inbox/Review/History/Settings）実装完了後の実測は **gzip 200.13 KB**、250KB以内に収まっています。この予算250KBを確定とします。予算を超える場合はroute-level code splittingを検討します。

| Target | Classification | Status | Evidence |
| --- | --- | --- | --- |
| Initial JS gzip <= 250 KB | Pawgress のエンジニアリング予算 | Met（実測 200.13 KB） | `npm run build` output |

### 2.4 Measurement scenarios

計測対象画面は実装が進んだ段階で定義します（Today Activeは実装済みですが、他画面の主要機能と性能計測用の固定fixtureは未確定です）。固定 fixture（タスク件数・Inbox件数・履歴日数のベースライン）は、画面実装完了後に定義します。

---

## 3. Known limitations

- Lighthouse / Core Web Vitals はまだ一度も測定されていません。
- JSの予算（250KB）は確定しています。実測値（200.13 KB）は複数回ではなく単一ビルドの測定であり、Lighthouse等の継続的計測は今後の課題として残ります。

### History Calendar — partial verification

390 / 320 / 実効195px、root font-size 200%、keyboard、axeの部分検証を実施済みです。ブラウザUIによるnative zoomと実機screen readerは未検証です。部分検証から全体のWCAG適合をPassにしません。

### Daily Review — future comprehensive accessibility QA

以下は将来の全画面アクセシビリティQAへ引き継ぐ項目です。

- Review Atmosphere上のdate / title / supporting text: axeのcolor-contrast incomplete（重なりにより背景を自動判定できません）を手動確認します。Disposition単体のaxeはviolations / incompleteとも0。
- 実機screen reader / ブラウザUIによる200% zoomを確認します。

参考文献:

- web.dev Core Web Vitals
- Chrome Lighthouse scoring documentation
- W3C WCAG 2.2
- Browserslist / Can I Use（`package.json` の `browserslist` フィールド参照）

Pawgress 独自の基準（Lighthouse 90/95/95、48×48推奨タッチ領域、250KB予算 等）を、WCAG / Core Web Vitals の必須要件として提示しません。
