# 2D-Body-Phys

## 概要
2D人型ラグドールの体型・質量・関節・摩擦・重力といったパラメータを操作し、落下・押し出し・着地などのシナリオに対する物理挙動を可視化するWebベースの実験アプリ

## 対象ユーザー
現行の2D Physics技術をベースに人型モデルの挙動を知りたい人

## MVPの目的
### 必須
- ブラウザで起動できる
- 2D人型ラグドールが表示される
- 床と衝突する
- Resetできる
- Pushできる
- 重心が表示される
- 体型プリセットを切り替えられる
- 少なくとも3つのパラメータをGUIで変更できる
### できれば
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

## 技術構成
TypeScript + Vite + PixiJS + matter-js

## データモデル
### ラグドールのパーツ
- Head
- Torso
- Pelvis
- LeftUpperArm
- LeftLowerArm
- RightUpperArm
- RightLowerArm
- LeftUpperLeg
- LeftLowerLeg
- RightUpperLeg
- RightLowerLeg
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
| Drop              | 上から落とす    |
| Push Left / Right | 横方向に力を加える |
| Launch Up         | 上方向に少し飛ばす |
| Reset Pose        | 初期姿勢に戻す   |

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
| Velocity Vector | 各部位または全身の速度 |
| Contact Points  | 床や障害物との接触点  |
| Body Labels     | 頭、胴体、腕などの名前 |
| Skeleton Lines  | 関節接続線       |

### v1での追加アイテム

| 表示                  | 内容              |
| ------------------- | --------------- |
| Angular Velocity    | 回転速度            |
| Impact Force Approx | 衝突の強さの近似        |
| Joint Stress        | 関節制約にかかる負荷      |
| Stability Score     | 安定性の簡易スコア       |
| Energy Graph        | 運動エネルギー・位置エネルギー |

