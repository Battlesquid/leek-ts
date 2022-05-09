import { pino } from "pino";

const transport = pino.transport({
    targets: [
        { 
            target: './pgtransport', 
            level: 'info', 
            options: {} 
        }
    ]
})

export default pino(transport)