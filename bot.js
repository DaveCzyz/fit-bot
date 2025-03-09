require('dotenv').config();

const useSentry = require('./sentry.js');
const dayjs = require('dayjs'); // https://day.js.org/docs/en/installation/installation
const axios = require('axios');

const { sendLog } = useSentry();

const RUN_BOT = dayjs().hour(7).minute(59).second(57);
const NEXT_DATE = dayjs().add(7, 'day').format('YYYY-MM-DD');
const URL = `https://aktywnylublin.eu/wp-admin/admin-ajax.php?action=wpamelia_api&call=/events&dates[]=${NEXT_DATE}&tag=Streching+i+Rolowanie&page=1&recurring=0`

const c_email = process.env.EMAIL;
const c_firstName = process.env.FIRSTNAME;
const c_lastName = process.env.LASTNAME;
const c_phone = process.env.PHONE;
let c_bookingStart; // np. "2023-09-28 18:30:00"
let c_bookingStartTime; // np. "18:30:00"
let name = "Streching i rolowanie";
let counter = 0;

const payload = {
    "bookings": [{
        "customFields": {
            1: {
                label: "Data urodzenia",
                type: "datepicker",
                value: "1980-01-01",
            },
            4: {
                label: "Oświadczenie",
                type: "checkbox",
                value: ["Zapoznałem się z regulaminem uczestnictwa w zajęciach w ramach projektu."],
            },
        },
        "customer": {
            "countryPhoneIso": "pl",
            "email": c_email,
            "externalId": null,
            "firstName": c_firstName,
            "id": null,
            "lastName": c_lastName,
            "phone": c_phone
        },
        "customerId": 0,
        "deposit": false,
        "extras": [],
        "persons": 1,
        "ticketsData": null,
        "utcOffset": null
    }],
    "componentProps": {
        "appointment": {
            "bookings": [{
                "customFields": {
                    1: {
                        label: "Data urodzenia",
                        type: "datepicker",
                        value: "1980-01-01",
                    },
                    4: {
                        label: "Oświadczenie",
                        type: "checkbox",
                        value: ["Zapoznałem się z regulaminem uczestnictwa w zajęciach w ramach projektu."],
                    },
                },
                "customer": {
                    "countryPhoneIso": "pl",
                    "email": c_email,
                    "externalId": null,
                    "firstName": c_firstName,
                    "id": null,
                    "lastName": c_lastName,
                    "phone": c_phone
                },
                "customerId": 0,
                "extras": [],
                "persons": 1
            }],
            "group": 0,
            "payment": {
                "amount": "0",
                "currency": "PLN",
                "gateway": "onSite"
            }
        },
        "bookable": {
            "aggregatedPrice": 1,
            "bookingStart": c_bookingStart,
            "bookingStartTime": c_bookingStartTime,
            "color": "#1788FB",
            "depositData": null,
            "id": null, // event_id
            "maxCapacity": 16,
            "name": name,
            "price": 0,
            "ticketsData": null
        },
        "bookableType": "event",
        "containerId": "amelia-app-booking0",
        "dialogClass": "am-confirm-booking-events-list",
        "hasCancel": 0,
        "hasHeader": 0,
        "phonePopulated": 0,
        "queryParams": {
            "dates": [], // c_today
            "id": null,
            "locationId": null,
            "page": 1,
            "providers": null,
            "recurring": 0,
            "tag": name
        },
        "recurringData": [],
        "trigger": "",
        "useGlobalCustomization": 0
    },
    "couponCode": "",
    "eventId": null, // event_id
    "locale": "pl_PL",
    "payment": {
        "amount": "0",
        "currency": "PLN",
        "gateway": "onSite"
    },
    "recaptcha": false,
    "returnUrl": "https://aktywnylublin.eu/zajecia/streching-i-rolowanie/",
    "timeZone": "Europe/Warsaw",
    "type": "event"
}

let confirm_counter = 0;
const callConfirmation = async (paymentId) => {
    if (confirm_counter >= 10) return false;

    confirm_counter++;
    console.log(`Oczekiwanie na potwierdzenie. Próba nr: ${confirm_counter}`);

    try {
        await axios.post(
            `https://aktywnylublin.eu/wp-admin/admin-ajax.php?action=wpamelia_api&call=/bookings/success/${paymentId}`,
            {
                "appointmentStatusChanged": false,
                "packageCustomerId": null,
                "paymentId": paymentId,
                "type": "event"
            },
            {
                headers: { 'Content-Type': 'application/json;charset=utf-8'}
            }
        ).then(response => {
            console.log(response.data?.message);
            console.log('Rejestracja została potwierdzona. Można zamknąć okno. Miłego treningu!');
            return true;
        }).catch(e => {
            console.log(e);
            setTimeout(() => {
                callConfirmation();
            }, 300);
        });
    } catch (e) {
        console.log('Error callConfirmation:', e);
        sendLog(`Error callConfirmation: ${e}`);
    }
};

const REGISTER_URL = 'https://aktywnylublin.eu/wp-admin/admin-ajax.php?action=wpamelia_api&call=/bookings';
let register_counter = 0;
const callRegister = async () => {
    if (register_counter >= 10) return false;

    register_counter++;
    console.log(`Wydarzenie otwarte. Próba rejestracji nr: ${register_counter}`);

    try {
        await axios.post(
            REGISTER_URL,
            payload,
            {
                headers: { 'Content-Type': 'application/json;charset=utf-8'}
            }
        ).then(async response => {
            const paymentId = response.data?.data.paymentId;
            await callConfirmation(paymentId);
            return true;
        }).catch(e => {
            console.log(e.response.data);
            setTimeout(() => {
                callRegister();
            }, 300);
        });
    } catch (e) {
        console.log('Error callRegister:', e.message);
        sendLog(`Error callRegister: ${e}`);
    }
};

const callAsync = async () => {
    if (counter >= 100) return false;

    counter++;
    console.log(`Próba numer: ${counter}`);

    try {
        const response = await axios.get(URL);
        const event = response.data?.data?.events[0];

        if (event?.opened && !event?.full) {
            const today = dayjs().format('YYYY-MM-DD');
            payload.componentProps.queryParams.dates.push(today);

            const event_id = event.id;
            payload.componentProps.bookable.id = event_id;
            payload.eventId = event_id;

            const time = event.periods[0].periodStart;
            payload.componentProps.bookable.bookingStart = time;
            payload.componentProps.bookable.bookingStartTime = time.split(' ')[1];

            payload.componentProps.bookable.maxCapacity = event.maxCapacity;

            await callRegister();
            return true;
        } else if (event?.full) {
            console.log('Lista jest pełna. Zamknij okno.');
            return false;
        } else {
            setTimeout(() => {
                callAsync();
            }, 300);
        }
    } catch (error) {
        console.error('Error callAsync:', error);
        sendLog(`Error callAsync: ${error}`);
    }
}

const coundown = () => {
    const now = dayjs();
    if (now.isAfter(RUN_BOT)) {
        clearInterval(interval);
        callAsync();
    } else {
        console.log(`Start za...${RUN_BOT.diff(now, 's')}`);
    }
}

let interval;

console.log('Uruchamianie bota...');
console.log(`Zapisy dnia: ${NEXT_DATE}`);
interval = setInterval(() => {
    coundown();
}, 1000);
