export function formatPhoneNumber(phone) {
    const clean = phone.trim().replace(/\s+/g, "");
    if (clean.startsWith("0"))
        return "+254" + clean.substring(1);
    if (clean.startsWith("254"))
        return "+" + clean;
    return clean;
}
