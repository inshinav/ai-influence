export default function QuizProgress({ step, total }: { step: number; total: number }) {
  return (
    <p className="text-[13.5px] font-medium text-ink-soft" aria-live="polite">
      Шаг {step} из {total}
    </p>
  )
}
