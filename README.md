# cron-scheduler

Running functions on a schedule using the cron syntax.

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
│  │  │  │  │  └─ день недели: 0-7L#1 (0 и 7 это воскресение), MoN-sUn
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
| `/%` | Случайное значение | `*/%5 * * * *` (в любую минуту каждые пять минут) |
| `L` | Последний день недели/месяца | `0 0 * * 5-6L` (последняя пятница и суббота месяца) |
|  |  | `0 0 L * *` (последний день месяца) |
| `LW` | Последний рабочий день месяца | `0 0 LW * *` (последний рабочий день месяца) |
| `#` | Номер недели | `0 0 * * 5#1#3` (первая и третья пятница месяца) |

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
  // [Обязательно] Функция, вызываемая по расписанию cronTime.
  onTick(this: CronScheduler) {
    console.log('onTick', this.nextDate)

    // Если потребуется остановить CronScheduler:
    if (need_stop) {
      this.stop()
    }
  },
  // [Необязательно] Функция, вызываемая при старте.
  onStart(this: CronScheduler) {
    console.log('onStart', this.nextDate)
  },
  // [Необязательно] Функция, вызываемая при остановке.
  onStop(this: CronScheduler) {
    console.log('onStop', this.nextDate) // будет null
  },
}

interface CronScheduler {
  // Запущен ли CronScheduler
  readonly started: boolean
  // Запускает CronScheduler
  start: (this: CronScheduler) => void
  // Останавливает CronScheduler
  stop: (this: CronScheduler) => void
  // Хранит время следующего выполнения функции 'onTick'
  nextDate: Date | null
}

const cronScheduler = new CronScheduler(options)
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
    // Каждый час
    HOURLY: '0 0 * * * *',
    // Каждую минуту
    MINUTELY: '0 * * * * *',
    // Каждую секунду
    SECONDLY: '* * * * * *',
    // Каждый будний день в полночь
    WEEKDAYS: '0 0 0 * * 1-5',
    // Каждые выходные в полночь
    WEEKENDS: '0 0 0 * * 0,6',
  }

new CronScheduler({
  // Выполнение каждую минуту
  cronTime: CRON_TIME_PRESETS.MINUTELY,
  // а еще можно записать так:
  cronTime: '@MINUTELY',
  // или даже так:
  cronTime: 'MiNuTeLy',
  // или, естественно, так:
  cronTime: '0 * * * * *',
  // или так:
  cronTime: '0*****',
  // а ещё так):
  cronTime: '', // или '*', '**', '***', '****', '*****'
  // Это потому, что если полей меньше 6-ти, то для секунд
  // впереди устанавливается значение '0', а для всех остальных
  // недостающих полей устанавливается значение '*'.

  onTick(this: CronScheduler) {
    console.log('onTick', this.nextDate)
  },
})
```

#### 3. ParsedDate

Работа с датами в `js` достаточно сложная из-за отсутствия возможности установить тайм зону. Поэтому, из-за различий во времени на разных участках планеты, можно получить неожиданные результаты:

```js
const date = new Date('2025-01-01T05:00:00.000Z')

for (let i = 0; i <= 12; ++i) {
  // Просто меняем месяц:
  date.setMonth(i)
  // или можно так:
  // date.setUTCMonth(i)

  const str = date.toLocaleString('en-US', {
    // Но, если выставим другую тайм зону:
    timeZone: 'America/Chicago',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'shortOffset',
  })

  console.log(str)
}

// Получим такой результат:
/*
12/31/2024, 23:00:00 GMT-6
01/31/2025, 23:00:00 GMT-6
02/28/2025, 23:00:00 GMT-6
04/01/2025, 00:00:00 GMT-5
05/01/2025, 00:00:00 GMT-5
06/01/2025, 00:00:00 GMT-5
07/01/2025, 00:00:00 GMT-5
08/01/2025, 00:00:00 GMT-5
09/01/2025, 00:00:00 GMT-5
10/01/2025, 00:00:00 GMT-5
11/01/2025, 00:00:00 GMT-5
11/30/2025, 23:00:00 GMT-6
12/31/2025, 23:00:00 GMT-6
*/
```

Из-за того, что в моей тайм зоне нет перехода на зимнее/летнее время, а в 'America/Chicago' есть, время "скачет" на один час так, что в нашем случае это влияет и на текущий день и даже на месяц.

`ParsedDate` это вспомогательный класс для работы с объектом `Date`, который изменяет объект `Date` правильно, с учётом смещения времени:

```typescript
import { ParsedDate } from 'cron-scheduler'

const parsedDate = new ParsedDate(
  // [Необязательно] Date (будет только скопировано время)
  new Date('2025-01-01T05:00:00.000Z'),
  // [Необязательно] тайм зона - будет доступна в 'this._zone'
  'America/Chicago'
)
parsedDate.year(2025)
parsedDate.date(1)

for (let i = 0; i <= 12; ++i) {
  // В 'ParsedDate' месяц начинается с единицы, а не с нуля,
  // поэтому прибавляем единицу:
  parsedDate.month(i + 1)

  const str = parsedDate._date.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'shortOffset',
  })

  console.log(str)
}

// Результат:
/*
01/01/2025, 23:00:00 GMT-6
02/01/2025, 23:00:00 GMT-6
03/01/2025, 23:00:00 GMT-6
04/01/2025, 23:00:00 GMT-5
05/01/2025, 23:00:00 GMT-5
06/01/2025, 23:00:00 GMT-5
07/01/2025, 23:00:00 GMT-5
08/01/2025, 23:00:00 GMT-5
09/01/2025, 23:00:00 GMT-5
10/01/2025, 23:00:00 GMT-5
11/01/2025, 23:00:00 GMT-5
12/01/2025, 23:00:00 GMT-6
01/01/2026, 23:00:00 GMT-6
*/
```

Класс `CronScheduler` использует вспомогательный класс `ParsedDate` для правильного расчёта времени. И поэтому важно всегда выставлять правильную тайм зону, поскольку она может отличаться от нужной, как на сервере, так и на клиенте.

## Ошибки

В данной библиотеке есть множество проверок на правильность заполнения поля `cronTime`. Но, всё учесть невозможно.

Например:

```
0 0 0 L * 1#1
```

Эта запись означает выполнение задачи в первый понедельник месяца и одновременно в последний день месяца что, естественно, невозможно.

В этом случае `CronScheduler` упадёт с ошибкой:

```js
import { CronScheduler } from 'cron-scheduler'

try {
  new CronScheduler({
  cronTime: '0 0 0 L * 1#1',

  onTick(this: CronScheduler) {
    console.log('onTick', this.nextDate)
  },
})
} catch(e) {
  console.log(e)
  e == new Error(
`CronScheduler: Max iterates count: 10000.
Date: Thu Feb 20 2053 00:00:00 GMT+0500 (GMT+05:00)`)
}
```

## License

[MIT](LICENSE)
