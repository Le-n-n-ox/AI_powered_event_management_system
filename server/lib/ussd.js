const EVENTS_PER_PAGE = 6;

function normalizePhoneNumber(value) {
    const raw = String(value || '').trim().replace(/[\s().-]/g, '');
    if (/^0[17]\d{8}$/.test(raw)) return `+254${raw.slice(1)}`;
    if (/^254[17]\d{8}$/.test(raw)) return `+${raw}`;
    if (/^\+254[17]\d{8}$/.test(raw)) return raw;
    if (/^\+?[1-9]\d{7,14}$/.test(raw)) return raw.startsWith('+') ? raw : `+${raw}`;
    return null;
}

function isEventAvailable(event, now) {
    if (!event || !['upcoming', 'ongoing'].includes(event.status)) return false;
    if (event.end_date && new Date(event.end_date).getTime() < now.getTime()) return false;
    if (event.registration_deadline && new Date(event.registration_deadline).getTime() < now.getTime()) return false;
    if (event.is_full) return false;
    if (event.is_paid && !(Number(event.ticket_price) > 0)) return false;
    return Boolean(event.id && String(event.name || '').trim());
}

function eventLabel(event) {
    const name = String(event.name).replace(/[\r\n]/g, ' ').trim().slice(0, 42);
    if (event.is_paid) return `${name} - KES ${Number(event.ticket_price || 0)}`;
    return name;
}

function createUssdHandler({
    listEvents,
    findRegistration,
    createRegistration,
    startPayment,
    sendSms,
    now = () => new Date(),
}) {
    if (![listEvents, findRegistration, createRegistration, startPayment, sendSms].every((dependency) => typeof dependency === 'function')) {
        throw new TypeError('USSD handler dependencies must be functions.');
    }

    return async function handleUssd({ text = '', phoneNumber, callbackUrl } = {}) {
        const input = String(text || '').trim();
        if (!input) {
            return 'CON Welcome to Women in Tech Help Desk\n1. Register for event\n2. Check schedule\n3. Find a location\n4. Emergency help';
        }

        const parts = input.split('*').map((part) => part.trim());
        if (parts[0] === '2' && parts.length === 1) {
            return 'END Schedule: Registration (Main Lobby) | Lunch: 1:00 PM (Courtyard)';
        }
        if (parts[0] === '3' && parts.length === 1) {
            return 'CON Select location:\n1. Registration / Lobby\n2. Hall B\n3. Courtyard';
        }
        if (parts[0] === '3' && parts.length === 2) {
            const locations = {
                '1': 'Registration is at the Main Lobby.',
                '2': 'Hall B is on the 2nd floor.',
                '3': 'Lunch is in the Courtyard.',
            };
            return locations[parts[1]] ? `END ${locations[parts[1]]}` : 'END Invalid location.';
        }
        if (parts[0] === '4' && parts.length === 1) {
            return 'END EMERGENCY: Security has been alerted and a voice call escalation has been triggered.';
        }
        if (parts[0] !== '1') return 'END Invalid option. Please start again.';

        const callerPhone = normalizePhoneNumber(phoneNumber);
        if (!callerPhone) return 'END We could not read your phone number. Please contact the event help desk.';

        let events;
        try {
            events = (await listEvents()).filter((event) => isEventAvailable(event, now()));
        } catch (error) {
            console.error('USSD event lookup failed:', error.message);
            return 'END Events are temporarily unavailable. Please try again later.';
        }

        let cursor = 1;
        let page = 0;
        while (parts[cursor] === '9') {
            page += 1;
            cursor += 1;
        }

        if (cursor === parts.length) {
            if (!events.length) return 'END There are no open events available for registration.';
            const start = page * EVENTS_PER_PAGE;
            const shown = events.slice(start, start + EVENTS_PER_PAGE);
            if (!shown.length) return 'END There are no more events to show.';

            const lines = shown.map((event, index) => `${index + 1}. ${eventLabel(event)}`);
            if (start + shown.length < events.length) lines.push('9. More events');
            lines.push('0. Cancel');
            return `CON Select an event to register:\n${lines.join('\n')}`;
        }

        if (parts[cursor] === '0' && cursor === parts.length - 1) return 'END Registration cancelled.';
        const selected = Number(parts[cursor]);
        cursor += 1;
        if (!Number.isInteger(selected) || selected < 1 || selected > EVENTS_PER_PAGE) {
            return 'END Invalid event selection. Please start again.';
        }

        const event = events[page * EVENTS_PER_PAGE + selected - 1];
        if (!event) return 'END That event is no longer available. Please start again.';

        if (cursor === parts.length) {
            return 'CON Enter your full name:';
        }

        const fullName = parts[cursor].trim().replace(/\s+/g, ' ');
        cursor += 1;
        if (fullName.length < 2 || fullName.length > 60 || !/\p{L}/u.test(fullName) || /[\r\n*]/.test(fullName)) {
            return 'END Please start again and enter a valid name (2-60 characters).';
        }

        if (cursor === parts.length) {
            const cost = event.is_paid ? ` The ticket costs KES ${Number(event.ticket_price || 0)}.` : '';
            return `CON Register ${fullName} for ${String(event.name).slice(0, 40)}?${cost}\n1. Confirm\n0. Cancel`;
        }

        if (parts[cursor] === '0') return 'END Registration cancelled.';
        if (parts[cursor] !== '1' || cursor !== parts.length - 1) {
            return 'END Invalid response. Please start again.';
        }

        if (event.is_paid && !(Number(event.ticket_price) > 0)) {
            return 'END This event has an invalid ticket price. Please contact the event organizer.';
        }

        let attendee;
        try {
            attendee = await findRegistration(event.id, callerPhone);
            if (attendee && (!event.is_paid || attendee.payment_status === 'paid')) {
                return 'END You are already registered for this event.';
            }
            if (!attendee) {
                attendee = await createRegistration({
                    event_id: event.id,
                    user_id: null,
                    full_name: fullName,
                    phone_number: callerPhone,
                    ...(event.is_paid ? { payment_status: 'unpaid' } : {}),
                });
            }
        } catch (error) {
            console.error('USSD registration save failed:', error.message);
            return 'END Registration could not be saved. Please try again later.';
        }

        if (!event.is_paid) {
            return `END Registration confirmed for ${fullName}. You can now use the event help desk from this phone.`;
        }

        try {
            const checkoutUrl = await startPayment(attendee, event, callerPhone, callbackUrl);
            await sendSms(callerPhone, `Pay ${event.name} (KES ${Number(event.ticket_price)}): ${checkoutUrl} Payment is confirmed after Paystack verifies it.`);
            return 'END Registration saved. Your Paystack test payment link was sent by SMS. Access is enabled after payment verification.';
        } catch (error) {
            console.error('USSD Paystack checkout failed:', error.message);
            return 'END Your registration is saved, but payment could not start. Please contact the event help desk.';
        }
    };
}

module.exports = { createUssdHandler, normalizePhoneNumber, isEventAvailable };
