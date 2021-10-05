import { getConfig } from './config.js';
import * as mailer from './mailer.js';
import escapeHTML from 'escape-html';
import logger from './logger.js';

const notifyQueue = [];
let notifyTimeout = null;

const sendEmail = () => {
    const html = notifyQueue
        .map(entry => `
            <h2><a href="${entry.url}">${entry.plz_ort}</a></h2>
            <p>
                ${escapeHTML(entry.beschreibung)}
            </p>
        `)
        .join('');

    mailer.send({subject: 'New entries in Zwangsversteigerung', html});
    logger.info(`Sent email with ${notifyQueue.length} new entries`);

    notifyQueue.splice(0);
    notifyTimeout = null;
};

export const notify = async (entry) => {
    const config = await getConfig();

    if (notifyTimeout) {
        clearTimeout(notifyTimeout);
    }

    notifyQueue.push(entry);
    notifyTimeout = setTimeout(sendEmail, 1000 * config.notifier.delay_before_sending_email_seconds);
};
