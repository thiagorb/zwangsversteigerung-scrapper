import sqlite3 from 'sqlite3';
import fs from 'fs';

const database = (async () => {
    const databasePath = 'data/database.sqlite3';
    const databaseExists = await fs.promises.access(databasePath).then(() => true, () => false);
    const database = new sqlite3.Database(databasePath);
    if (!databaseExists) {
        initializeDatabase(database);
    }

    return database;
})();

const initializeDatabase = (database) => {
    database.exec(`
    CREATE TABLE immobilien(
        id INTEGER PRIMARY KEY,
        uid TEXT UNIQUE,
        url TEXT UNIQUE,
        beschreibung TEXT,
        plz_ort TEXT,
        strasse TEXT,
        kfz_kennzeichen TEXT,
        kreis TEXT,
        bundesland TEXT,
        objektart TEXT,
        verkehrswert TEXT,
        wiederholungstermin TEXT,
        termin TEXT,
        baujahr TEXT,
        grundstueck TEXT,
        wohn_und_nutzflaeche TEXT,
        weiteres TEXT
    );
    `);
}

export const persistEntry = async (entry) => {
    (await database).run(
        `
            INSERT INTO immobilien (
                uid,
                url,
                beschreibung,
                plz_ort,
                strasse,
                kfz_kennzeichen,
                kreis,
                bundesland,
                objektart,
                verkehrswert,
                wiederholungstermin,
                termin,
                baujahr,
                grundstueck,
                wohn_und_nutzflaeche,
                weiteres
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
            entry.uid,
            entry.url,
            entry.beschreibung,
            entry.plz_ort,
            entry.strasse,
            entry.kfz_kennzeichen,
            entry.kreis,
            entry.bundesland,
            entry.objektart,
            entry.verkehrswert,
            entry.wiederholungstermin,
            entry.termin,
            entry.baujahr,
            entry.grundstueck,
            entry.wohn_und_nutzflaeche,
            entry.weiteres,
        ],
    )
};

export const hasEntry = (uid) => new Promise(async (resolve, reject) => {
    (await database).get('SELECT 1 FROM immobilien WHERE uid = ?;', [uid], (error, result) => {
        if (error) {
            return reject(error);
        }

        resolve(!!result);
    });
});

export const shutdown = async () => (await database).close();
