export const pluralize = (input: string, count: number) => {
    return count === 1 ? input : `${input}s`;
};
