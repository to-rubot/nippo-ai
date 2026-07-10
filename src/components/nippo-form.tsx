"use client";

import { useState, useEffect } from "react";
import { formatNippo } from "@/lib/format-nippo";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";

type Field = "today" | "troubles" | "tomorrow";

const fields: { key: Field; label: string; placeholder: string }[] = [
  {
    key: "today",
    label: "今日やったこと",
    placeholder: "例: Next.js プロジェクトのセットアップ、日報フォームのUI実装",
  },
  {
    key: "troubles",
    label: "困ったこと",
    placeholder: "例: dev サーバー起動時にポートが使用中だった",
  },
  {
    key: "tomorrow",
    label: "明日やること",
    placeholder: "例: AI 連携の API ルート実装、デプロイ",
  },
];

export function NippoForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    today: "",
    troubles: "",
    tomorrow: "",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<string[]>([])
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"new" | "old">("new");
  const [showHistory, setShowHistory] = useState(true);
  const [mode, setMode] = useState<"ai" | "template" | null>(null);
  const [copied, setCopied] = useState(false)
  const [darkMode, setDarkMode] = useState(true);
  const [openHistoryIndex, setOpenHistoryIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [tagItems, setTagItems] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  const [selectedTag, setSelectedTag] = useState("");

    useEffect(() => {
      const saved = localStorage.getItem("nippo-history");
    
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    
      const savedFavorites = localStorage.getItem("nippo-favorites");
    
      if (savedFavorites) {
        setFavoriteItems(JSON.parse(savedFavorites));
      }

      const savedTags = localStorage.getItem("nippo-tags");

      if (savedTags) {
        setTagItems(JSON.parse(savedTags));
      }

    }, []);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setMode(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("生成に失敗しました");
      }

      const data = (await res.json()) as {
        report: string;
        mode: "ai" | "template";
      };
      setResult(data.report);
      setMode(data.mode);
      const now = new Date().toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      
      const newHistory = [`【作成日時】${now}\n\n${data.report}`, ...history];

      setHistory(newHistory);

      localStorage.setItem(
        "nippo-history",
        JSON.stringify(newHistory)
      );
    } catch {
      setResult(formatNippo(values));
      setMode("template");
      setError("API に接続できなかったため、テンプレートで生成しました。");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleClearForm() {
    const ok = window.confirm("入力内容をクリアしますか？");
  
    if (!ok) return;
  
    setValues({
      today: "",
      troubles: "",
      tomorrow: "",
    });
  }

  function handleClearResult() {
    const ok = window.confirm("生成結果をクリアしますか？");
  
    if (!ok) return;
  
    setResult("");
    setMode(null);
    setError("");
    setCopied(false);
  }

  function handleClearHistory() {
    alert("削除ボタン押した");


    const ok = window.confirm("すべての履歴を削除しますか？");
  
    if (!ok) return;
  
    localStorage.removeItem("nippo-history");
    setHistory([]);
  }

  function handleDeleteHistory(index: number) {
    alert("削除ボタンが押されました");
  
    const ok = window.confirm("この履歴を削除しますか？");
  
    if (!ok) return;
  
    const newHistory = history.filter((_, i) => i !== index);
  
    setHistory(newHistory);
  
    localStorage.setItem(
      "nippo-history",
      JSON.stringify(newHistory)
    );
  }

  function handleStartEdit(index: number, text: string) {
    setEditingIndex(index);
    setEditingText(text);
  }
  
  function handleCancelEdit() {
    setEditingIndex(null);
    setEditingText("");
  }
  
  function handleSaveEdit() {
    if (editingIndex === null) return;
  
    const newHistory = history.map((item, index) =>
      index === editingIndex ? editingText : item
    );
  
    setHistory(newHistory);
  
    localStorage.setItem(
      "nippo-history",
      JSON.stringify(newHistory)
    );
  
    setEditingIndex(null);
    setEditingText("");
  }

  function handleToggleFavorite(item: string) {
    const newFavorites = favoriteItems.includes(item)
      ? favoriteItems.filter((favorite) => favorite !== item)
      : [...favoriteItems, item];
  
    setFavoriteItems(newFavorites);

    localStorage.setItem(
      "nippo-favorites",
      JSON.stringify(newFavorites)
    );
  }

  function handleAddTag(item: string) {
    const tag = (tagInput[item] || "").trim();
  
    if (!tag) return;
  
    const currentTags = tagItems[item] || [];
  
    if (currentTags.includes(tag)) {
      setTagInput({
        ...tagInput,
        [item]: "",
      });
      return;
    }
  
    const newTagItems = {
      ...tagItems,
      [item]: [...currentTags, tag],
    };
  
    setTagItems(newTagItems);
  
    localStorage.setItem(
      "nippo-tags",
      JSON.stringify(newTagItems)
    );
  
    setTagInput({
      ...tagInput,
      [item]: "",
    });
  }
  
  function handleRemoveTag(item: string, tag: string) {
    const currentTags = tagItems[item] || [];
  
    const newTags = currentTags.filter((t) => t !== tag);
  
    const newTagItems = {
      ...tagItems,
      [item]: newTags,
    };
  
    if (newTags.length === 0) {
      delete newTagItems[item];
    }
  
    setTagItems(newTagItems);
  
    localStorage.setItem(
      "nippo-tags",
      JSON.stringify(newTagItems)
    );
  }

  async function handleDownloadWord() {
    if (!result) return;

    const doc = new Document({
      sections: [
        {
          children: result.split("\n").map((line) => new Paragraph(line)),
        },
      ],
    });
  
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `日報_${new Date().toISOString().slice(0, 10)}.docx`);
  }

  function handleDownloadPdf() {
    if (!result) return;
  
    const printWindow = window.open("", "_blank");
  
    if (!printWindow) return;
  
    printWindow.document.write(`
      <html>
        <head>
          <title>日報PDF</title>
          <style>
            body {
              font-family: "Yu Gothic", "Meiryo", sans-serif;
              padding: 40px;
              line-height: 1.8;
              white-space: pre-wrap;
            }
          </style>
        </head>
        <body>
          ${result.replace(/\n/g, "<br>")}
        </body>
      </html>
    `);
  
    printWindow.document.close();
    printWindow.print();
  } 

  function handleDownloadCsv() {
    if (history.length === 0) return;
  
    const csvContent = [
      "番号,内容",
      ...history.map((item, index) =>
        `${index + 1},"${item.replace(/"/g, '""')}"`
      ),
    ].join("\n");
  
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
  
    saveAs(
      blob,
      `日報履歴_${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  const allTags = Array.from(
    new Set(Object.values(tagItems).flat())
  );

  const filteredHistory = history.filter((item) => {
    const tags = tagItems[item] || [];
  
    const matchesSearch =
      item.toLowerCase().includes(search.toLowerCase()) ||
      tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );
  
    const matchesFavorite =
      !showFavoritesOnly || favoriteItems.includes(item);

    const matchesTag =
      !selectedTag || tags.includes(selectedTag);
  
    return matchesSearch && matchesFavorite && matchesTag;
  });

const sortedHistory =
  sortOrder === "new" ? filteredHistory : [...filteredHistory].reverse();

const totalCharacters =
  values.today.length + values.troubles.length + values.tomorrow.length;

const isInputShort = totalCharacters > 0 && totalCharacters < 30;

  return (
    <div className={darkMode ? "dark min-h-screen bg-zinc-950 text-white" : "min-h-screen bg-white text-zinc-900"}>
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
         日報作成支援アプリ
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
         今日の業務内容を入力し、AIで日報を作成します
        </p>
      </header>

      <button
        type="button"
        onClick={() => setDarkMode(!darkMode)}
        className="mb-4 rounded-lg border border-zinc-400 px-3 py-2 text-sm"
      >
        {darkMode ? "☀️ ライトモード" : "🌙 ダークモード"}
      </button>

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleGenerate();
        }}
      >
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="block">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {label}
              </label>

              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {values[key].length}文字
              </span>
            </div>

            <textarea
              name={key}
              rows={4}
              value={values[key]}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key]: e.target.value }))
              }
              placeholder={placeholder}
              className="w-full resize-y rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm"
            />
          </div>
        ))}

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          入力合計：{totalCharacters}文字
        </div>

        {isInputShort && (
          <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
            入力内容が少なめです。もう少し詳しく書くと、より分かりやすい日報になります。
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "生成中…" : "AIで日報を生成"}
        </button>

        <button
          type="button"
          onClick={handleClearForm}
          className="w-full rounded-lg border border-zinc-400 px-4 py-3 text-sm"
        >
          入力欄をクリア
        </button>
        
        {copied && (
          <p className="mt-2 text-xs text-green-600">
            コピーしました
          </p>
        )}
      </form>

      <section className="mt-10" aria-live="polite">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            生成結果
          </h2>
          {result && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100"
              >
                日報をコピー
              </button>

              <button
                type="button"
                onClick={handleDownloadWord}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100"
              >
                Wordで保存
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100"
              >
                PDFで保存
              </button>

              <button
                type="button"
                onClick={handleClearResult}
                className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                生成結果をクリア
              </button>
            </div>
          )}
        </div>
            

        {error && (
          <p className="mb-2 text-xs text-amber-700 dark:text-amber-400">
            {error}
          </p>
        )}
        {mode === "ai" && (
          <p className="mb-2 text-xs text-emerald-700 dark:text-emerald-400">
            AI で整形しました（OPENAI_API_KEY 設定時）
          </p>
        )}

        <div
          className={`min-h-[12rem] rounded-lg border border-dashed px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            result
              ? "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100"
              : "border-zinc-200 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500"
          }`}
        >
          {result || "「日報を生成」を押すと、ここに結果が表示されます。"}
        </div>
      </section>
        
      {history.length > 0 && (
  <section className="mt-10">
    <button
      type="button"
      onClick={() => setShowHistory(!showHistory)}
      className="mb-3 text-sm font-bold"
    >
      {showHistory ? "▼" : "▶"} 過去の日報（{filteredHistory.length}/{history.length}件）
    </button>

    {showHistory && (
      <>
        <input
          type="text"
          placeholder="履歴を検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedTag("")}
            className={`rounded border px-2 py-1 text-xs ${
              selectedTag === ""
                ? "bg-blue-600 text-white"
                : ""
            }`}
          >
            すべて
          </button>

          {allTags.length === 0 ? (
            <span className="text-xs text-zinc-500">
              タグはまだありません
            </span>
          ) : (
            allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`rounded border px-2 py-1 text-xs ${
                  selectedTag === tag
                  ? "bg-blue-600 text-white"
                  : ""
                }`}
              >
                #{tag}
              </button>
            ))
          )}
        </div>

        {selectedTag && (
          <div className="mb-3 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-700">
            現在「#{selectedTag}」で絞り込み中です。

            <button
              type="button"
              onClick={() => setSelectedTag("")}
              className="ml-2 underline"
            >
              解除
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="rounded border px-3 py-1 text-xs"
          >
          {showFavoritesOnly ? "すべて表示" : "★ お気に入りだけ"}
        </button>

        <button
          type="button"
          onClick={handleClearHistory}
          className="mb-3 text-xs text-red-600 underline"
        >
          履歴を削除
        </button>

        <button
          type="button"
          onClick={handleDownloadCsv}
          className="mb-3 ml-3 text-xs text-green-600 underline"
        >
          CSVで保存
        </button>
       
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => setSortOrder("new")}
            className="rounded border px-3 py-1 text-xs"
          >
             新しい順
          </button>

          <button
            type="button"
            onClick={() => setSortOrder("old")}
            className="rounded border px-3 py-1 text-xs"
          >
            古い順
          </button>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="text-sm text-zinc-500">
            検索結果がありません
          </p>
        ) : (
          sortedHistory.map((item, index) => {
            const firstLine = item.split("\n")[0];
          
            return (
            <div
              key={index}
              className="mb-3 rounded-lg border border-zinc-300 p-3 text-sm whitespace-pre-wrap"
            >
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteHistory(index)}
                  className="rounded-lg border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  削除
                </button>

                <button
                  type="button"
                  onClick={() => handleStartEdit(index, item)}
                  className="rounded-lg border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100"
                >
                  編集
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleFavorite(item)}
                  className={`rounded-lg border px-3 py-1 text-xs font-medium ${
                    favoriteItems.includes(item)
                      ? "border-yellow-400 bg-yellow-100 text-yellow-700"
                      : "border-zinc-300 text-yellow-600 hover:bg-yellow-50"
                  }`}
                >
                  {favoriteItems.includes(item) ? "★ お気に入り解除" : "☆ お気に入り"}
                </button>
              </div>

              <div className="mb-2 flex flex-wrap gap-2">
                {(tagItems[item] || []).length === 0 ? (
                  <span className="text-xs text-zinc-500">
                    この履歴にはタグがありません
                  </span>
                ) : (
                  (tagItems[item] || []).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-700"
                    >
                      #{tag}

                      <button
                        type="button"
                        onClick={() => handleRemoveTag(item, tag)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </span>
                  ))
               )}
              </div>

              <div className="mb-3 flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={tagInput[item] || ""}
                  onChange={(e) =>
                    setTagInput({
                      ...tagInput,
                      [item]: e.target.value,
                    })
                  }
                  placeholder="タグを入力"
                  className="min-w-[180px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-900"
                />

                <button
                  type="button"
                  onClick={() => handleAddTag(item)}
                  className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-950"
                >
                  タグ追加
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setOpenHistoryIndex(openHistoryIndex === index ? null : index)
                }
                className="mt-2 flex w-full items-center justify-between rounded-lg bg-zinc-100 px-3 py-2 text-left text-sm font-bold text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <span>
                  {firstLine}
                </span>

                <span className="text-xs">
                  {openHistoryIndex === index ? "閉じる ▲" : "開く ▼"}
                </span>
              </button>

            {openHistoryIndex === index && (
              editingIndex === index ? (
              <>
                <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white p-3 text-sm leading-relaxed text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                    rows={12}
                  />

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      className="rounded-lg border border-green-300 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-950"
                    >
                      保存
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </>
            ) : (

              <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm leading-relaxed text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                {item}
              </div>
            )
            )}
          </div>
         );
        })
      )}
    </>
  )}
</section>
)}

<footer className="mt-10 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
  <p>日報作成支援アプリ Ver.1.0.0</p>
  <p>© 2026 Tooru</p>
</footer>

</div>
</div>
);
}