# cron-scheduler

Running functions on a schedule using the cron syntax

## Зачем?

Данная библиотека позволяет выполнять функции в назначенное время, с использованием синтаксиса `cron`.

#### Особенности:

1. Не привязана к `Nodejs` и может работать прямо в браузере;
2. Устойчива к "неправильным" пробелам: `1 - 5 / % 2 0 0?1*`;
3. Всегда выполняется в правильное время с учётом тайм зоны;
4. Не имеет зависимостей или чужого стороннего кода;
5. Очень мало весит (~9 кб. И речь не про `gzip`);
6. Имеет ряд дополнительных возможностей:

#### Формат

```
*  *  *  *  *  *
┬  ┬  ┬  ┬  ┬  ┬
│  │  │  │  │  └─ день недели: 0-7 (0 и 7 это воскресение), MoN-sUn, 1-7L#1
│  │  │  │  └────── месяц: 1-12, JaN-dEc
│  │  │  └─────────── день месяца: 1-31, L, LW
│  │  └──────────────── часы: 0-23
│  └───────────────────── минуты: 0-59
└────────────────────────── секунды (опционально): 0-59
```

#### Спецсимволы

| Символ | Описание | Пример |
| --- | --- | --- |
| `*` и `?` | Любое значение | `* ? * ? *` (каждую минуту) |
| `-` | Диапазон | `1-5 * * * *` (с 1-ой по 5-ую минуту включительно) |
| `,` | Разделитель правил | `1,5-7 * * * *` (1-ая, 5-ая, 6-ая и 7-ая минуты) |
| `/` | Шаг | `*/5 * * * *` (каждые пять минут) |
| `L` | Последний день недели/месяца | `0 0 * * 5-6L` (последняя пятница и суббота месяца) |
|  |  | `0 0 L * *` (последний день месяца) |
| `LW` | Последний рабочий день месяца | `0 0 LW * *` (последний рабочий день месяца) |
| `#` | Номер недели | `0 0 * * 5#1#3` (Первая и третья пятница месяца) |
| `%` | Случайное значение | `*/%5 * * * *` (в любую минуту каждые пять минут) |

## Установка

Этой библиотеки нет в `npm`, поэтому для её установки нужно прописать в `package.json`:

package.json

```json
{
  "dependencies": {
    "cron-scheduler": "github:wareset/cron-scheduler"
  }
}
```

Или выполнить команду:

```bash
npm i github:wareset/cron-scheduler
```

## Примеры

#### 1. CronScheduler

```typescript
import { CronScheduler, type CronSchedulerOptions } from 'cron-scheduler'

const options: CronSchedulerOptions = {
  // [Обязательно] Время в формате 'cron'.
  cronTime: '*/%15 0 0 * * 1-5L#1#2',
  // [Необязательно] Тайм зона.
  timeZone: 'America/Chicago',
  // [Необязательно] Сразу запустить 'CronScheduler.start()'.
  // По умолчанию 'true'
  start: true,
  // [Необязательно] Если указан, то будет использоваться
  // псевдорандом, иначе - стандартный 'Math.random'.
  seedForRandom: 42,
  // [Обязательно] Функция, вызываемая по расписанию.
  onTick(this: CronScheduler) {
    console.log('onTick', this.nextDate)
  },
  // [Необязательно] Функция, вызываемая при старте.
  onStart(this: CronScheduler) {
    console.log('onStart', this.nextDate)
  },
  // [Необязательно] Функция, вызываемая при остановке.
  onStop(this: CronScheduler) {
    console.log('onStop', this.nextDate)
  },
}

interface CronScheduler {
  // Запущен ли CronScheduler
  readonly started: boolean
  // Запускает CronScheduler
  start: () => void
  // Останавливает CronScheduler
  stop: () => void
  // Хранит время следующего выполнения функции 'onTick'
  nextDate: Date | null
}

new CronScheduler(options)
```

#### 2. CRON_TIME_PRESETS

```typescript
import { CronScheduler, CRON_TIME_PRESETS } from 'cron-scheduler'

// Готовые пресеты для 'cronTime':
CRON_TIME_PRESETS ==
  {
    // Раз в год в полночь 1-го января
    YEARLY: '0 0 0 1 1 *',
    // Раз в месяц в полночь 1-го числа
    MONTHLY: '0 0 0 1 * *',
    // Раз в неделю в полночь воскресенья
    WEEKLY: '0 0 0 * * 0',
    // Раз в день в полночь
    DAILY: '0 0 0 * * *',
    // Один раз в час
    HOURLY: '0 0 * * * *',
    // Один раз в минуту
    MINUTELY: '0 * * * * *',
    // Каждую секунду
    SECONDLY: '* * * * * *',
    // Каждый будний день в полночь
    WEEKDAYS: '0 0 0 * * 1-5',
    // Каждые выходные в полночь
    WEEKENDS: '0 0 0 * * 0,6',
  }

new CronScheduler({
  // Выполнение каждую секунду
  cronTime: CRON_TIME_PRESETS.SECONDLY,
  // а еще можно записать так:
  cronTime: '* * * * * *',
  // или так:
  cronTime: 'SECONDLY',
  // или так:
  cronTime: '@SeCoNdLy',

  onTick(this: CronScheduler) {
    console.log('onTick', this.nextDate)
  },
})
```
