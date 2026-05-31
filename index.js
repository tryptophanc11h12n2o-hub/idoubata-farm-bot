const express = require("express");
const line = require("@line/bot-sdk");

const config = {
  channelSecret: process.env.ad7fabe49ab0ab87f7fd23258457c89a,
  channelAccessToken: process.env.JRn/e9PBQ9RjwQ1aFSVCA+UWAR2HXaNoe28zzkAK4tW+973QsEpXgKPS3sCcTk0obJMs8h2z1epQcvccRkH2xQscO8f5jZ6RMECjRqrWqKjfbH5AKrdtll7eSvB/39dzIZSoGrM9DcGHnPYIq4cl8wdB04t89/1O/w1cDnyilFU=,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

const app = express();

// LINE Webhookエンドポイント
app.post(
  "/webhook",
  line.middleware(config),
  async (req, res) => {
    try {
      const results = await Promise.all(req.body.events.map(handleEvent));
      res.json(results);
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  }
);

// ヘルスチェック用
app.get("/", (req, res) => res.send("井戸端Farm Bot 稼働中🌿"));

// イベントハンドラー
async function handleEvent(event) {
  // テキストメッセージ以外は無視（画像は別途対応）
  if (event.type === "message" && event.message.type === "text") {
    return handleTextMessage(event);
  }
  if (event.type === "message" && event.message.type === "image") {
    return handleImageMessage(event);
  }
  return null;
}

// テキストメッセージの処理
async function handleTextMessage(event) {
  const text = event.message.text.trim();
  const userId = event.source.userId;
  const groupId = event.source.groupId;

  // ヘルプコマンド
  if (text === "ヘルプ" || text === "help") {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [buildHelpMessage()],
    });
  }

  // 水やり報告
  if (text.includes("水やり") || text.includes("水をあげた") || text.includes("水あげた")) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "💧 水やり記録しました！\nありがとうございます🌱\n\n植物の様子も教えてもらえると管理者が喜びます😊\n例：「バジル元気です」「ローズマリー少し枯れ気味」",
        },
      ],
    });
  }

  // 収穫報告
  if (text.includes("収穫") || text.includes("摘んだ") || text.includes("持って帰")) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "🌿 収穫記録しました！\nたくさん持って帰ってください😄\n\n何を収穫しましたか？\n例：「ミントを収穫」「バジルを少し摘んだ」",
        },
      ],
    });
  }

  // 雑草除去報告
  if (text.includes("雑草") || text.includes("草取り") || text.includes("草を取")) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: "🌾 雑草除去を記録しました！\nいつもお手入れありがとうございます🙏",
        },
      ],
    });
  }

  // 植物の状態報告（バジル・ミント・ローズマリー・ラベンダー）
  const plants = ["バジル", "ミント", "ローズマリー", "ラベンダー", "パセリ"];
  const mentioned = plants.filter((p) => text.includes(p));
  if (mentioned.length > 0) {
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: "text",
          text: `📋 ${mentioned.join("・")}の状態を記録しました！\n管理者に通知します🌿`,
        },
      ],
    });
  }

  // デフォルト応答（使い方ガイド）
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: "「ヘルプ」と送ると使い方を確認できます🌿",
      },
    ],
  });
}

// 画像メッセージの処理（写真投稿）
async function handleImageMessage(event) {
  return client.replyMessage({
    replyToken: event.replyToken,
    messages: [
      {
        type: "text",
        text: "📸 写真を受け取りました！\n管理者に共有します🌿\n\nコメントがあれば続けて送ってください。",
      },
    ],
  });
}

// ヘルプメッセージ（Flex Message）
function buildHelpMessage() {
  return {
    type: "flex",
    altText: "井戸端Farm Bot の使い方",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "🌿 井戸端Farm Bot",
            weight: "bold",
            size: "lg",
            color: "#1D9E75",
          },
          {
            type: "text",
            text: "できること一覧",
            size: "sm",
            color: "#666666",
          },
        ],
        backgroundColor: "#E1F5EE",
        paddingAll: "16px",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          buildHelpItem("💧", "水やり報告", "「水やりしました」と送る"),
          buildHelpItem("🌿", "収穫報告", "「ミントを収穫」と送る"),
          buildHelpItem("🌾", "雑草除去", "「草取りしました」と送る"),
          buildHelpItem("📸", "写真投稿", "そのまま写真を送るだけ"),
          buildHelpItem("📋", "植物の状態報告", "「バジル元気です」と送る"),
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "記録はすべて管理者に届きます",
            size: "xs",
            color: "#999999",
            align: "center",
          },
        ],
      },
    },
  };
}

function buildHelpItem(emoji, title, desc) {
  return {
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: emoji, flex: 0, size: "md" },
      {
        type: "box",
        layout: "vertical",
        margin: "sm",
        contents: [
          { type: "text", text: title, weight: "bold", size: "sm" },
          { type: "text", text: desc, size: "xs", color: "#666666", wrap: true },
        ],
      },
    ],
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot起動中 port:${PORT}`));
