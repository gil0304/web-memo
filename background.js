// 拡張機能がインストールされたときにコンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "createStickyNote",
    title: "付箋を作成",
    contexts: ["page"],
  });
});

// コンテキストメニューがクリックされたときにスクリプトを実行
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "createStickyNote") {
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("about:")) {
      console.error("このページでは動作しません");
      return;
    }
    chrome.tabs.sendMessage(
      tab.id,
      { action: "createStickyNote", x: info.pageX, y: info.pageY },
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
