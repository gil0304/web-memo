interface ClickPosition {
  x: number;
  y: number;
}

// メモを作成
const createStickyNote = (x: number, y: number, text: string = ""): void => {
  // メモのコンテナを作成
  const note = document.createElement("div");
  note.style.position = "absolute";
  note.style.left = `${x}px`;
  note.style.top = `${y}px`;
  note.style.width = "150px";
  note.style.minHeight = "50px";
  note.style.backgroundColor = "yellow";
  note.style.padding = "10px";
  note.style.borderRadius = "5px";
  note.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  note.style.zIndex = "1000";
  note.style.cursor = "move";

  // メモのテキストエリアを作成
  const textArea = document.createElement("div");
  textArea.contentEditable = "true";
  textArea.innerText = text || "ここにメモを入力...";
  textArea.style.outline = "none";
  textArea.style.backgroundColor = "transparent";
  textArea.style.border = "none";
  textArea.style.resize = "none";
  textArea.style.width = "100%";
  textArea.style.color = text ? "black" : "gray";

  // プレースホルダー
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
    note.remove(); // メモを削除
    saveNotes();
  });

  // メモに削除ボタンとテキストエリアを追加
  note.appendChild(textArea);
  note.appendChild(deleteButton);
  document.body.appendChild(note);

  // ドラッグ可能にする
  let isDragging = false;

  note.addEventListener("mousedown", (event: MouseEvent) => {
    if (event.target === textArea) return; // テキストエリアをクリックした場合はドラッグを無効化
    isDragging = true;
    const offsetX = event.clientX - note.getBoundingClientRect().left;
    const offsetY = event.clientY - note.getBoundingClientRect().top;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      note.style.left = `${e.pageX - offsetX}px`;
      note.style.top = `${e.pageY - offsetY}px`;
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

// 右クリック位置を保存する
document.addEventListener("contextmenu", (event: MouseEvent) => {
  const position: ClickPosition = { x: event.pageX, y: event.pageY };
  chrome.storage.local.set({ lastClickPosition: position });
});

// メモを保存する関数
const saveNotes = (): void => {
  const notes = Array.from(document.querySelectorAll("div"))
    .filter((note) => note.querySelector("[contentEditable='true']"))
    .map((note) => {
      const textArea = note.querySelector("[contentEditable='true']") as HTMLDivElement;
      return {
        text: textArea.innerText === "ここにメモを入力..." ? "" : textArea.innerText.trim(),
        x: parseInt(note.style.left || "0", 10),
        y: parseInt(note.style.top || "0", 10)
      };
    });
  localStorage.setItem("stickyNotes", JSON.stringify(notes));
};

// ページをリロードした際に保存されたメモを取得
window.addEventListener("load", () => {
  const savedNotes = localStorage.getItem("stickyNotes");
  const notes: Array<ClickPosition & { text: string }> = savedNotes ? JSON.parse(savedNotes) : [];
  notes.forEach(({ text, x, y }) => createStickyNote(x, y, text));
});

// メッセージを受け取り、指定された位置に付箋を作成
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "createStickyNote") {
    const { x, y } = message;
    createStickyNote(x, y);
    sendResponse({ status: "success" });
  }
});
