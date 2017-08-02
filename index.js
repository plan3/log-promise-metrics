'use strict';

function timed(promise) {
    const timeDelta = (d1, d2) => d2.valueOf() - d1.valueOf();

    return Promise.resolve(new Date())
        .then(startTime => {
            return promise
                .then(result => [timeDelta(startTime, new Date()), result])
                .catch(err => {
                    const newErr = {
                        name: 'Timed error',
                        message: 'Error thrown in timed promise',
                        duration: timeDelta(startTime, new Date()),
                        reason: err
                    };
                    throw newErr;
                });
        });
}

module.exports = (logFn, baseName) =>
    () => {
        const collected = {
            measure: {},
            count: {},
            sample: {}
        };
        const formatMetrics = () => Object
            .keys(collected)
            .map(type =>
                Object.keys(collected[type])
                    .map(k => `${type}#${baseName}.${k}=${collected[type][k]}`)
                    .join(' '))
            .join(' ');
        const metrics = {
            dropToLogs: () => {
                logFn(formatMetrics());
                return metrics;
            },
            sample: (name, metricProducer, promise) => {
                return promise.then(v => {
                    collected.sample[name] = metricProducer(v);
                    return v;
                });
            },
            measure: (name, metricProducer, promise) => {
                return promise.then(v => {
                    collected.measure[name] = metricProducer(v);
                    return v;
                });
            },
            increment: (name, incrValueProducer, promise) => {
                return promise.then(v => {
                    collected.count[name] = incrValueProducer(v);
                    return v;
                });
            },
            timed: (name, promise) => {
                return timed(promise)
                    .then(([duration, result]) => {
                        collected.measure[`${name}.success_duration`] = duration;
                        return result;
                    })
                    .catch((err) => {
                        collected.measure[`${name}.error_duration`] = err.duration;
                        throw err.reason;
                    });
            }
        };
        return metrics;
    };
