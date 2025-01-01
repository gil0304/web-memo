"use strict";
// コンテキストメニューを作成
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "createStickyNote",
        title: "付箋を作成",
        contexts: ["page"]
    });
});
// コンテキストメニューがクリックされたときにメッセージを送信
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "createStickyNote" && (tab === null || tab === void 0 ? void 0 : tab.id) !== undefined) {
        // クリック位置を取得してメッセージを送信
        chrome.storage.local.get(["lastClickPosition"], (result) => {
            const { x, y } = result.lastClickPosition || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            chrome.tabs.sendMessage(tab.id, {
                action: "createStickyNote",
                x,
                y
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("エラー:", chrome.runtime.lastError.message);
                }
                else {
                    console.log("レスポンス:", response);
                }
            });
        });
    }
});
