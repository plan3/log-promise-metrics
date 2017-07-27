# log-promise-metrics

Promise based metrics library to dump metrics in a format consumable by [datadog](https://github.com/kubek2k/heroku-datadog-drain-golang) and [librato](https://devcenter.heroku.com/articles/librato#custom-log-based-metrics) drains

## Installation

```
npm install log-promise-metrics
```

## Usage

```javascript
const metricsFactory = require('log-promise-metrics')(console.log);

const metrics = metricsFactory('baseName');
```

### Measure time passed during promise execution

```javascript
const getAllValues = require('request-promise')({url: ...});
metrics.timed('getAllValues', getAllValues);
metrics.dropToLogs();
// measure#baseName.getAllValues.success_duration=10ms
// or
// measure#baseName.getAllValues.error_duration=10ms
```

### Increment count by given value

```javascript
const sessionCountPromise = Promise.resolve(['0000', '0001', '0002']);
metrics.increment('sessionsCount', v => v.length, sessionsCountPromise);
metrics.dropToLogs();
// count#baseName.sessionsCount=3
```

### Use custom sample

```javascript
const elementsInBasketPromise = require('pg-promise')({..}).query('SELECT ...');
metrics.sample('elementsInBasket', v => v, elementsInBasketPromise);
metrics.dropToLogs();
// sample#baseName.elementsInBasket=10
```

... or, to get a histogram of those values:
```javascript
const elementsInBasketPromise = require('pg-promise')({..}).query('SELECT ...');
metrics.sample('elementsInBasket', v => v, elementsInBasketPromise);
metrics.dropToLogs();
```

