// 拡張機能がインストールされたときにコンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "createStickyNote",
    title: "付箋を作成",
    contexts: ["page"]
  });
});

// コンテキストメニューがクリックされたときにメッセージを送信
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "createStickyNote" && tab?.id !== undefined) {
    // メッセージを content.ts に送信
    chrome.tabs.sendMessage(
      tab.id,
    {
    action: "createStickyNote"
    },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("エラー:", chrome.runtime.lastError.message);
        } else {
          console.log("レスポンス:", response);
        }
      }
    );
  }
});
