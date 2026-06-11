import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { OptionCard, StepHeading, useArrowNav } from '../controls'

export default function StepExperience({
  value,
  onSelect,
}: {
  value: boolean | null
  onSelect: (v: boolean) => void
}) {
  const nav = useArrowNav()
  const [pickedNo, setPickedNo] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const pickNo = () => {
    if (pickedNo) return
    setPickedNo(true)
    // Даём прочитать строку поддержки, потом идём дальше
    timer.current = window.setTimeout(() => onSelect(false), 1600)
  }

  return (
    <div>
      <StepHeading title="Был ли у вас опыт терапии?" />
      <div ref={nav.ref} onKeyDown={nav.onKeyDown} className="mt-8 flex flex-col gap-3">
        <OptionCard selected={value === true} onClick={() => onSelect(true)} title="Да" />
        <OptionCard selected={pickedNo || value === false} onClick={pickNo} title="Нет" />
      </div>
      {pickedNo && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-5 flex items-start gap-2 text-[14.5px] text-ink-soft"
        >
          <Sparkles size={17} className="mt-0.5 shrink-0 text-sun-deep" aria-hidden />
          Половина клиентов Ясно приходят впервые. Психолог поможет освоиться.
        </motion.p>
      )}
    </div>
  )
}
