# Handoff: 3Dプリンター使い方ガイド（松山南高校自然科学部 / 3Dモデル班）

## Overview
本校生徒（主に初めて使う1年生）向けの、3Dプリンター利用手順ガイド。1ページ完結の静的サイトで、目次付きスクロール。2機種（Creality Ender-3 V3 KE / ELEGOO Centauri Carbon）を切り替えると、機種依存の手順文・画像ラベル・スライサー名が変わる。

## About the Design Files
同梱の HTML/JSX は **HTMLで作ったデザインリファレンス**（見た目と挙動のプロトタイプ）であり、そのまま本番コードとして使うものではない。ターゲット環境の既存パターンで再実装すること。環境が未定なら、静的サイト向けの軽量構成（例：Astro / Vite + React、または素のHTML + 少量のJS）を推奨。コンテンツはデータ駆動（`guide-data.jsx` 相当のJSON/Markdown）に保ち、部員が文章・画像を編集しやすくすること。

## Fidelity
**High-fidelity.** 色・タイポ・余白・インタラクションは確定値。画像はプレースホルダー（斜めストライプ＋ラベル）で、後から実写真に差し替える前提。

## Screen: ガイド（単一ページ）

### 全体構造（上から）
1. **Sticky ヘッダー**（`position:sticky; top:0; z-index:20`）
   - 背景 `#1c1c1a`、文字 `#f4f3ef`、下ボーダー 4px アクセント色
   - 内側 max-width 1240px、padding 12px 24px、flex gap 20px
   - 左：「3D」マーク（30×30、アクセント背景、白、IBM Plex Mono 600 12px）＋「3Dプリンター使い方ガイド」(17px bold)＋「松山南高校 自然科学部 / 3Dモデル班」(Mono 12px `#a9a79f`)
   - 右：機種切替セグメント（border 1px `#55544f`）。ボタン padding 7px 14px、Mono 13px 500、min-height 36px。選択中はアクセント背景＋白字、非選択 `#bdbbb3`
2. **ヒーロー**：max-width 1240, padding 64px 24px 48px, grid `1.3fr 1fr` gap 48, 下ボーダー 1px `#cfccc3`
   - キッカー「松山南高校自然科学部 / 3Dモデル班」15px, 600, アクセント色, letter-spacing .04em
   - H1「はじめての<br>3Dプリント」clamp(34px, 5.4vw, 64px), line-height 1.15, 700
   - リード文 `#5b5a55`, max-width 36em
   - 右：仕様表（dl）border 1px ink。行 grid `110px 1fr`、dt は Mono 12px / 背景 `#ebe9e3` / 右ボーダー。行：機種・スライサー・基本材料(PLA)・設置場所・管理(3Dモデル班)・顧問
3. **本体**：max-width 1240, grid `220px 1fr` gap 56
   - **目次（左）** sticky top 84px。見出し「もくじ」12px 700。各リンク grid `32px 1fr`, 14px, 上ボーダー、番号 Mono 12px。現在地は ink色＋bold、番号アクセント色。下に「↑↓ キーでステップごとに移動できます」（kbd風）
   - **セクション ×7**（padding 56px 0 24px、下ボーダー）
     - 見出し行 grid `auto 1fr auto`：番号 Mono 56px 500 アクセント色 / H2 30px / 「目安 ○分」タグ（Mono 12px, border 1px ink, padding 3px 10px）
     - リード `#5b5a55`, margin-bottom 36px, max-width 40em
     - ステップ群（下記レイアウト）
4. **フッター**：背景 ink、上ボーダー 4px アクセント。左に「3D」マーク 44×44 ＋「松山南高校 自然科学部 / 3Dモデル班」16px bold ＋「わからないことは部員に気軽に聞いてね」13px `#a9a79f`。右に最終更新・作成者（Mono 12px）

### セクション一覧
01 利用ルール / 02 3Dデータを用意する / 03 印刷データを作成する / 04 フィラメントを交換する / 05 印刷を開始する（冒頭に印刷前チェックリスト）/ 06 印刷完了後の手順 / 07 トラブルシューティング（アコーディオン）
文言はすべて `guide-data.jsx` 参照。「【要記入】」「【要確認】」は未確定の値。

### ステップ（採用レイアウト：交互）
- 各ステップ grid `1fr 1fr` gap 36px, align center, padding 28px 0, 上ボーダー 1px dashed `#cfccc3`（最初は無し）
- 画像の左右交互は「画像ありステップのみ」でカウント（画像あり2枚目・4枚目…を右側に、order:2）
- **画像なしステップ**：データで `img` と `src` を省略すると、画像枠を出さずテキストのみ1カラム（`grid-template-columns:1fr`、テキスト max-width 44em）。交互カウントにも含めない
- 画像枠：aspect-ratio 4/3、`repeating-linear-gradient(135deg, #ebe9e3 0 10px, #e3e0d8 10px 20px)`、border 1px `#cfccc3`、左下にラベル「画像：○○」(Mono 11.5px, 背景紙色, border)
- ステップ番号：28×28 黒四角に白数字（Mono 13px）＋「ステップ」13px 700 `#5b5a55`
- H3 19px / line-height 1.45、本文 15.5px
- 注記ボックス：背景 `#ebe9e3`、padding 10px 12px、14px。左にラベル「注意」（アクセント背景）/「ヒント」（`oklch(0.55 0.1 230)` ≒ `#2f73a6`）白字 Mono 11px
- 角丸なし・影なし（工房マニュアル風のフラットな線表現）
- 代替レイアウト（Tweaksで検討済み、不採用）：カード型グリッド、縦リスト

### 印刷前チェックリスト（05章冒頭）
- border 2px ink、背景 `#fbfaf7`。ヘッダー帯 ink背景「印刷前チェックリスト」＋進捗「n / 8」（全完了で「準備OK ✓」アクセント色）
- 2カラム（モバイル1カラム）。項目ボタン min-height 44px、20×20 チェックボックス（border 2px ink、ON時アクセント塗り＋✓）、ON時テキスト取り消し線＋グレー
- 「リセット」リンク。状態は localStorage `g3d-check` に保存

### トラブルシューティング（07章）
- 上ボーダー 1px ink。各行ボタン grid `40px 1fr 24px`、17px bold、min-height 56px、「Q01」Mono アクセント色、右に +/−
- 開くと grid `1fr 240px`（回答文＋画像枠）、左 padding 52px。1つだけ開く（初期は Q01）

## Interactions & Behavior
- **機種切替**：`ke` / `cc`。手順データの `text` / `img` が `{ke, cc}` オブジェクトなら該当機種を表示。localStorage `g3d-machine` に保存
- **目次ハイライト**：IntersectionObserver（rootMargin `-30% 0px -60% 0px`）で現在セクションを判定
- **↑↓キー ステップ移動**：
  - 対象要素：`main` 内の各ステップ、チェックリスト、トラブル各行
  - ↓：上端が「scroll-padding-top + 24px」より下にある最初の要素へ。↑：上端が上にある最後の要素へ（無ければページ先頭）
  - スクロール：自前 rAF、easeOutQuart、duration `min(700, 320 + |距離|×0.3)` ms、着地は要素上端 − 12px
  - 着地アニメ（0.55s, cubic-bezier(.2,.8,.2,1)）：画像は左から（偶数は右から）28px スライド＋フェード、テキストは下から16px フェードイン（0.08s遅延）、左に4pxアクセント縦線が上から伸びる（0.4s）
  - 右下トースト：「{章名}　n / N」ink背景・左4pxアクセント、1.6s後フェードアウト
  - input/textarea 内では無効
- **スムーススクロール**：目次リンクは CSS `scroll-behavior:smooth`、`scroll-padding-top:84px`（≤1000pxでは116px）

## Responsive
- **≤1000px**：目次は横スクロールのタブバー化（ヘッダー下 sticky top 60px、現在地は下線2pxアクセント）。キー操作ヒント非表示
- **≤720px**：ヒーロー1カラム、交互ステップは縦積み（画像→テキスト）、セクション番号40px・H2 24px、チェックリスト1カラム、トラブル回答1カラム、ヘッダーのサブタイトル非表示・機種ボタン縮小（padding 6px 8px, 11px）

## State
- `machine: 'ke' | 'cc'`（localStorage）
- `activeSection: string`
- `checklistDone: number[]`（localStorage）
- `openTroubleIndex: number`
- `stepToast: string | null`

## Design Tokens
| Token | Value |
|---|---|
| paper（背景） | `#f4f3ef` |
| paper2（面） | `#ebe9e3` |
| card | `#fbfaf7` |
| ink（文字/帯） | `#1c1c1a` |
| ink2（補助文字） | `#5b5a55` |
| line | `#cfccc3` |
| accent（採用：オレンジ） | `#D9622B` |
| warn | = accent |
| tip | `oklch(0.55 0.1 230)` |
| フッター補助文字 | `#a9a79f` |

- フォント：**IBM Plex Sans JP**（400/500/700）本文・見出し、**IBM Plex Mono**（400/500/600）番号・ラベル（Google Fonts）
- 本文 16px / line-height 1.75
- 角丸：0（全要素）、影：なし
- 余白：コンテナ横 24px（モバイル20px）、セクション上 56px、ステップ間 28px

## Assets
画像はすべてプレースホルダー。各ステップの `img` ラベルに撮影すべき写真の内容が書いてある（例：「エクストルーダーのレバー位置」）。データに `src: 'images/xxx.jpg'` を追加すると表示される仕組み。部活ロゴがあれば「3D」マークと差し替え。

## Files
- `3Dプリンター使い方ガイド.html` — ページ本体（CSS・Reactコンポーネント・キー操作）
- `guide-data.jsx` — 全文言・ステップ・チェックリスト・トラブルデータ
- `tweaks_panel.jsx` — デザイン検討用のTweaksパネル（本番では不要）
