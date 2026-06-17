import { useState } from "react";

import { RoomSession } from "../lib/types";

type RoomEntryPageProps = {
  onJoined: (session: RoomSession) => void;
};

function randomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function randomId() {
  return globalThis.crypto?.randomUUID?.() ?? `member-${Date.now()}`;
}

export default function RoomEntryPage({ onJoined }: RoomEntryPageProps) {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");

  function createRoom() {
    const code = randomCode();
    onJoined({
      roomId: `room-${code}`,
      roomCode: code,
      memberId: randomId(),
      nickname: nickname.trim(),
    });
  }

  function joinRoom() {
    const code = roomCode.trim().toUpperCase();
    onJoined({
      roomId: `room-${code}`,
      roomCode: code,
      memberId: randomId(),
      nickname: nickname.trim(),
    });
  }

  const disabled = nickname.trim().length < 2;

  return (
    <main>
      <h1>World Cup 2026 Prediction</h1>
      <p>Create a room or join your friends with room code.</p>

      <label>
        Nickname
        <input
          aria-label="Nickname"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
        />
      </label>

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={createRoom} disabled={disabled}>
          Create Room
        </button>

        <input
          aria-label="Room Code"
          placeholder="ABC123"
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value)}
        />
        <button onClick={joinRoom} disabled={disabled || roomCode.trim().length < 4}>
          Join Room
        </button>
      </div>
    </main>
  );
}
