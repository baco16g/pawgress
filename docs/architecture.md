# Pawgress Architecture & Sequence Diagrams

この文書は **Pawgress の実装構成（レイヤー構成・ドメインモデル・状態遷移・主要シーケンス）** を図で記録します。

対応する他文書:

```text
docs/product-spec.md     — プロダクト仕様（画面、操作、データ、MVP範囲）
docs/ux-spec.md          — 情報設計 / interaction / user flow
```

**目次**

- 0. 保守方針
- 1. レイヤーアーキテクチャ
- 2. Today Lifecycle 状態遷移
- 3. 主要ドメインモデル
- 4. 主要シーケンス図
  - 4.1 起動時復元
  - 4.2 Setup→Active
  - 4.3 Active→Review→Done
  - 4.4 Today Doneの取り消し/やめる
  - 4.5 REST
  - 4.6 Inbox capture
  - 4.7 Settings変更
- 5. Navigation / Route 一覧
- 6. 永続化マップ

---

## 0. 保守方針（このドキュメントへの追従ルール）

このドキュメントは実装から自動生成されません。**コードを変更したら、該当する図を同じコミット（または直後のコミット）で更新します。**

以下の変更をした場合は、対応する節を更新してください。

| 変更内容 | 更新する節 |
|---|---|
| `router.tsx` に新しい route を追加/削除した | §1 レイヤーアーキテクチャ、§4 のシーケンス図 |
| `dailyLifecycleReducer` に新しい action を追加/変更した | §3 ドメインモデル、§4.2〜§4.5、§5 |
| `DailyLifecycleState` / `SettingsState` のフィールドを変更した | §3 ドメインモデル |
| Today の lifecycle state（setup/active/rest 以外）を追加した | §2 状態遷移図 |
| `app/persistence/` の永続化対象・キーを変更した | §4.1、§6 永続化マップ |
| 新しい feature（画面カテゴリ）を追加した | §1 レイヤーアーキテクチャ |
| featureディレクトリの内部規約（`routes/`・`<Screen>/components/`）を変更した | §1 レイヤーアーキテクチャ |

Mermaid のコードブロックは GitHub / GitLab 上でそのままレンダリングされます。新しい図を追加する場合も Mermaid 記法に統一し、スクリーンショットや外部ツール生成画像は使いません（テキストdiffでレビューできる状態を保ちます）。

---

## 1. レイヤーアーキテクチャ

`app → features → domain → shared` の一方向 import のみを許可します（`eslint-plugin-boundaries` で強制、`eslint.config.js` 参照）。`features` は `app/state/` 配下の context（`app-state`）のみ例外的に消費できますが、`app/router` ・`app/providers` の実装には立ち入りません。

```mermaid
graph TD
    subgraph App["app/ （composition専用）"]
        Router["app/router/<br/>router.tsx, AppLayout/"]
        Providers["app/providers/<br/>DailyLifecycleProvider, SettingsProvider, ErrorBoundary"]
        State["app/state/<br/>dailyLifecycleContext, settingsContext,<br/>navVisibilityContext (app-state)"]
        Persistence["app/persistence/<br/>dailyLifecycleStorage, settingsStorage"]
        Styles["app/styles/<br/>tokens.css, global.css, references/"]
        Router ~~~ Providers ~~~ State ~~~ Persistence ~~~ Styles
    end

    subgraph Features["features/ （製品機能ごと）"]
        Today["today/<br/>routes/, TodaySetupScreen/,<br/>TodayActiveScreen/, TodayRestScreen/,<br/>TodayDoneScreen/"]
        Inbox["inbox/"]
        Review["review/"]
        History["history/"]
        Settings["settings/"]
        Companion["companion/ assets・model・ui"]
        Today ~~~ Inbox ~~~ Review ~~~ History ~~~ Settings ~~~ Companion
    end

    subgraph Domain["domain/ （React非依存のpure business rule）"]
        DailyLifecycle["daily-lifecycle/<br/>dailyLifecycleStore, todayLifecycle"]
        HistoryDomain["history/"]
        ReviewDomain["review/"]
        SettingsDomain["settings/"]
        TaskDomain["task/"]
        ProductDay["product-day/"]
        DailyLifecycle ~~~ HistoryDomain ~~~ ReviewDomain ~~~ SettingsDomain ~~~ TaskDomain ~~~ ProductDay
    end

    subgraph Shared["shared/ （feature横断の汎用部品）"]
        UI["shared/ui/<br/>Button, TaskItem, InlineAddRow,<br/>InlineConfirmAction, Toast"]
        Hooks["shared/hooks/<br/>useFocusOnMount"]
        UI ~~~ Hooks
    end

    Router --> Providers
    Router --> Features
    Providers --> State
    Providers --> Persistence
    Persistence --> Domain
    Features --> Domain
    Features --> Shared
    Features -. "narrow exception" .-> State
```

**featureディレクトリの内部規約**:

- router.tsxから直接呼ばれるRoute componentは、route数に関わらず必ず `<feature>/routes/` に置きます（例: `today/routes/TodayRoute.tsx`、`settings/routes/`配下の8ファイル）。
- 1つのscreenからしか使われないsub-component（co-locateするファイルがcss/test/story含め2〜3個程度のもの）は、個別のfolderを作らずそのscreenの `components/` へ畳み込みます（例: `today/TodaySetupScreen/components/RestAction.tsx`）。screen自身のファイルとprivate helperを同じ階層に混在させないための分離であり、複数のscreenから使われるようになった時点でこの規約から外し、shared/uiかfeature直下へ引き上げます。

---

## 2. Today Lifecycle 状態遷移

`TodayRoute`（`src/features/today/routes/TodayRoute.tsx`）は、`lifecycleState` を `DailyLifecycleState` から導出します。専用の local state は持たず、常に `todayTasks` / `historyRecords` から導出します（route の unmount/remount に左右されないため）。

```mermaid
stateDiagram-v2
    [*] --> Setup

    Setup --> Active: today/start
    Setup --> Rest: today/rest
    Rest --> Setup: today/cancelRest
    Active --> Review: "route遷移 (/review)"
    Review --> Done: review/complete
    Active --> Setup: today/abandon
    Done --> Active: today/cancelReview

    note right of Active
        lifecycleState導出ルール
        （TodayRoute.tsx、優先順）:
        todayTasks.length > 0  → active
        historyRecords[today].kind === 'rest' → rest
        historyRecords[today].kind === 'active' → done
        それ以外 → setup
    end note

    note right of Done
        Doneはhistory recordが存在する限り
        同じProduct Dayの間維持される。
        Reviewを再度経由しない限りSetupへは
        自動的に戻らない。
    end note
```

各 transition の action の詳細（発火元・効果）は §3 の action 一覧を参照してください。

---

## 3. 主要ドメインモデル

```mermaid
classDiagram
    class Task {
        +string id
        +string title
        +boolean completed
    }

    class DailyLifecycleState {
        +Task[] todayTasks
        +Task[] inboxCandidates
        +Task[] carryOverCandidates
        +Record~string,DailyHistoryRecord~ historyRecords
    }

    class DailyHistoryRecord {
        <<discriminated union>>
        +string dateKey
        +string kind
        +DailyHistoryItem[] items
    }
    note for DailyHistoryRecord "kind='active'のときのみitemsを持つ、kind='rest'はitemsなし"

    class DailyHistoryItem {
        +string taskId
        +string title
        +string outcome
    }
    note for DailyHistoryItem "outcome: 'completed' | 'carryOver' | 'inbox'"

    class SettingsState {
        +TextSizePreference textSize
        +ThemePreference theme
        +MotionPreference motion
        +CompanionSpeciesPreference companionSpecies
        +number maxTodayTasks
    }

    DailyLifecycleState "1" o-- "*" Task : todayTasks / inboxCandidates / carryOverCandidates
    DailyLifecycleState "1" o-- "*" DailyHistoryRecord : historyRecords
    DailyHistoryRecord "1" o-- "*" DailyHistoryItem : items
```

`dailyLifecycleReducer`（`src/domain/daily-lifecycle/dailyLifecycleStore.ts`）が受け付ける action 一覧:

| action type | 発火元 | 効果 |
|---|---|---|
| `inbox/appendTask` | Today Setup の Inline Add | `inboxCandidates` 末尾へ追加（capacity判定あり） |
| `inbox/prependTask` | Inbox 画面自身の capture | `inboxCandidates` 先頭へ追加（capacity判定あり） |
| `inbox/deleteTask` | Inbox 画面の削除操作 | 該当 task を `inboxCandidates` から除去 |
| `today/start` | Today Setup「今日をはじめる」 | 選択分を `todayTasks` へ、残りを `inboxCandidates` へ |
| `today/toggleTask` | Today Active のチェックボックス | 該当 task の `completed` を反転 |
| `today/addTask` | Today Active の Inline Add | `todayTasks` 末尾へ直接追加（capacity判定なし） |
| `today/rest` | Today Setup「今日は休む」確定 | `historyRecords[dateKey] = {kind:'rest'}` |
| `today/cancelRest` | REST 画面「休む日をやめる」 | 対象 `dateKey` の rest record を削除 |
| `review/complete` | Review「1日を終える」 | `historyRecords[dateKey]` を active record で確定、`todayTasks` を空に |
| `today/cancelReview` | Today Done「今日の完了を取り消す」 | 対象 `dateKey` の active record から `todayTasks` を完了状態込みで復元、`carryOverCandidates`/`inboxCandidates` からそのrecordが振り分けた分を取り除き、record自体を削除 |
| `today/abandon` | Today Active「今日をやめる」 | `todayTasks` を完了/未完了問わずすべて `inboxCandidates` へ（`completed`をfalseへリセット）、`todayTasks` を空に |

---

## 4. 主要シーケンス図

### 4.1 アプリ起動時の state 復元（永続化）

```mermaid
sequenceDiagram
    participant Browser
    participant main.tsx
    participant AppLayout
    participant SettingsProvider
    participant settingsStorage
    participant DailyLifecycleProvider
    participant dailyLifecycleStorage
    participant todayLifecycle as todayLifecycle.resolveStaleTodayTasks

    Browser->>main.tsx: load
    main.tsx->>AppLayout: render（router.tsx: persist=true）
    AppLayout->>SettingsProvider: mount
    SettingsProvider->>settingsStorage: loadSettings()
    settingsStorage-->>SettingsProvider: SettingsState（無ければDEFAULT_SETTINGS）

    AppLayout->>DailyLifecycleProvider: mount（persist=true）
    DailyLifecycleProvider->>dailyLifecycleStorage: loadDailyLifecycleState()
    dailyLifecycleStorage-->>DailyLifecycleProvider: {dateKey, state} または null
    alt 保存データあり
        DailyLifecycleProvider->>todayLifecycle: resolveStaleTodayTasks(savedDateKey, currentDateKey)
        alt dateKeyが異なる（日付またぎ）
            todayLifecycle-->>DailyLifecycleProvider: todayTasksを空に、carryOverへ移す（completedはfalseへリセット）
        else dateKeyが同じ
            todayLifecycle-->>DailyLifecycleProvider: そのまま
        end
    else 保存データなし
        DailyLifecycleProvider->>DailyLifecycleProvider: INITIAL_LIFECYCLE_STATE（seed）
    end
    DailyLifecycleProvider-->>AppLayout: 初期state確定
```

### 4.2 Today Setup → Active

```mermaid
sequenceDiagram
    actor User
    participant TodaySetupScreen
    participant TodayRoute
    participant Reducer as dailyLifecycleReducer
    participant TodayActiveScreen

    User->>TodaySetupScreen: タスクを選択
    TodaySetupScreen->>TodayRoute: onToggleSelect(id)
    User->>TodaySetupScreen: 「今日をはじめる」
    TodaySetupScreen->>TodayRoute: onStartToday()
    TodayRoute->>Reducer: dispatch(today/start, selectedIds)
    Reducer-->>TodayRoute: todayTasks更新（resolveTodayStart）
    TodayRoute->>TodayActiveScreen: render（lifecycleState='active'）

    User->>TodayActiveScreen: 完了チェック
    TodayActiveScreen->>TodayRoute: onToggleTask(id)
    TodayRoute->>Reducer: dispatch(today/toggleTask, id)
```

### 4.3 Today Active → Review → Done

```mermaid
sequenceDiagram
    actor User
    participant TodayActiveScreen
    participant TodayRoute
    participant ReviewRoute
    participant ReviewScreen
    participant Reducer as dailyLifecycleReducer
    participant TodayDoneScreen

    User->>TodayActiveScreen: 「今日を振り返る」
    TodayActiveScreen->>TodayRoute: onOpenReview()
    TodayRoute->>ReviewRoute: navigate('/review')
    ReviewRoute->>ReviewScreen: render（tasks = state.todayTasks）

    User->>ReviewScreen: 未完了taskのdisposition選択
    ReviewScreen->>ReviewRoute: onSetDisposition(id, disposition)
    User->>ReviewScreen: 「1日を終える」（全未完了にdisposition済みで活性化）
    ReviewScreen->>ReviewRoute: onCompleteReview()
    ReviewRoute->>Reducer: dispatch(review/complete, tasks, dispositions, dateKey)
    Reducer-->>ReviewRoute: historyRecords[dateKey]確定、todayTasksを空に
    ReviewRoute->>TodayRoute: navigate('/today')
    TodayRoute->>TodayDoneScreen: render（lifecycleState='done'）
```

### 4.4 Today Done の取り消し / Today Active の「今日をやめる」

```mermaid
sequenceDiagram
    actor User
    participant TodayDoneScreen
    participant TodayActiveScreen
    participant TodayRoute
    participant Reducer as dailyLifecycleReducer
    participant TodaySetupScreen

    User->>TodayDoneScreen: 「今日の完了を取り消す」
    TodayDoneScreen->>TodayRoute: onCancelReview()
    TodayRoute->>Reducer: dispatch(today/cancelReview, dateKey)
    Reducer-->>TodayRoute: todayTasksを完了状態込みで復元、該当record由来分をcarryOver/inboxCandidatesから除去、historyRecords[dateKey]を削除
    TodayRoute->>TodayActiveScreen: render（lifecycleState='active'）

    User->>TodayActiveScreen: 「今日をやめる」→inline確認→「やめる」
    TodayActiveScreen->>TodayRoute: onAbandonToday()
    TodayRoute->>Reducer: dispatch(today/abandon)
    Reducer-->>TodayRoute: todayTasksをすべてinboxCandidatesへ（completedをfalseへリセット）、todayTasksを空に
    TodayRoute->>TodaySetupScreen: render（lifecycleState='setup'）
```

### 4.5 REST 開始・キャンセル

```mermaid
sequenceDiagram
    actor User
    participant TodaySetupScreen
    participant TodayRoute
    participant Reducer as dailyLifecycleReducer
    participant TodayRestScreen

    User->>TodaySetupScreen: 「今日は休む」→inline確認→「休む」
    TodaySetupScreen->>TodayRoute: onConfirmRest()
    TodayRoute->>Reducer: dispatch(today/rest, dateKey)
    Reducer-->>TodayRoute: historyRecords[dateKey] = {kind:'rest'}
    TodayRoute->>TodayRestScreen: render（lifecycleState='rest'）

    User->>TodayRestScreen: 「休む日をやめる」
    TodayRestScreen->>TodayRoute: onCancelRest()
    TodayRoute->>Reducer: dispatch(today/cancelRest, dateKey)
    Reducer-->>TodayRoute: historyRecords[dateKey]を削除
    TodayRoute->>TodaySetupScreen: render（lifecycleState='setup', justCancelledRest=true）
```

### 4.6 Inbox capture（容量制御）

```mermaid
sequenceDiagram
    actor User
    participant InboxScreen
    participant InboxRoute
    participant Reducer as dailyLifecycleReducer

    User->>InboxScreen: 新規タスク入力→Enter
    InboxScreen->>InboxRoute: onAddTask(title)
    InboxRoute->>Reducer: dispatch(inbox/prependTask, title)
    Reducer->>Reducer: canAddInboxTask(inboxCandidates)
    alt 容量内
        Reducer-->>InboxRoute: inboxCandidates先頭へ追加
    else 容量超過
        Reducer-->>InboxRoute: no-op（state変化なし）
        Note over InboxScreen: input disabled + capacity message（UI側canCaptureで判定）
    end
```

### 4.7 Settings 変更・永続化・即時反映

```mermaid
sequenceDiagram
    actor User
    participant SettingsTextSizeRoute
    participant SettingsProvider
    participant settingsStorage
    participant DocumentElement as document.documentElement

    User->>SettingsTextSizeRoute: 選択肢（例:「特大」）をクリック
    SettingsTextSizeRoute->>SettingsProvider: updateSettings({textSize:'extraLarge'})
    SettingsProvider->>SettingsProvider: setSettings(...)
    SettingsProvider->>DocumentElement: --font-scale / data-motion / data-theme を反映
    SettingsProvider->>settingsStorage: saveSettings(settings)
    SettingsTextSizeRoute->>SettingsTextSizeRoute: navigate('/settings')（即座に戻る）
```

---

## 5. Navigation / Route 一覧

`router.tsx` で定義される全 route です（すべて `AppLayout` 配下）。

```mermaid
graph LR
    AppLayout --> Root["/（indexはTodayへredirect）"]
    AppLayout --> Today["/today"]
    AppLayout --> Inbox["/inbox"]
    AppLayout --> Review["/review"]
    AppLayout --> History["/history"]
    AppLayout --> Settings["/settings"]
    Settings --> TextSize["/settings/text-size"]
    Settings --> Theme["/settings/theme"]
    Settings --> Motion["/settings/motion"]
    Settings --> SCompanion["/settings/companion"]
    Settings --> MaxTasks["/settings/max-tasks"]
    Settings --> DataPrivacy["/settings/data-privacy"]
    Settings --> Licenses["/settings/licenses"]
```

Bottom Navigation（primary）: Today / Inbox / History の3つのみ。Review・Settings は contextual/utility destination としてのみ到達します（`docs/product-spec.md` §3）。

---

## 6. 永続化マップ

`app/persistence/` 配下が、どの state を・どの key で・どこまで保存するかの一覧です。

| 対象 | storage key | 保存先 | 保存タイミング | 日付またぎ時の扱い |
|---|---|---|---|---|
| `SettingsState`（文字サイズ/テーマ/アニメーション/相棒種別/最大タスク量） | `pawgress.settings.v1` | `localStorage` | 変更の都度（`useEffect`） | 対象外（dateKeyを持たない） |
| `DailyLifecycleState`（todayTasks/inboxCandidates/carryOverCandidates/historyRecords） | `pawgress.dailyLifecycle.v1` | `localStorage` | state変化の都度（`useEffect`、`persist=true`時のみ） | `todayTasks` は `resolveStaleTodayTasks` で `carryOverCandidates` へ退避（§4.1） |

`persist` prop（`AppLayout` → `DailyLifecycleProvider`）は production entrypoint（`router.tsx`）でのみ `true` です。Storybook の `app/router/__fixtures__/*.stories.tsx` は指定せず、常に `INITIAL_LIFECYCLE_STATE` の固定 seed から始まります（再現性を優先し、localStorage には一切触れません）。

両 storage は validate + try/catch で外部境界を守ります（壊れた/旧shapeのデータは安全に初期値へ fallback）。実装は `src/app/persistence/settingsStorage.ts` / `src/app/persistence/dailyLifecycleStorage.ts` を参照してください。
