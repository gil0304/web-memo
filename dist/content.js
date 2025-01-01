"use strict";
// メモを作成する関数
const createStickyNote = (x, y, text = "") => {
    // メモのコンテナを作成
    const noteContainer = document.createElement("div");
    noteContainer.style.position = "absolute";
    noteContainer.style.left = `${x}px`;
    noteContainer.style.top = `${y}px`;
    noteContainer.style.width = "150px";
    noteContainer.style.minHeight = "50px";
    noteContainer.style.backgroundColor = "yellow";
    noteContainer.style.padding = "10px";
    noteContainer.style.borderRadius = "5px";
    noteContainer.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
    noteContainer.style.zIndex = "1000";
    noteContainer.style.cursor = "move";
    // メモのテキストエリアを作成
    const textArea = document.createElement("div");
    textArea.contentEditable = "true";
    textArea.innerText = text || "ここにメモを入力...";
    textArea.style.outline = "none";
    textArea.style.backgroundColor = "transparent";
    textArea.style.border = "none";
    textArea.style.resize = "none";
    textArea.style.width = "100%";
    textArea.style.minHeight = "30px";
    textArea.style.color = text ? "black" : "gray";
    // テキストエリアのプレースホルダー対応
    textArea.addEventListener("focus", () => {
        if (textArea.innerText === "ここにメモを入力...") {
            textArea.innerText = "";
            textArea.style.color = "black";
        }
    });
    textArea.addEventListener("blur", () => {
        if (!textArea.innerText.trim()) {
            textArea.innerText = "ここにメモを入力...";
            textArea.style.color = "gray";
        }
        saveNotes(); // メモの内容を保存
    });
    // 削除ボタンを作成
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "×";
    deleteButton.style.position = "absolute";
    deleteButton.style.top = "-10px";
    deleteButton.style.right = "-10px";
    deleteButton.style.backgroundColor = "red";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.borderRadius = "50%";
    deleteButton.style.width = "20px";
    deleteButton.style.height = "20px";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.lineHeight = "20px";
    deleteButton.style.textAlign = "center";
    deleteButton.style.fontSize = "12px";
    deleteButton.style.zIndex = "1001";
    deleteButton.addEventListener("click", () => {
        noteContainer.remove(); // メモを削除
        saveNotes(); // 削除後に保存
    });
    // メモに削除ボタンとテキストエリアを追加
    noteContainer.appendChild(textArea);
    noteContainer.appendChild(deleteButton);
    document.body.appendChild(noteContainer);
    // ドラッグ可能にする
    let isDragging = false;
    noteContainer.addEventListener("mousedown", (event) => {
        if (event.target === textArea)
            return; // テキストエリアをクリックした場合はドラッグを無効化
        isDragging = true;
        const offsetX = event.clientX - noteContainer.getBoundingClientRect().left;
        const offsetY = event.clientY - noteContainer.getBoundingClientRect().top;
        const onMouseMove = (e) => {
            if (!isDragging)
                return;
            noteContainer.style.left = `${e.pageX - offsetX}px`;
            noteContainer.style.top = `${e.pageY - offsetY}px`;
        };
        const onMouseUp = () => {
            isDragging = false;
            saveNotes();
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
        };
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });
};
// メモを保存する関数
const saveNotes = () => {
    const notes = Array.from(document.querySelectorAll("div"))
        .filter((note) => note.querySelector("[contentEditable='true']"))
        .map((note) => {
        const textArea = note.querySelector("[contentEditable='true']");
        return {
            text: textArea.innerText === "ここにメモを入力..." ? "" : textArea.innerText.trim(),
            x: parseInt(note.style.left || "0", 10),
            y: parseInt(note.style.top || "0", 10),
        };
    });
    localStorage.setItem("stickyNotes", JSON.stringify(notes));
};
// ページをリロードした際に保存されたメモを復元
window.addEventListener("load", () => {
    const notes = JSON.parse(localStorage.getItem("stickyNotes") || "[]");
    notes.forEach(({ text, x, y }) => createStickyNote(x, y, text));
});
// メッセージを受け取り、指定された位置に付箋を作成
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "createStickyNote") {
        const x = message.x || window.innerWidth / 2; // 指定されたx座標または中央
        const y = message.y || window.innerHeight / 2; // 指定されたy座標または中央
        createStickyNote(x, y);
        sendResponse({ status: "success" });
    }
});
