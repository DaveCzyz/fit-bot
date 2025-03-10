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
    const sendLog = (e) => {
        try {
            Sentry.captureMessage(e, level);
        } catch (err) {
            console.warn(err);
        }
    }

    return {
        sendLog,
    }
}

module.exports = useSentry;
