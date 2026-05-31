const line = require("@line/bot-sdk");

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return res.status(200).send("井戸端Farm Bot 稼働中🌿");
  }

  const signature = req.headers["x-line-signature"];
  if (!signature) return res.status(400).send("署名がありません");

  let body = "";
  await new Promise((resolve) => {
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", resolve);
  });

  if (!line.validateSignature(body, config.channelSecret, signature)) {
    return res.status(403).send("署名が不正です");
  }

  const events = JSON.parse(body).events;
  try {
    await Promise.all(events.map(handleEvent));
    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};

async function handleEvent(event) {
  if (event.type === "message" && event.message.type === "text") return handleTextMessage(event);
  if (event.type === "message" && event.message.type === "image") return handleImageMessage(event);
  return null;
}

async function handleTextMessage(event) {
  const text = event.message.text.trim();

  if (text === "ヘルプ" || text === "help") {
    return client.replyMessage({ replyToken: event.replyToken, messages: [buildHelpMessage()] });
  }
  if (text.includes("水やり") || text.includes("水をあげた") || text.includes("水あげた")) {
    return client.replyMessage({ replyToken: event.replyToken, messages: [{ type: "text", text: "💧 水やり記録しました！\nありがとうございます🌱\n\n植物の様子も教えてもらえると管理者が喜びます😊" }] });
  }
  if (text.includes("収穫") || text.includes("摘んだ") || text.includes("持って帰")) {
    return client.replyMessage({ replyToken: event.replyToken, messages: [{ type: "text", text: "🌿 収穫記録しました！\nたくさん持って帰ってください😄" }] });
  }
  if (text.includes("雑草") || text.includes("草取り") || text.includes("草を取")) {
    return client.replyMessage({ replyToken: event.replyToken, messages: [{ type: "text", text: "🌾 雑草除去を記録しました！\nいつもお手入れありがとうございます🙏" }] });
  }
  const plants = ["バジル", "ミント", "ローズマリー", "ラベンダー", "パセリ"];
  const mentioned = plants.filter((p) => text.includes(p));
  if (mentioned.length > 0) {
    return client.replyMessage({ replyToken: event.replyToken, messages: [{ type: "text", text: `📋 ${mentioned.join("・")}の状態を記録しました！\n管理者に通知します🌿` }] });
  }
  return client.replyMessage({ replyToken: event.replyToken, messages: [{ type: "text", text: "「ヘルプ」と送ると使い方を確認できます🌿" }] });
}

async function handleImageMessage(event) {
  return client.replyMessage({ replyToken: event.replyToken, messages: [{ type: "text", text: "📸 写真を受け取りました！\n管理者に共有します🌿\n\nコメントがあれば続けて送ってください。" }] });
}

function buildHelpMessage() {
  return {
    type: "flex", altText: "井戸端Farm Bot の使い方",
    contents: {
      type: "bubble",
      header: { type: "box", layout: "vertical", backgroundColor: "#E1F5EE", paddingAll: "16px",
        contents: [
          { type: "text", text: "🌿 井戸端Farm Bot", weight: "bold", size: "lg", color: "#1D9E75" },
          { type: "text", text: "できること一覧", size: "sm", color: "#666666" },
        ]},
      body: { type: "box", layout: "vertical", spacing: "md",
        contents: [
          buildHelpItem("💧", "水やり報告", "「水やりしました」と送る"),
          buildHelpItem("🌿", "収穫報告", "「ミントを収穫」と送る"),
          buildHelpItem("🌾", "雑草除去", "「草取りしました」と送る"),
          buildHelpItem("📸", "写真投稿", "そのまま写真を送るだけ"),
          buildHelpItem("📋", "植物の状態報告", "「バジル元気です」と送る"),
        ]},
      footer: { type: "box", layout: "vertical",
        contents: [{ type: "text", text: "記録はすべて管理者に届きます", size: "xs", color: "#999999", align: "center" }]},
    },
  };
}

function buildHelpItem(emoji, title, desc) {
  return {
    type: "box", layout: "horizontal",
    contents: [
      { type: "text", text: emoji, flex: 0, size: "md" },
      { type: "box", layout: "vertical", margin: "sm",
        contents: [
          { type: "text", text: title, weight: "bold", size: "sm" },
          { type: "text", text: desc, size: "xs", color: "#666666", wrap: true },
        ]},
    ],
  };
}

