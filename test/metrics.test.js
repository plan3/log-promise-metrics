'use strict';

const metricsFactory = require('../index.js');

const assert = require('chai').assert;
const sinon = require('sinon');

describe('Metrics collector', () => {
    it('Will log timed promise success duration as histogram', () => {
        const logSpy = sinon.spy();
        const metrics = metricsFactory(logSpy)('baseName');
        return metrics.timed('someName', Promise.resolve())
            .then(() => metrics.dropToLogs())
            .then(() => assert.isTrue(/measure#baseName.someName.success_duration=\d+/.test(logSpy.args[0][0])));
    });

    it('Will log timed promise error duration as histogram', () => {
        const logSpy = sinon.spy();
        const metrics = metricsFactory(logSpy)('baseName');
        return metrics.timed('someName', Promise.reject('this is broken'))
            .catch(() => metrics.dropToLogs())
            .then(() => assert.isTrue(/measure#baseName.someName.error_duration=\d+/.test(logSpy.args[0][0])));
    });

    it('Will log histogram of given sample from promise', () => {
        const logSpy = sinon.spy();
        const metrics = metricsFactory(logSpy)('baseName');
        return metrics.measure('someName', v => v, Promise.resolve(1))
            .then(() => metrics.dropToLogs())
            .then(() =>
                assert.isTrue(/measure#baseName.someName=1/.test(logSpy.args[0][0])));
    });

    it('Will log increment of count metric from promise', () => {
        const logSpy = sinon.spy();
        const metrics = metricsFactory(logSpy)('baseName');
        return metrics.increment('someName', v => v, Promise.resolve(1))
            .then(() => metrics.dropToLogs())
            .then(() => assert.isTrue(/count#baseName.someName=1/.test(logSpy.args[0][0])));
    });

    it('Will log sample metric from promise', () => {
        const logSpy = sinon.spy();
        const metrics = metricsFactory(logSpy)('baseName');
        return metrics.sample('someName', v => v, Promise.resolve(1))
            .then(() => metrics.dropToLogs())
            .then(() => assert.isTrue(/sample#baseName.someName=1/.test(logSpy.args[0][0])));
    });

    it('Will log multiple metrics from promise', () => {
        const logSpy = sinon.spy();
        const metrics = metricsFactory(logSpy)('baseName');
        const promise1 = metrics.sample('someName', v => v, Promise.resolve(1));
        const promise2 = metrics.measure('someOtherName', v => v, promise1);
        return metrics.timed('timedPromise', promise2)
            .then(() => metrics.dropToLogs())
            .then(() =>
                assert.isTrue(/sample#baseName.someName=1/.test(logSpy.args[0][0]))
                && assert.isTrue(/measure#baseName.someOtherName=1/.test(logSpy.args[0][0]))
                && assert.isTrue(/measure#baseName.timedPromise.success_duration=\d+/.test(logSpy.args[0][0]))
            );
    });
});
