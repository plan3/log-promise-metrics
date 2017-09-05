# log-promise-metrics

[![Build Status](https://travis-ci.org/plan3/log-promise-metrics.svg?branch=master)](https://travis-ci.org/plan3/log-promise-metrics)

Promise based metrics library to dump metrics in a format consumable by [datadog](https://github.com/kubek2k/heroku-datadog-drain-golang) and [librato](https://devcenter.heroku.com/articles/librato#custom-log-based-metrics) drains

## Installation

```
npm install @plan3-relate/log-promise-metrics
```

## Usage

```javascript
const metricsFactory = require('@plan3-relate/log-promise-metrics')(console.log, 'baseName');

const metrics = metricsFactory();
```

### Measure time passed during promise execution

```javascript
const getAllValues = require('request-promise')({url: ...});
metrics.timed('getAllValues', getAllValues)
    // some then's after
    .then(() => metrics.dropToLogs());
// measure#baseName.getAllValues.success_duration=10ms
// or
// measure#baseName.getAllValues.error_duration=10ms
```

### Increment count by given value

```javascript
const sessionCountPromise = Promise.resolve(['0000', '0001', '0002']);
metrics.increment('sessionsCount', v => v.length, sessionCountPromise)
    // some then's after
    .then(() => metrics.dropToLogs());
// count#baseName.sessionsCount=3
```

### Increment count by 1
```javascript
metrics.increment('visitorsCount')
    // some then's after
    .then(() => metrics.dropToLogs());
```

### Use custom sample

```javascript
const elementsInBasketPromise = require('pg-promise')({..}).query('SELECT ...');
metrics.sample('elementsInBasket', v => v, elementsInBasketPromise);
    // some then's after
    .then(() => metrics.dropToLogs());
// sample#baseName.elementsInBasket=10
```

... or, to get a histogram of those values:
```javascript
const elementsInBasketPromise = require('pg-promise')({..}).query('SELECT ...');
metrics.sample('elementsInBasket', v => v, elementsInBasketPromise);
    // some then's after
    .then(() => metrics.dropToLogs());
// measure#elementsInBasket=42
```

