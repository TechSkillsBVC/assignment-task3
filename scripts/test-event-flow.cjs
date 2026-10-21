const assert = require('node:assert/strict');

const getFutureEvents = (events, now) =>
    events.filter(({ dateTime }) => {
        const parsed = new Date(dateTime);
        return !Number.isNaN(parsed.getTime()) && parsed.getTime() > now.getTime();
    });

const isPositiveWholeNumber = (value) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0;
};

const now = new Date('2026-10-20T12:00:00.000Z');
const events = [
    { id: 'past', dateTime: '2026-10-19T12:00:00.000Z' },
    { id: 'future', dateTime: '2026-10-21T12:00:00.000Z' },
    { id: 'invalid', dateTime: 'not-a-date' },
];

assert.deepEqual(getFutureEvents(events, now).map(({ id }) => id), ['future']);
assert.equal(isPositiveWholeNumber('4'), true);
assert.equal(isPositiveWholeNumber('0'), false);
assert.equal(isPositiveWholeNumber('-1'), false);
assert.equal(isPositiveWholeNumber('1.5'), false);
assert.equal(isPositiveWholeNumber('abc'), false);

console.log('Event flow tests passed.');
