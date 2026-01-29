export default function Controls({ start, stop, status }) {
  return (
    <>
      <button
        className="aurora-btn"
        onClick={start}
        disabled={status !== "idle"}
      >
        Start Conversation
      </button>
      <button
        className="aurora-btn"
        onClick={stop}
        disabled={status === "idle"}
      >
        Stop Conversation
      </button>
    </>
  );
}
