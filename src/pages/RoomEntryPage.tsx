import { useState } from "react";
import { RoomSession } from "../lib/types";

type RoomEntryPageProps = {
  onJoined: (session: RoomSession) => void;
};

const randomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const randomId = () => globalThis.crypto?.randomUUID?.() ?? `member-${Date.now()}`;

export default function RoomEntryPage({ onJoined }: RoomEntryPageProps) {
  const [nickname, setNickname] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = (code: string) => {
    setIsJoining(true);
    onJoined({
      roomId: `room-${code}`,
      roomCode: code,
      memberId: randomId(),
      nickname: nickname.trim(),
    });
  };

  const isNicknameValid = nickname.trim().length >= 2;
  const isCodeValid = roomCode.trim().length >= 4;

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">World Cup 2026</h1>
      <p className="text-gray-600 mb-6">Create a room or join your friends.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
          <input
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Enter your name"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <button
          onClick={() => handleJoin(randomCode())}
          disabled={!isNicknameValid || isJoining}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {isJoining ? "Creating..." : "Create New Room"}
        </button>

        <div className="relative my-4 flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="px-3 text-gray-400 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-2 border rounded-lg uppercase focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="ROOM CODE (e.g. ABC123)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <button
            onClick={() => handleJoin(roomCode.trim().toUpperCase())}
            disabled={!isNicknameValid || !isCodeValid || isJoining}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-black disabled:opacity-50 transition"
          >
            Join
          </button>
        </div>
      </div>
    </main>
  );
}