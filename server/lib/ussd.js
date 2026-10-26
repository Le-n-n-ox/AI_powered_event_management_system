const MAX_EVENTS_PER_PAGE = 3;
const MAX_MENU_CHARS = 160;
const EVENT_NAME_LINE_WIDTH = 30;

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

function cleanEventName(value) {
    return String(value || '').replace(/[\r\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

function wrapEventName(value, width = EVENT_NAME_LINE_WIDTH) {
    const words = cleanEventName(value).split(' ').filter(Boolean);
    const lines = [];
    let line = '';

    for (let word of words) {
        while (word.length > width) {
            if (line) {
                lines.push(line);
                line = '';
            }
            lines.push(word.slice(0, width));
            word = word.slice(width);
        }

        if (!line) {
            line = word;
        } else if (line.length + word.length + 1 <= width) {
            line += ` ${word}`;
        } else {
            lines.push(line);
            line = word;
        }
    }

    if (line) lines.push(line);
    return lines.length ? lines : ['(unnamed event)'];
}

function truncateAtWordBoundary(value, limit) {
    const name = cleanEventName(value);
    if (name.length <= limit) return name;
    const end = name.lastIndexOf(' ', limit - 1);
    return `${name.slice(0, end > 0 ? end : limit - 1).trim()}…`;
}

function formatEventLines(name, selection) {
    return wrapEventName(name).map((line, index) => index === 0 ? `${selection}. ${line}` : `   ${line}`);
}

function renderEventPage(pageItems, start, total) {
    const end = start + pageItems.length;
    const lines = [`Select event ${start + 1}-${end} of ${total}:`];
    pageItems.forEach((item, index) => lines.push(...formatEventLines(item.name, index + 1)));
    if (end < total) lines.push('9. Next page');
    lines.push('0. Cancel');
    return `CON ${lines.join('\n')}`;
}

function buildEventPages(events) {
    const pages = [];
    let start = 0;

    while (start < events.length) {
        const pageItems = [];
        while (pageItems.length < MAX_EVENTS_PER_PAGE && start + pageItems.length < events.length) {
            const event = events[start + pageItems.length];
            let item = { event, name: cleanEventName(event.name) };
            let candidate = [...pageItems, item];

            if (renderEventPage(candidate, start, events.length).length > MAX_MENU_CHARS) {
                if (pageItems.length) break;
                item = { event, name: truncateAtWordBoundary(event.name, 90) };
                candidate = [item];
                if (renderEventPage(candidate, start, events.length).length > MAX_MENU_CHARS) {
                    item = { event, name: truncateAtWordBoundary(event.name, 48) };
                    candidate = [item];
                }
            }

            pageItems.push(item);
        }

        pages.push({ start, items: pageItems });
        start += pageItems.length;
    }

    return pages;
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
        const parts = input ? input.split('*').map((part) => part.trim()) : [];

        if (input === '0') return 'END Event browsing cancelled.';

        let page = 0;
        let cursor = 0;
        while (parts[cursor] === '9') {
            page += 1;
            cursor += 1;
        }

        if (parts[cursor] === '0' && cursor === parts.length - 1) return 'END Event browsing cancelled.';
        if (!input || cursor === parts.length) {
            return showEvents(page);
        }

        const callerPhone = normalizePhoneNumber(phoneNumber);
        if (!callerPhone) return 'END We could not read your phone number. Please contact the event help desk.';

        const loaded = await loadEvents();
        if (typeof loaded === 'string') return loaded;
        const events = loaded;

        const selected = Number(parts[cursor]);
        cursor += 1;
        if (!Number.isInteger(selected) || selected < 1 || selected > MAX_EVENTS_PER_PAGE) {
            return 'END Invalid event selection. Please start again.';
        }

        const event = events[page * MAX_EVENTS_PER_PAGE + selected - 1];
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
            const confirmationLines = [`CON Register ${fullName} for:`];
            formatEventLines(event.name, 1).forEach((line) => confirmationLines.push(`   ${line}`));
            const cost = event.is_paid ? `The ticket costs KES ${Number(event.ticket_price || 0)}.` : '';
            confirmationLines.push('1. Confirm');
            confirmationLines.push('0. Cancel');
            if (cost) confirmationLines.push(cost);
            return confirmationLines.join('\n');
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

    async function loadEvents() {
        try {
            return (await listEvents()).filter((event) => isEventAvailable(event, now()));
        } catch (error) {
            console.error('USSD event lookup failed:', error.message);
            return 'END Events are temporarily unavailable. Please try again later.';
        }
    }

    async function showEvents(page) {
        const loaded = await loadEvents();
        if (typeof loaded === 'string') return loaded;
        const events = loaded;
        if (!events.length) return 'END No open events are available for registration right now.';

        const pages = buildEventPages(events);
        if (!pages.length) return 'END There are no more events to show.';
        if (page >= pages.length) page = pages.length - 1;
        const pageItems = pages[page].items;
        const start = pages[page].start + 1;
        const end = pages[page].start + pageItems.length;

        const lines = [`Select event ${start}-${end} of ${events.length}:`];
        pageItems.forEach((item, index) => lines.push(...formatEventLines(item.name, index + 1)));
        if (page < pages.length - 1) lines.push('9. Next page');
        lines.push('0. Cancel');
        return `CON ${lines.join('\n')}`;
    }
}

module.exports = { createUssdHandler, normalizePhoneNumber, isEventAvailable };
