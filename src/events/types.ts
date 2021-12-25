import { LeekClient } from "../LeekClient"

export type Handler = (client: LeekClient, ...args: any[]) => Promise<any> | any

export type EventHandler = {
    handler: Handler
}