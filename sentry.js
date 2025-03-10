require('dotenv').config();

const Sentry = require('@sentry/browser');

Sentry.init({
    dsn: process.env.SENTRY_DNS,
    integrations: [
        Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 1.0,
});

const useSentry = (level = 'warning') => {
    const sendLog = async (e) => {
        return new Promise((resolve, reject) => {
            try {
                const log = Sentry.captureMessage(e, level);
                resolve(`Error log: ${log}`);
            } catch (error) {
                reject(error);
            }
        });
    }

    return {
        sendLog,
    }
}

module.exports = useSentry;
