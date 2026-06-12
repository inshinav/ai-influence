# Ясно — концепт-прототип (контекст для агента)

Концепт-редизайн сервиса онлайн-психотерапии «Ясно» (yasno.live) для демонстрации
продуктовых гипотез на интервью (Growth Marketing Lead). Не официальный сайт,
все данные mock, без бэкенда. Деплой: https://inshinlab.com/yasno/ (Beget).

## Команды

- `npm run dev` — dev-сервер на :5173 (служебная страница всех состояний — `/qa`,
  форс фазы суток — `?hour=0–23`)
- `npm run build` — tsc + vite, должен проходить без ошибок и предупреждений
- `npm run lint` — ESLint, должен быть чистым
- Деплой: содержимое `dist/` (включая `.htaccess`) → `public_html/yasno` на Beget;
  готовый архив собирается так: `Compress-Archive -Path (Get-ChildItem dist -Force |
  % FullName) -DestinationPath yasno-beget.zip`. В vite.config `base: './'` —
  не менять, сайт живёт в подпапке.

## Стек и архитектура

Vite + React 18 + TypeScript strict + Tailwind v4 (плагин @tailwindcss/vite,
токены в `@theme` в src/index.css) + motion v12 (`motion/react`) + lucide-react.
Без UI-китов, без роутера (страница `/qa` — проверка pathname в main.tsx).

- `src/App.tsx` — порядок секций = драматургия снятия страхов, у секций
  микро-CTA `onOpenQuiz` (лестница входов в воронку)
- `src/quiz/` — квиз 6 шагов: QuizOverlay (оркестратор, state-машина stages;
  живой счётчик countEligible; запуск с чипа темы стартует с шага 2) → steps/* →
  MatchingAnimation (цитирует ответы) → Results (честный percent 45–97 | null) →
  SlotPicker → SignupGate (телефон опционален) → Confirmation. Квиз/BreathScene/
  QAPage — lazy-чанки, квиз префетчится на idle
- `src/clearing/` — «Расчистка»: тесты-разговор с отражениями на каждый ответ,
  «запотевшим окном» (ClearWindow, туман НЕ на вопросах), веткой поддержки
  (SupportScreen) и PNG-карточкой результата (canvas, без библиотек)
- `src/care/` — «Панель заботы» (CareContext): тихий режим/контраст/крупный
  текст/меньше анимации/звук; состояние ТОЛЬКО в React (localStorage запрещён)
- `src/lib/` — matching (прозрачный скоринг + quoteFromAnswers), slots
  (ЕДИНЫЙ источник расписания: buildDays/timesForDay/nextSlotLabel — карточки,
  результаты и пикер обязаны совпадать), dawn (фазы суток, heroLine у всех фаз),
  motionPresets (SPRING 120/18, blur-in reveal), sound (Web Audio, off
  по умолчанию), haptics, clarity, analytics (track → console), format, ics
- Фото психологов — локальные ассеты (src/assets/therapists), без hotlink

## Бренд «Ясное небо 2.0» (НЕ менять без задачи)

Белый фон + прохладный --mist #F4F7FA; фирменный голубой --sky #279BE0;
CTA на --sky-deep #1873B5 (AA 5.0:1 с белым — не светлить); --azure/--sky-soft
для градиентов неба; тёплый --dawn #FFD9A8 дозированно («dawn = человеческое»:
аватары, тёплые края). Шрифты самохостятся через fontsource — семейства
'Geologica Variable' (display), 'Inter Variable' (body), 'Caveat Variable' —
рукописные завитки (`.hand`, компоненты Scribble: Underline/Arrow/Spark).

Ночная тема (html.night): `bg-paper` = поверхность (ночью #0F151E),
`white` = свет/текст на акцентах (НЕ флипает: сферы, солнце, облака, CTA).
Инверсии — парой ink↔paper (chip-active, выбранные опции): работают в обеих
темах. Включение: фаза 22–5 (`?hour=` форсит и главнее системной тёмной темы) /
prefers-color-scheme / луна в Header / тумблер Панели заботы. Inline-скрипт
в index.html ставит класс до пейнта — зеркалит CareContext.initialNight,
менять только синхронно.
Старые имена токенов paper/sun/sun-deep/peach — алиасы на новый бренд.
Готовые классы: btn-primary/btn-secondary/chip/chip-active/card/card-hover/
glass/eyebrow/hand/container-x/grain/fog-veil/clarity-reveal.

## Железные правила

1. `useCalmMotion()` из care/CareContext — ЕДИНСТВЕННЫЙ способ узнать «движение
   выключено» (не useReducedMotion напрямую). calm=true глушит всё декоративное.
2. Никаких тёмных паттернов: таймеров, «осталось N мест», exit-попапов. Никогда.
3. Русская типографика: «ёлочки», длинное «—», NBSP (U+00A0) в числах
   «3 150 ₽» и перед «—». В JSX NBSP часто живут внутри {' '}-выражений —
   это не баги, не «чинить».
4. Тесты — скрининг, не диагноз (дисклеймеры обязательны); ответы тестов
   не покидают браузер.
5. Анимации только transform/opacity/filter; пружины из motionPresets.
6. TS strict + ESLint: import type (verbatimModuleSyntax); ref НЕ передавать
   напрямую детям AnimatePresence (заворачивать во внутренний div); setState
   не вызывать синхронно в эффекте (отложить setTimeout 0 или derive).
7. Билд и линт должны оставаться чистыми после каждой задачи; коммиты
   осмысленными порциями на русском.

## Ограничение отладки

Встроенная preview-панель держит окно скрытым: requestAnimationFrame не тикает,
скриншоты таймаутятся, exit-анимации AnimatePresence «виснут». Это среда, не баг.
Функциональность проверять через DOM/console (`[track]`-события), визуал —
в реальном браузере (`Start-Process "http://localhost:5173"`).
