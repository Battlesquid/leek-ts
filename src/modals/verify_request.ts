import { TextInputStyle } from "discord.js";
import { ModalSchema } from "types";
import { fromSchema } from "@modals";

const MAX_TEAM_LENGTH = 7;
export const MAX_NICK_LENGTH = 32 - MAX_TEAM_LENGTH - " | ".length;

const schema: ModalSchema<["name", "team"]> = {
    id: "verify_request",
    title: "Verification Request",
    inputs: {
        name: {
            customId: "name",
            label: "Name",
            style: TextInputStyle.Short,
            minLength: 1,
            maxLength: MAX_NICK_LENGTH
        },
        team: {
            customId: "team",
            label: "Team",
            style: TextInputStyle.Short,
            minLength: 1,
            maxLength: MAX_TEAM_LENGTH
        }
    }
};

export const verifyModal = {
    schema,
    modal: fromSchema(schema)
}
