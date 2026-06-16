# 2D-Body-Phys

## 概要
2D人型ラグドールの体型・質量・関節・摩擦・重力といったパラメータを操作し、落下・押し出し・着地などのシナリオに対する物理挙動を可視化するWebベースの実験アプリ

## 対象ユーザー
- ゲーム開発における2D物理表現を学びたい人
- ラグドール、重心、質量分布、関節制約の挙動を視覚的に理解したい人

## MVPの目的
2D人型ラグドールを使って、体型・質量分布・物理パラメータが落下・押し出し・着地挙動に与える影響を観察できる最小構成のWebアプリを作る

## 用語

- Ragdoll: 複数の剛体パーツを関節制約で接続した人型モデル
- BodyPart: Head, Torso, Pelvisなどの個別剛体
- Preset: 体型・質量・物理パラメータをまとめた設定
- Center of Mass: 各BodyPartの質量と位置から求める全身の重心

## MVP Scope
### 実装済みの必須項目
- ブラウザで起動できる
- 2D人型ラグドールが表示される
- 床と衝突する
- Resetできる
- Dropできる
- Push Left / Push Rightできる
- Launch Upできる
- 重心が表示される
- 体型プリセットを切り替えられる
- 少なくとも3つのパラメータをGUIで変更できる

### 未実装のOptional項目
- 速度ベクトル表示
- 接触点表示
- JSONプリセットの読み込み
- スクリーンショット保存
- 簡単なグラフ表示

## MVPに含めないもの
- 歩行制御
- 筋肉シミュレーション
- Softbody
- 3D
- リアルな人体モデル
- IK
- アニメーションブレンド
- 高度な衝突解析
- WebGPU
- Unity連携
- Unreal Engine連携
- エディタ拡張・プラグイン化

## MVP完了条件と現在の状態

| 項目 | 状態 |
| --- | --- |
| `npm run dev` でブラウザ上にアプリが起動する | 実装済み |
| `npm run build` が成功する | 実装済み |
| `npm run typecheck` が成功する | 実装済み |
| ラグドールが表示され、重力で落下する | 実装済み |
| 床と衝突して停止または反発する | 実装済み |
| Resetで初期状態に戻る | 実装済み |
| Dropで画面上部付近から落下を開始する | 実装済み |
| Push Left / Push Rightで胴体に外力を加えられる | 実装済み |
| Launch Upで胴体に上方向の外力を加えられる | 実装済み |
| 全身のCenter of Massが画面上に表示される | 実装済み |
| GUIから少なくとも3つのパラメータを変更できる | 実装済み |
| プリセットを選択してResetすると体型・質量設定が反映される | 実装済み |

## 技術構成
- TypeScript: アプリケーション全体の実装言語
- Vite: 開発サーバーおよびビルド環境
- PixiJS: 2D描画
- matter-js: 2D剛体物理シミュレーション
- lil-gui: パラメータ調整UI

## データモデル
### ラグドールの型イメージ

```TypeScript
type RagdollPreset = {
  name: string;
  body: BodyShapeParams;
  mass: MassParams;
  physics: PhysicsParams;
};
```

### ラグドールのパーツ

```TypeScript
type BodyPartName =
  | "Head"
  | "Torso"
  | "Pelvis"
  | "LeftUpperArm"
  | "LeftLowerArm"
  | "RightUpperArm"
  | "RightLowerArm"
  | "LeftUpperLeg"
  | "LeftLowerLeg"
  | "RightUpperLeg"
  | "RightLowerLeg";
```

### 形状表現
- 頭: 円
- 胴体: 縦長の矩形
- 腕・脚: 細長い矩形
### 関節接続
- 首
- 左肩
- 右肩
- 左肘
- 右肘
- 腰
- 左股関節
- 右股関節
- 左膝
- 右膝

### 体型パラメータ

| パラメータ         | 内容        |
| ------------- | --------- |
| heightScale   | 全体の身長スケール |
| torsoScale    | 胴体の長さ     |
| armScale      | 腕の長さ      |
| legScale      | 脚の長さ      |
| shoulderWidth | 肩幅        |
| hipWidth      | 腰幅        |
| headScale     | 頭の大きさ     |

### 質量分布パラメータ

| パラメータ              | 内容      |
| ------------------ | ------- |
| globalMassScale    | 全体の質量倍率 |
| upperBodyMassRatio | 上半身の重さ  |
| lowerBodyMassRatio | 下半身の重さ  |
| headMassRatio      | 頭の重さ    |
| limbMassRatio      | 手足の重さ   |

### 物理パラメータ

| パラメータ          | 内容       |
| -------------- | -------- |
| gravity        | 重力       |
| friction       | 摩擦       |
| restitution    | 反発係数     |
| airFriction    | 空気抵抗風の減衰 |
| jointStiffness | 関節制約の硬さ  |
| jointDamping   | 関節の減衰    |

## 想定画面
シミュレーション画面のみ。上部に2Dシミュレーション画面、下部左にReset / Drop / Push等の操作ボタン、下部右に身長 / 質量 / 関節硬さ等のパラメータUIを配置する。

## アクション・テストシナリオ
### MVPで入れるもの

| アクション             | 内容        |
| ----------------- | --------- |
| Drop              | ラグドールを画面上部の落下開始位置に再配置する    |
| Push Left / Right | Torso または Pelvis に水平方向の外力を加える |
| Launch Up         | Torso または Pelvis に上方向の外力を加える |
| Reset        | 現在のラグドールを削除し、選択中のプリセットとパラメータで初期状態に再生成する   |

### v1での追加アイテム

| アクション        | 内容          |
| ------------ | ----------- |
| Landing Test | 指定高さから足側で落下 |
| Trip Test    | 足元に障害物を出す   |
| Slope Test   | 傾斜床に落とす     |
| Balance Test | 簡易姿勢制御で立たせる |

## 可視化アイテム
### MVPで入れるもの

| 表示              | 内容          |
| --------------- | ----------- |
| Center of Mass  | 全身の重心       |
| Body Labels     | 頭、胴体、腕などの名前 |
| Skeleton Lines  | 関節接続線       |

### MVP Optional

| 表示                  | 内容              |
| ------------------- | --------------- |
| Velocity Vector | 各部位または全身の速度 |
| Contact Points  | 床や障害物との接触点  |

### v1での追加アイテム

| 表示                  | 内容              |
| ------------------- | --------------- |
| Angular Velocity    | 回転速度            |
| Impact Force Approx | 衝突の強さの近似        |
| Joint Stress        | 関節制約にかかる負荷      |
| Stability Score     | 安定性の簡易スコア       |
| Energy Graph        | 運動エネルギー・位置エネルギー |

## 初期プリセット

- Default
- Tall
- Short
- Long Legs
- Heavy Upper Body
- Heavy Lower Body
- Large Head

## 想定ディレクトリ構成

```text
src/
  main.ts
  app/
    App.ts
  physics/
    PhysicsWorld.ts
    RagdollFactory.ts
    RagdollModel.ts
  rendering/
    PixiRenderer.ts
    DebugDraw.ts
  ui/
    Controls.ts
    presets.ts
  analysis/
    CenterOfMass.ts
    Metrics.ts
  types/
    RagdollTypes.ts
```

## 開発コマンド

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## 手動確認手順

1. `npm run dev -- --host 127.0.0.1 --port 5173` を実行する
2. ブラウザで `http://127.0.0.1:5173` を開く
3. ラグドールが表示され、重力で落下して床と衝突することを確認する
4. lil-guiの `Preset` でプリセットを変更し、`Reset` で体型が反映されることを確認する
5. `Actions` の `Drop` / `Push Left` / `Push Right` / `Launch Up` が動作することを確認する
6. `Parameters applied on Reset` の `gravity`、`friction`、`heightScale` などを変更し、次の `Reset` で反映されることを確認する
7. Center of Mass、Body Labels、Skeleton Linesがラグドールの動きに追従して表示されることを確認する

## 開発ステップ

1. Vite + TypeScript + PixiJS + matter-js の初期セットアップ
2. 物理World、床、単一剛体の表示
3. ラグドール生成
4. Reset / Drop / Pushアクション
5. Center of Mass表示
6. GUIパラメータ調整
7. プリセット切り替え
8. Velocity Vector / Contact Points表示（Optional、未実装）

## 既知の制約

- matter-jsのConstraintを利用するため、人体関節の厳密な角度制限や筋力制御はMVPでは扱わない。
- 体型パラメータ変更時は既存Bodyを変形せず、ラグドールを再生成する。
- MVPでは物理挙動の定量的な正確性より、挙動の観察と可視化を優先する。

