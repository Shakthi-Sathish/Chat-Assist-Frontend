export default function Controls({ start, stop, status }) {
  return (
    <>
      <button onClick={start} disabled={status !== "idle"}>
        Start Conversation
      </button>
      <button onClick={stop} disabled={status === "idle"}>
        Stop Conversation
      </button>
    </>
  );
}
