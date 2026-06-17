import { FormEvent, useState } from "react";
import { PredictionInput } from "../lib/types";

type PredictionFormProps = {
  fixtureId: string;
  disabled: boolean;
  onSubmitPrediction: (input: PredictionInput) => Promise<void>;
};

export default function PredictionForm({
  fixtureId,
  disabled,
  onSubmitPrediction,
}: PredictionFormProps) {
  const [predHome, setPredHome] = useState("0");
  const [predAway, setPredAway] = useState("0");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSuccess(false);
    
    try {
      await onSubmitPrediction({
        fixtureId,
        predHome: Number(predHome) || 0,
        predAway: Number(predAway) || 0,
      });
      
      // Tạo hiệu ứng phản hồi lưu thành công
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Lỗi khi lưu dự đoán:", error);
    } finally {
      setBusy(false);
    }
  }

  const isInputDisabled = disabled || busy;

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      {/* Khung bọc cụm nhập tỷ số gọn gàng */}
      <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
        <input
          type="number"
          min={0}
          value={predHome}
          disabled={isInputDisabled}
          onChange={(event) => setPredHome(event.target.value)}
          className="w-12 h-9 text-center font-bold text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
          aria-label="Predicted home score"
        />
        <span className="text-gray-400 font-bold select-none">-</span>
        <input
          type="number"
          min={0}
          value={predAway}
          disabled={isInputDisabled}
          onChange={(event) => setPredAway(event.target.value)}
          className="w-12 h-9 text-center font-bold text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
          aria-label="Predicted away score"
        />
      </div>

      {/* Nút bấm tự động đổi màu theo trạng thái */}
      <button
        type="submit"
        disabled={isInputDisabled || success}
        className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm transition-all duration-200 min-w-[75px] text-center
          ${success 
            ? "bg-green-600 text-white shadow-green-100" 
            : "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
          }`}
      >
        {busy ? "Saving..." : success ? "Saved! ✓" : "Save"}
      </button>
    </form>
  );
}