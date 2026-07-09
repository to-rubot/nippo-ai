export type NippoInput = {
  today: string;
  troubles: string;
  tomorrow: string;
};

export function formatNippo({ today, troubles, tomorrow }: NippoInput): string {
  const date = new Date().toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const section = (title: string, body: string, empty: string) =>
    `■ ${title}\n${body.trim() || empty}`;

  return [
    `【日報】${date}←テスト`,
    "",
    section("本日の業務", today, "（未入力）"),
    "",
    section("課題・困ったこと", troubles, "（特になし）"),
    "",
    section("明日の予定", tomorrow, "（未入力）"),
  ].join("\n");
}
