import { Collection } from "discord.js";
import { CommandExec, CommandStructure } from "../types";

export type SlashCommandCollection = Collection<string, CommandStructure>
export type MessageCommandCollection = Collection<string, CommandStructure>
export type UserCommandCollection = Collection<string, CommandStructure>
export type ExecutableCollection = Collection<string, CommandExec>
