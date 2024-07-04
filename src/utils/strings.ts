export const capitalize = (input: string) => {
    const [first, ...rest] = input;
    return `${first.toUpperCase()}${rest}`;
};
