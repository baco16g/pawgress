# 相棒（Companion）キャラクターアセット

このディレクトリには、Design Direction 検討・Storybook 実装で使用する
犬・猫キャラクターのドット絵アセットを格納する。

参照した元アセットディレクトリ（コピー元。リポジトリには含まれない）:

```text
/Users/{userName}/Downloads/Pet Cats Pack
/Users/{userName}/Downloads/Pet Dogs Pack
```

配布元:

- Pet Cats Pack: https://luizmelo.itch.io/pet-cat-pack
- Pet Dogs Pack: https://luizmelo.itch.io/pet-dogs-pack

## ライセンス

両パックとも **CC0 (Creative Commons Zero)**。商用・非商用問わず利用可能で、
法的な帰属表示（attribution）は不要。原本は以下に保存済み。

```text
third-party-licenses/pet-cats-pack-LICENSE.txt
third-party-licenses/pet-dogs-pack-LICENSE.txt
```

将来の「設定 > ライセンス・クレジット」画面（`docs/product-spec.md` §40）では、
パック名と CC0 である旨を表示すればよい（個々の作者名などの追加クレジット要求はない）。

## 配置について

相棒の表示（画像アセットを使ったレンダリング）は `features/companion` の責務であり、
`entities/companion` は複数 feature が読むドメイン型のみを持つ
（`docs/development-plan.md` 第4節・165〜168行）。そのため本アセットは
`entities/companion` ではなく `features/companion/assets/` に配置する。

## 採用した組み合わせと理由

当初は Design Direction 比較用に各種2バリアントのみへ絞っていたが、
両パックとも CC0 で追加コストがなく、同一ポーズセットを持つ残り全バリアント
を除外しておく理由がないため、**犬6種・猫6種（元パックの全バリアント）を
採用**した。preview.png 等パック紹介用の合成画像を除き、実際のキャラクター
バリアントはこれで元パックを使い切っている。

製品仕様上、ユーザーが選べる相棒は現時点では「犬」「猫」の2種類のみで、
犬種・猫種を選ぶ機能はまだ存在しない（`docs/product-spec.md` §22）。
本ドキュメントでのアセット採用は、将来的な犬種・猫種選択機能やランダム
表示の材料として使えるようにするための準備であり、それ自体が
「犬種選択機能を追加する」という製品決定を意味するものではない
（AGENTS.md §44: 観察可能な挙動を製品仕様に無断で作らない）。
実際に複数バリアントから選べる/ランダム表示するUIを作る場合は、
`docs/product-spec.md` §21・§22 の更新が別途必要。

猫はパックにブリード名の記載が無いため、実際の配色を拡大確認したうえで
色・柄ベースの名称を付けた（推測でブリード名を断定していない）。

| 種別 | 採用バリアント   | 元フォルダ               | 見た目の特徴                                                 |
| ---- | ---------------- | ------------------------ | ------------------------------------------------------------ |
| 犬   | golden-retriever | `Dog-1-Golden-Retriever` | 暖色・柔らかい印象の定番アーキタイプ                         |
| 犬   | akita            | `Dog-2-Akita`            | クリーム〜タン、キツネ顔、立ち耳                             |
| 犬   | great-dane       | `Dog-3-Great-Dane`       | 大型、茶＋白のまだら模様、立ち耳                             |
| 犬   | schnauzer        | `Dog-4-Schnauzer`        | グレー、針金状の被毛、立ち耳                                 |
| 犬   | saint-bernard    | `Dog-5-Saint-Bernard`    | 大型、茶＋白、垂れ耳                                         |
| 犬   | siberian-husky   | `Dog-6-Siberian-Husky`   | 黒〜グレー＋白、立ち耳、寒色で目を引く印象                   |
| 猫   | orange-tabby     | `Cat-1`                  | オレンジ地にタビー（縞）模様、黄色い目                       |
| 猫   | black            | `Cat-2`                  | 全身黒、黄色い目                                             |
| 猫   | seal-point       | `Cat-3`                  | クリーム地の胴＋濃色（顔・耳・脚・尾）のポイント配色、青い目 |
| 猫   | charcoal-tan     | `Cat-4`                  | 濃灰色の胴＋タン色の脚、黒い鼻                               |
| 猫   | white-longhair   | `Cat-5`                  | 白〜クリームの長毛、青い目                                   |
| 猫   | gray-tabby       | `Cat-6`                  | グレー地にタビー（縞）模様、黄色い目                         |

## ディレクトリ構成 と semantic state 対応

```text
assets/
  dogs/
    golden-retriever/
    akita/
    great-dane/
    schnauzer/
    saint-bernard/
    siberian-husky/
  cats/
    orange-tabby/
    black/
    seal-point/
    charcoal-tan/
    white-longhair/
    gray-tabby/
```

各バリアントフォルダには、Pawgress 側の semantic state 名でリネームした
ファイルを置く（`docs/product-spec.md` §21 の Companion 状態に対応）。
`pleased` のみ、同じ意味を表す複数ポーズを候補として持つ（詳細は次項）。

| semantic state  | 意味                                   | 元ポーズ名（犬）           | 元ポーズ名（猫）                |
| --------------- | -------------------------------------- | -------------------------- | ------------------------------- |
| `idle.png`      | 通常待機                               | `*-idle` / `*-Idle`        | `Cat-N-Idle`                    |
| `pleased.png`   | 喜び・ポジティブな反応（候補1）        | `*-bark`（吠え）           | `Cat-N-Meow`（鳴き）            |
| `pleased-2.png` | 喜び・ポジティブな反応（候補2）        | `*-licking1`（毛づくろい） | `Cat-N-Licking 1`（毛づくろい） |
| `pleased-3.png` | 喜び・ポジティブな反応（候補3）        | `*-licking2`（毛づくろい） | `Cat-N-Licking 2`（毛づくろい） |
| `completed.png` | タスク完了時                           | `*-stretching`（伸び）     | `Cat-N-Stretching`（伸び）      |
| `review.png`    | 振り返り時の落ち着いた状態             | `*-sitting`（お座り）      | `Cat-N-Sitting`（お座り）       |
| `sleepy.png`    | sleepy / resting                       | `*-sleeping`               | `Cat-N-Sleeping1`               |
| `subdued.png`   | 落ち着いているがネガティブではない状態 | `*-lying-down`（伏せ）     | `Cat-N-Laying`（伏せ）          |

各ファイルは元アセットのスプライトシート（複数フレームを横に連結した1枚のPNG）を
そのままコピーしたもので、再エンコード・リサイズは行っていない
（コピー元とのバイト一致を `cmp` で確認済み）。フレーム構成は以下の通り
（フレーム1枚のサイズは犬 100×100px、猫 50×50px）。

| semantic state | 犬（フレーム数 / 画像幅） | 猫（フレーム数 / 画像幅） |
| -------------- | ------------------------- | ------------------------- |
| `idle`         | 10 / 1000px               | 10 / 500px                |
| `pleased`      | 3 / 300px                 | 4 / 200px                 |
| `pleased-2`    | 4 / 400px                 | 5 / 250px                 |
| `pleased-3`    | 4 / 400px                 | 5 / 250px                 |
| `completed`    | 10 / 1000px               | 13 / 650px                |
| `review`       | 1 / 100px（静止1枚）      | 1 / 50px（静止1枚）       |
| `sleepy`       | 1 / 100px（静止1枚）      | 1 / 50px（静止1枚）       |
| `subdued`      | 7 / 700px                 | 8 / 400px                 |

Design Direction / Storybook では、まずは静止画（各シートの1フレーム、または
シート全体をそのまま）として扱う想定。フレームアニメーションの再生方法は
別途 UI 実装時に検討する。

`completed`（伸び）と `subdued`（伏せ）は「待機姿勢 → 目的の姿勢」へ変化する
遷移シーケンスであり、フレーム0は待機姿勢に近い。静止画として1フレームだけ
使う場合は、`subdued` は最終フレーム（完全に伏せた状態）を、`completed` は
伸びの動作が最も伸びきったフレーム（`completed` は中盤〜終盤）を使うこと。
（実際に各フレームを書き出して確認済み。）

## `pleased` の複数ポーズとランダム表示について

`pleased` は「吠え/鳴き」（`pleased.png`）に加えて、「毛づくろい」2種
（`pleased-2.png` / `pleased-3.png`）を同義の候補として追加した。
3枚とも等しくポジティブな表現であり、どれが選ばれても意味は変わらない
（`docs/product-spec.md` §21 に「1つの状態が複数の同義ポーズを持ってよく、
表示のたびにどれを使うかは変化してよい」旨を追記済み）。

実装時の注意（AGENTS.md の Clock / IdGenerator と同じ考え方）:

- どのポーズを選ぶかを `Math.random()` としてコンポーネント内に直書きせず、
  注入可能な選択関数の背後に置くこと。そうしないと Storybook の
  スナップショット・play test・Chromatic が実行のたびに異なる結果になり、
  再現できなくなる。
- Storybook / test では固定の選択関数（常に先頭を返す等）を注入し、
  実行時のみ実際のランダム選択を注入する。
- `idle` / `completed` / `review` / `sleepy` / `subdued` は今回は単一
  ポーズのままとする（バリエーションの効果が小さく複雑化に見合わないため）。
  必要になれば同じ命名規則（`state-2.png`, `state-3.png`, ...）で拡張できる。
- 犬種・猫種そのもの（golden-retriever / orange-tabby など）はランダム
  切り替えの対象にしない。`docs/product-spec.md` §21 の通り、選択済みの
  種別は変化しない一貫した対象であるべきで、表現がランダムに変わってよいのは
  同一状態内のポーズのみ。

## 採用しなかった主なアセットと理由

- **Walk / Run（歩行・走行）**: 現行の semantic state（idle / pleased / completed /
  review / sleepy / subdued）のいずれにも対応しないロコモーション用ポーズのため不採用。
- **Itch（体を掻く仕草）**: ネガティブではないが、6つの semantic state のどれにも
  自然に対応しないため不採用。
- **Sleeping2（猫のみ）**: `Sleeping1` と同義の重複ポーズであり、最小限化の方針から
  不採用（`Sleeping1` を `sleepy` として採用）。
- **Meow-VFX.png（猫パックのみに存在するエフェクト画像）**: 犬パック側に対応する
  エフェクトが無く非対称になるため今回は不採用。将来エフェクト演出を追加する場合に
  再検討する。
- **preview.png / Preview.png（パック全体のプレビュー画像）**: パック紹介用の
  合成画像であり、プロダクト内で使用しないため不採用。

## ライセンス・クレジット確認結果

- Pet Cats Pack: CC0（`third-party-licenses/pet-cats-pack-LICENSE.txt` に原文保存、
  配布元 https://luizmelo.itch.io/pet-cat-pack ）
- Pet Dogs Pack: CC0（`third-party-licenses/pet-dogs-pack-LICENSE.txt` に原文保存、
  配布元 https://luizmelo.itch.io/pet-dogs-pack ）
- 両パックとも著作者個人名の明示的なクレジット表記要求はライセンス文面上に見当たらない。
- 「設定 > ライセンス・クレジット」画面実装時は、上記2パック名・CC0表記・
  原文へのリンク（またはリポジトリ内パス）・配布元リンクを表示すれば
  `docs/product-spec.md` §40 / `docs/quality-targets.md` §20 の要件を満たせる。
