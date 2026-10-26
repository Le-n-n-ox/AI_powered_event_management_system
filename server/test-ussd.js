const test = require('node:test');
const assert = require('node:assert/strict');
const { createUssdHandler } = require('./lib/ussd');

const FREE_EVENT = {
    id: 'event-free',
    name: 'Community Design Day',
    status: 'upcoming',
    is_paid: false,
    start_date: '2030-06-15T09:00:00.000Z',
    end_date: '2030-06-15T17:00:00.000Z',
    registration_deadline: null,
    capacity: 100,
};

const PAID_EVENT = {
    ...FREE_EVENT,
    id: 'event-paid',
    name: 'Product Summit',
    is_paid: true,
    ticket_price: 500,
};

function createHarness(events = [FREE_EVENT]) {
    const registrations = [];
    const messages = [];
    const payments = [];
    const handler = createUssdHandler({
        listEvents: async () => events,
        findRegistration: async (eventId, phone) => registrations.find(
            (row) => row.event_id === eventId && row.phone_number === phone,
        ) || null,
        createRegistration: async (row) => {
            const created = { id: `attendee-${registrations.length + 1}`, ...row };
            registrations.push(created);
            return created;
        },
        startPayment: async (attendee, event) => {
            payments.push({ attendee, event });
            return 'https://checkout.paystack.test/authorize/abc';
        },
        sendSms: async (phone, message) => messages.push({ phone, message }),
        now: () => new Date('2030-06-01T12:00:00.000Z'),
    });

    return { handler, registrations, messages, payments };
}

test('first screen shows a short event list without the legacy help menu', async () => {
    const events = Array.from({ length: 8 }, (_, index) => ({
        ...FREE_EVENT,
        id: `event-${index + 1}`,
        name: `Community Event ${index + 1}`,
    }));
    const { handler } = createHarness(events);
    const response = await handler({ text: '', phoneNumber: '+254712345678' });

    assert.match(response, /Community Event 1/);
    assert.match(response, /Community Event 3/);
    assert.doesNotMatch(response, /Community Event 4/);
    assert.match(response, /9\. Next page/);
    assert.doesNotMatch(response, /Other help options|Check schedule|Emergency help/);
    assert.ok(response.length <= 160, `USSD screen too long: ${response.length} characters`);
});

test('long event names are readable in the list and full selection confirmation', async () => {
    const longName = 'Kenya Women in Technology and Digital Innovation Annual Forum 2026';
    const { handler } = createHarness([{ ...FREE_EVENT, name: longName }]);
    const menu = await handler({ text: '', phoneNumber: '+254712345678' });
    const confirmation = await handler({ text: '1*Jane Doe', phoneNumber: '+254712345678' });

    assert.ok(menu.replace(/\s+/g, ' ').includes(longName));
    assert.ok(confirmation.replace(/\s+/g, ' ').includes(longName));
    assert.ok(menu.length <= 160, `USSD screen too long: ${menu.length} characters`);
});

test('USSD registration menu lists current event names from the event source', async () => {
    const { handler } = createHarness([FREE_EVENT, PAID_EVENT]);
    const response = await handler({ text: '', phoneNumber: '+254712345678' });

    assert.match(response, /^CON /);
    assert.match(response, /Community Design Day/);
    assert.match(response, /Product Summit/);
    assert.doesNotMatch(response, /Women in Tech Hackathon/);
});

test('free event registration stores the caller phone number and entered name', async () => {
    const { handler, registrations } = createHarness();
    await handler({ text: '1*Jane Doe*1', phoneNumber: '+254712345678' });

    assert.equal(registrations.length, 1);
    assert.equal(registrations[0].event_id, FREE_EVENT.id);
    assert.equal(registrations[0].full_name, 'Jane Doe');
    assert.equal(registrations[0].phone_number, '+254712345678');
});

test('paid registration starts Paystack checkout and sends the hosted URL by SMS', async () => {
    const { handler, registrations, messages, payments } = createHarness([PAID_EVENT]);
    const response = await handler({ text: '1*Jane Doe*1', phoneNumber: '+254712345678' });

    assert.equal(registrations.length, 1);
    assert.equal(payments.length, 1);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].phone, '+254712345678');
    assert.match(messages[0].message, /https:\/\/checkout\.paystack\.test\/authorize\/abc/);
    assert.match(response, /^END /);
});

test('expired and cancelled events are excluded from the menu', async () => {
    const expired = { ...FREE_EVENT, id: 'expired', end_date: '2030-05-31T17:00:00.000Z' };
    const cancelled = { ...FREE_EVENT, id: 'cancelled', status: 'cancelled' };
    const { handler } = createHarness([FREE_EVENT, expired, cancelled]);
    const response = await handler({ text: '', phoneNumber: '+254712345678' });

    assert.match(response, /Community Design Day/);
    assert.doesNotMatch(response, /expired|cancelled/i);
});

test('pagination exposes every event and selections on later pages use the right event', async () => {
    const events = Array.from({ length: 7 }, (_, index) => ({
        ...FREE_EVENT,
        id: `event-${index + 1}`,
        name: `Community Event ${index + 1}`,
    }));
    const { handler, registrations } = createHarness(events);
    const firstPage = await handler({ text: '', phoneNumber: '0712345678' });
    const secondPage = await handler({ text: '9', phoneNumber: '0712345678' });
    const thirdPage = await handler({ text: '9*9', phoneNumber: '0712345678' });

    assert.match(firstPage, /Community Event 1/);
    assert.match(firstPage, /Community Event 3/);
    assert.match(secondPage, /Community Event 4/);
    assert.match(secondPage, /Community Event 6/);
    assert.match(thirdPage, /Community Event 7/);
    assert.doesNotMatch(thirdPage, /Next page/);

    const cancelled = await handler({ text: '9*9*1*Jane Doe*0', phoneNumber: '0712345678' });
    assert.match(cancelled, /^END Registration cancelled/);
    assert.equal(registrations.length, 0);
});

test('already-full events are omitted from registration choices', async () => {
    const fullEvent = { ...FREE_EVENT, id: 'full', name: 'Full Event', is_full: true };
    const { handler } = createHarness([FREE_EVENT, fullEvent]);
    const response = await handler({ text: '', phoneNumber: '+254712345678' });

    assert.match(response, /Community Design Day/);
    assert.doesNotMatch(response, /Full Event/);
});
