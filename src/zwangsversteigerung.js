import axios from 'axios';
import cheerio from 'cheerio';
import logger from './logger.js';

const getRequest = async (url, params = {}) => {
    logger.debug('Starting request', {url, params});
    const response = await axios.get(url, {params, responseType: 'arraybuffer'});
    return response.data.toString('latin1');
};

export const listEntryUrls = async function *({query}) {
    const params = {
        sprache: 'DE',
        suchpage: '1',
        ergebnisZeigen: '1',
        q: query,
        art: '12345'
    };
    let request = getRequest('https://www.zwangsversteigerung.de/suche', params);

    while (true) {
        const $ = cheerio.load(await request);

        for (const item of $('.d_tab_objekte > a')) {
            const uidMatch = /\/detail\/(?<uid>.*)/.exec(item.attribs.href);
            if (!uidMatch) {
                logger.warn('Unable to find id for entry');
                continue;
            }

            yield {
                uid: uidMatch.groups.uid,
                url: `https://www.zwangsversteigerung.de${item.attribs.href}`,
            };
        }

        const nextPage = $('.detDatBox .page-browse.fw').attr('href');
        if (!nextPage) {
            break;
        }
        request = getRequest(`https://www.zwangsversteigerung.de${nextPage}`);
    }
};

const labelToKey = label => label
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_');

export const getEntry = async (listEntry) => {
    const $ = cheerio.load(await getRequest(listEntry.url));
    const data = {
        ...listEntry,
        'beschreibung': $('.ea_order h2').text().trim()
    };
    for (const tr of $('.detDatBox.zwei-spalten .detailTr')) {
        const label = $($(tr).find('.detailTd')[0]).text().trim();
        const key = labelToKey(label);
        if (!key) {
            continue;
        }

        const value = $($(tr).find('.detailTd')[1]).text().trim();
        data[key] = value;
    }

    return data;
};
