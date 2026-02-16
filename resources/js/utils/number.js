export function parseNumber(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const num = Number(value);

    return Number.isNaN(num) ? null : num;
}
