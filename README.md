This is a [Next.js](https://nextjs.org) project bootstrapped with `[create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app)`.

## Getting Started

First, run the development server:

```bash
# 日報作成支援アプリ

## 概要

このアプリは、日々の業務内容を入力することで、日報作成を支援するWebアプリです。

「今日やったこと」「困ったこと」「明日やること」を入力すると、日報としてまとめやすい形で文章を作成できます。

## 主な機能

- 日報の入力フォーム
- AIによる日報生成機能
- テンプレートによる日報作成機能
- 生成結果のコピー機能
- Word形式での保存
- PDF形式での保存
- 過去の日報履歴の保存
- 履歴の検索機能
- 履歴の編集機能
- 履歴の削除機能
- お気に入り登録機能
- タグ追加・削除機能
- タグによる絞り込み機能
- 文字数カウント機能
- 入力内容が少ない場合の注意表示
- ダークモード / ライトモード切り替え

## 使い方

1. 「今日やったこと」「困ったこと」「明日やること」を入力します。
2. 「AIで日報を生成」ボタンを押します。
3. 生成された日報を確認します。
4. 必要に応じて、コピー・Word保存・PDF保存を行います。
5. 作成した日報は履歴として保存されます。
6. 履歴は検索、編集、削除、お気に入り登録、タグ管理ができます。

## 使用技術

- Next.js
- React
- TypeScript
- Tailwind CSS
- localStorage
- docx
- file-saver

## 工夫した点

履歴をただ保存するだけでなく、検索・編集・削除・お気に入り・タグ管理ができるようにしました。

また、入力フォームには文字数カウントや注意表示を追加し、日報の内容が少ない場合でも気づきやすくしました。

画面の見た目についても、履歴カードや編集画面、操作ボタンを整理し、使いやすい画面になるように改善しました。

## 今後追加したい機能

- 日報のカテゴリ分け機能
- 月ごとの履歴表示
- 日報の一覧をより見やすくする機能
- デザインのさらなる改善
- スマートフォン画面での表示調整

## Ver.1.3.0

### 新機能
- 添付画像機能を追加
- 画像プレビュー機能を追加
- 日報履歴に画像を保存・表示する機能を追加
- 添付画像をクリックすると拡大表示できる機能を追加

### 改善
- 画像閲覧時の操作性を向上
- 背景をクリックすると拡大表示を閉じられるように変更

## Ver.1.3.1

### 改善
- 添付画像の削除機能を追加
- 添付画像の操作性を改善
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses `[next/font](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)` to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.