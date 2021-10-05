import csv from 'csv-parser'
import fs from 'fs'
import PQueue from 'p-queue';
import * as repository from './repository.js';
import * as zwangsversteigerung from './zwangsversteigerung.js';
import * as notifier from './notifier.js';
import logger from './logger.js';
import { getConfig } from './config.js';

const delay = time => new Promise(resolve => setTimeout(resolve, time));

const queue = new PQueue({concurrency: 32});
const enqueue = task => !terminating && queue.add(task);
let terminating = false;

const main = async () => {
    process.once('SIGINT', () => {
        terminating = true;
        queue.clear();
        repository.shutdown();
        logger.warn('SIGINT received. Aborting...')
    });

    const csvEntries = await loadCsv();

    while (!terminating) {
        for (const csvEntry of csvEntries) {
            enqueue(() => repeatUntilSuccessful(() => processCsvEntry(csvEntry)));
        }

        await queue.onEmpty();
        await delay(terminating ? 0 : (await getConfig()).delay_after_scrap_seconds * 1000);
    }
};

const processCsvEntry = async (csvEntry) => {
    logger.info(`Fetching entries for PLZ ${csvEntry.plz}`);
    for await (const item of zwangsversteigerung.listEntryUrls({query: csvEntry.plz})) {
        enqueue(() => repeatUntilSuccessful(async () => {
            if (await repository.hasEntry(item.uid)) {
                logger.info(`Item ${item.uid} is already in the database`);
                return;
            }

            logger.info(`Fetching details for item ${item.uid}`);
            const entry = await zwangsversteigerung.getEntry(item);
            repository.persistEntry(entry);
            notifier.notify(entry);
        }));
    }
};

const loadCsv = () => new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream('data/input.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
});

const repeatUntilSuccessful = async (callback) => {
    while (true) {
        try {
            await callback();
            break;
        } catch (error) {
            logger.error(error);
        }
    }
};

main();
