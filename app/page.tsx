"use client";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");

  const submitPaste = async () => {
    if (!content.trim()) {
      alert("Please enter some text");
      return;
    }

    try {
      const res = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        alert("Failed to create paste: server did not return JSON");
        return;
      }

      if (!res.ok) {
        alert(data.error || "Failed to create paste");
        return;
      }

      setUrl(data.url);
    } catch (error) {
      console.error(error);
      alert("Error creating paste");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Pastebin Lite</h1>
      <textarea
        rows={10}
        cols={50}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <br />
      <br />
      <button onClick={submitPaste}>Create Paste</button>
      {url && (
        <p>
          Share link: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </p>
      )}
    </div>
  );
}
