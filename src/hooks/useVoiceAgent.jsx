import { useRef, useState } from "react";

export function useVoiceAgent() {
  const wsRef = useRef(null);
  const recorderRef = useRef(null);
  const [status, setStatus] = useState("idle");

  /* ---------- play audio and notify backend ---------- */
  const playAudio = (audioBase64, role) =>
    new Promise((resolve) => {
      const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);

      audio.onended = () => {
        wsRef.current?.send(
          JSON.stringify({
            type: "PLAYBACK_DONE",
            role,
          }),
        );
        resolve();
      };

      audio.onerror = resolve;
      audio.play();
    });

  /* ---------- recording ---------- */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorderRef.current = new MediaRecorder(stream);

    const chunks = [];

    recorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorderRef.current.onstop = async () => {
      if (!chunks.length) {
        wsRef.current.send(JSON.stringify({ type: "AUDIO", audio: [] }));
        return;
      }

      const blob = new Blob(chunks, { type: "audio/webm" });
      const buffer = await blob.arrayBuffer();

      wsRef.current.send(
        JSON.stringify({
          type: "AUDIO",
          audio: Array.from(new Uint8Array(buffer)),
        }),
      );
    };

    recorderRef.current.start();
    setStatus("listening");

    // stop after 10s max
    setTimeout(() => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
    }, 10000);
  };

  /* ---------- start conversation ---------- */
  const start = () => {
    wsRef.current = new WebSocket("wss://chat-assist-backtend.onrender.com");

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ type: "START" }));
    };

    wsRef.current.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      if (data.type !== "SPEAK") return;

      setStatus("speaking");

      await playAudio(data.audio, data.role);

      // start recording ONLY after question
      if (data.role === "question") {
        setTimeout(startRecording, 1000);
      }

      if (data.role === "closing") {
        setStatus("idle");
      }
    };
  };

  const stop = () => {
    recorderRef.current?.stop();
    wsRef.current?.send(JSON.stringify({ type: "STOP" }));
    wsRef.current?.close();
    setStatus("idle");
  };

  return { start, stop, status };
}
