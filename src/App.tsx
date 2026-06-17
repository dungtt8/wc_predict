import { useState } from "react";

import RoomEntryPage from "./pages/RoomEntryPage";
import RoomDashboardPage from "./pages/RoomDashboardPage";
import { RoomSession } from "./lib/types";

export default function App() {
  const [session, setSession] = useState<RoomSession | null>(null);

  if (!session) {
    return <RoomEntryPage onJoined={setSession} />;
  }

  return <RoomDashboardPage session={session} />;
}
