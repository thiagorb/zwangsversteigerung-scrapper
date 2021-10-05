import winston from 'winston';
import { MESSAGE } from 'triple-beam';

const colorizer = winston.format.colorize();
colorizer.addColors({
    date: 'blue',
});

export default winston.createLogger({
    level: process.env.NODE_ENV !== 'production' ? 'debug': 'info',
    transports: [
        new winston.transports.Console({
            colorize: true,
            timestamp: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                winston.format.printf(info => `[${colorizer.colorize('date', new Date())}] ${info[MESSAGE]}`)
            ),
        }),
    ],
});
