import nodemailer from 'nodemailer';
import { getConfig } from './config.js';
import cheerio from 'cheerio';

export const send = async ({subject, html}) => {
    const config = await getConfig();

    for (const transportConfig of config.mailer.transporters) {
        if (!transportConfig.enabled) {
            continue;
        }

        nodemailer.createTransport(transportConfig.params).sendMail({
            from: transportConfig.from,
            to: transportConfig.to,
            subject,
            text: cheerio.load(html).text(),
            html,
        });
    }
};
