import { DAY_LABELS } from "../services/goal";

function FrequencyFields({ goal, onChange, inputClass }) {
  function toggleDay(day) {
    const next = goal.weekDays.includes(day)
      ? goal.weekDays.filter((d) => d !== day)
      : [...goal.weekDays, day].sort((a, b) => a - b);
    onChange({ weekDays: next });
  }

  return (
    <>
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Frequência</label>
        <select
          value={goal.frequencyType}
          onChange={(e) => onChange({ frequencyType: e.target.value })}
          className={inputClass}
        >
          <option value="DAILY">Todos os dias</option>
          <option value="WEEKLY">Algumas vezes por semana</option>
          <option value="CUSTOM">Dias específicos</option>
        </select>
      </div>

      {goal.frequencyType === "WEEKLY" && (
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Quantas vezes por semana?</label>
          <select
            value={goal.timesPerWeek}
            onChange={(e) => onChange({ timesPerWeek: Number(e.target.value) })}
            className={inputClass}
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}x por semana
              </option>
            ))}
          </select>
        </div>
      )}

      {goal.frequencyType === "CUSTOM" && (
        <div className="md:col-span-2">
          <label className="block text-sm text-zinc-400 mb-2">Quais dias?</label>
          <div className="flex flex-wrap gap-2">
            {DAY_LABELS.map(({ value, label }) => {
              const selected = goal.weekDays.includes(value);
              return (
                <button
                  type="button"
                  key={value}
                  onClick={() => toggleDay(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                    selected
                      ? "bg-orange-500 text-black border-orange-500 font-semibold"
                      : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default FrequencyFields;