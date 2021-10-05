import fs from 'fs';

export const getConfig = async () => {
    const configExamplePath = new URL('../config.example.js', import.meta.url);
    const configPath = new URL('../config.js', import.meta.url);

    if (!await fs.promises.access(configPath).then(() => true, () => false)) {
        await fs.promises.copyFile(configExamplePath, configPath);
    }

    return (await import(configPath)).default;
};
