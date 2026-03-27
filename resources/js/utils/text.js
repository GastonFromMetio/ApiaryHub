export function formatCountLabel(count, singular, plural = `${singular}s`) {
    const value = Number(count) || 0;

    return `${value} ${value > 1 || value === 0 ? plural : singular}`;
}
