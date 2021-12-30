export const patterns = {
    EMOJI_REGEX: /^<?(a)?:?(?<name>\w{2,32}):(?<id>\d{17,19})>?$/,
    URL_REGEX: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
    VERIFY_REGEX: /(?<nick>.+?)\s?[|,｜\s]\s?(?:(?<vrc_team>(?:(?<number>[0-9]{2,5})(?<letter>[A-Z])))|(?<vexu_team>[A-Z]{2,5}[0-9]?))/
}