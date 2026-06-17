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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await onSubmitPrediction({
        fixtureId,
        predHome: Number(predHome),
        predAway: Number(predAway),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        type="number"
        min={0}
        value={predHome}
        disabled={disabled || busy}
        onChange={(event) => setPredHome(event.target.value)}
        aria-label="Predicted home score"
      />
      <span>-</span>
      <input
        type="number"
        min={0}
        value={predAway}
        disabled={disabled || busy}
        onChange={(event) => setPredAway(event.target.value)}
        aria-label="Predicted away score"
      />
      <button type="submit" disabled={disabled || busy}>
        Save
      </button>
    </form>
  );
}
