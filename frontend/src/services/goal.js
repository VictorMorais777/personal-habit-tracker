export const DAY_LABELS = [
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
  { value: 7, label: "Dom" },
];

export const emptyHabitForm = {
  name: "",
  description: "",
  isPublic: false,
  frequencyType: "DAILY",
  timesPerWeek: 3,
  weekDays: [],
};

export function goalError(form) {
  if (form.frequencyType === "CUSTOM" && form.weekDays.length === 0) {
    return "Escolha pelo menos um dia da semana.";
  }
  return null;
}

export function buildPayload(form) {
  return {
    name: form.name,
    description: form.description,
    isPublic: form.isPublic,
    frequencyType: form.frequencyType,
    timesPerWeek: form.frequencyType === "WEEKLY" ? Number(form.timesPerWeek) : null,
    weekDays: form.frequencyType === "CUSTOM" ? form.weekDays : [],
  };
}

export function describeGoal(habit) {
  if (habit.frequencyType === "WEEKLY") {
    return `${habit.timesPerWeek || 1}x por semana`;
  }
  if (habit.frequencyType === "CUSTOM") {
    const names = [...(habit.weekDays || [])]
      .sort((a, b) => a - b)
      .map((day) => DAY_LABELS.find((item) => item.value === day)?.label)
      .filter(Boolean);
    return names.length > 0 ? names.join(" · ") : "Dias específicos";
  }
  return "Todos os dias";
}

export function streakLabel(frequencyType, count) {
  const unit =
    frequencyType === "WEEKLY"
      ? count === 1 ? "semana" : "semanas"
      : count === 1 ? "dia" : "dias";
  return `${count} ${unit}`;
}