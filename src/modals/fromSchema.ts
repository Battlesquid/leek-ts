import { objectKeys } from '@sapphire/utilities';
import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ModalSchema, ModalSchemaInput } from "types";

type ModalBuildMap = Required<{ [K in keyof ModalSchemaInput]: (b: TextInputBuilder, ...params: Parameters<TextInputBuilder[`set${Capitalize<K>}`]>) => void }>

const buildMap: ModalBuildMap = {
    customId: (b: TextInputBuilder, id: string) => { b.setCustomId(id); },
    label: (b: TextInputBuilder, label: string) => {
        b.setLabel(label)
    },
    style: (b: TextInputBuilder, style: TextInputStyle) => {
        b.setStyle(style)
    },
    minLength: (b: TextInputBuilder, minLength: number) => {
        b.setMinLength(minLength)
    },
    maxLength: (b: TextInputBuilder, maxLength: number) => {
        b.setMaxLength(maxLength)
    },
    value: (b: TextInputBuilder, value: string) => {
        b.setValue(value)
    },
    required: (b: TextInputBuilder, required?: boolean | undefined) => {
        b.setRequired(required)
    }
}

export const fromSchema = (schema: ModalSchema) => {
    const inputs = Object.keys(schema.inputs).map(k => {
        const b = new TextInputBuilder();
        const params = schema.inputs[k];
        // TODO figure out how to omit 'never' assertion
        objectKeys(params).forEach(pk => buildMap[pk](b, params[pk] as never));
        return new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(b);
    });
    return new ModalBuilder()
        .setCustomId(schema.id)
        .setTitle(schema.title)
        .addComponents(...inputs);
}