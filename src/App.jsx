import Controls from "./components/Controls";
import Status from "./components/Status";
import { useVoiceAgent } from "./hooks/useVoiceAgent";
import "./App.css";

export default function App() {
  const { start, stop, status } = useVoiceAgent();

  return (
    <div className="App">
      <h1>AI Voice Agent</h1>
      <Controls start={start} stop={stop} status={status} />
      <Status status={status} />
    </div>
  );
}
