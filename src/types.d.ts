import { PrismaClient } from "@prisma/client";
import "@sapphire/framework";

declare module "@sapphire/pieces" {
  interface Container {
    prisma: PrismaClient;
  }
}

export type ModalSchemaInput = {
  customId: string;
  label: string;
  style: TextInputStyle;
  minLength?: number;
  maxLength?: number;
  value?: string;
  required?: boolean;
};

export type ModalSchema<T extends string[] = [string]> = {
  id: string;
  title: string;
  inputs: {
    [K in T[number]]: ModalSchemaInput;
  };
};
