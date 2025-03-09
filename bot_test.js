const dayjs = require('dayjs'); // https://day.js.org/docs/en/installation/installation
const axios = require('axios');

const c_email = "dawczyz@poczta.fm";
const c_firstName = "Daniel";
const c_lastName = "Kapibara";
const c_phone = "+48500123323";
let c_bookingStart; // np. "2023-09-28 18:30:00"
let c_bookingStartTime; // np. "18:30:00"
let name = "Samoobrona";
let counter = 0;

const RUN_BOT = dayjs().hour(7).minute(59).second(57);
const NEXT_DATE = dayjs().add(7, 'day').format('YYYY-MM-DD');
const URL = `https://aktywnylublin.eu/wp-admin/admin-ajax.php?action=wpamelia_api&call=/events&dates[]=${NEXT_DATE}&tag=${name}&page=1&recurring=0`

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
    "returnUrl": `https://aktywnylublin.eu/zajecia/${name}/`,
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
            }, 200);
        });
    } catch (e) {
        console.log('Error callConfirmation:', e);
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
    }
};

const event_response =  {
    "id": 4186,
    "name": "Samoobrona",
    "description": "",
    "color": "#1788FB",
    "price": 0,
    "deposit": 0,
    "depositPayment": "disabled",
    "depositPerPerson": true,
    "pictureFullPath": null,
    "pictureThumbPath": null,
    "extras": [],
    "coupons": [],
    "position": null,
    "settings": "{\"payments\":{\"paymentLinks\":{\"enabled\":false,\"changeBookingStatus\":false,\"redirectUrl\":null},\"onSite\":true,\"payPal\":{\"enabled\":false},\"stripe\":{\"enabled\":false},\"mollie\":{\"enabled\":false},\"razorpay\":{\"enabled\":false}},\"general\":{\"minimumTimeRequirementPriorToCanceling\":null,\"redirectUrlAfterAppointment\":null},\"zoom\":{\"enabled\":false},\"lessonSpace\":{\"enabled\":false}}",
    "fullPayment": false,
    "bookings": [],
    "periods": [
        {
            "id": 4321,
            "eventId": 4186,
            "periodStart": "2024-05-17 18:30:00",
            "periodEnd": "2024-05-17 20:00:00",
            "zoomMeeting": null,
            "lessonSpace": null,
            "bookings": [],
            "googleCalendarEventId": null,
            "googleMeetUrl": null,
            "outlookCalendarEventId": null
        }
    ],
    "bookingOpens": "2024-05-10 08:00:00",
    "bookingCloses": "2024-05-17 15:30:00",
    "bookingOpensRec": "calculate",
    "bookingClosesRec": "calculate",
    "ticketRangeRec": "calculate",
    "status": "approved",
    "recurring": {
        "cycle": "weekly",
        "order": 16,
        "until": "2024-05-31 00:00:00",
        "cycleInterval": 1,
        "monthlyRepeat": "each",
        "monthDate": null,
        "monthlyOnRepeat": null,
        "monthlyOnDay": null
    },
    "maxCapacity": 16,
    "maxCustomCapacity": null,
    "show": true,
    "tags": [
        {
            "id": 32031,
            "eventId": 4186,
            "name": "Aktywny Lublin"
        },
        {
            "id": 32032,
            "eventId": 4186,
            "name": "Budżet Obywatelski "
        },
        {
            "id": 32033,
            "eventId": 4186,
            "name": "Samobrona"
        }
    ],
    "customTickets": [],
    "gallery": [
        {
            "id": 9861,
            "entityId": 4186,
            "entityType": "event",
            "pictureFullPath": "https://aktywnylublin.eu/wp-content/uploads/prateek-katyal-FNMztJegsSA-unsplash-scaled.jpg",
            "pictureThumbPath": "https://aktywnylublin.eu/wp-content/uploads/prateek-katyal-FNMztJegsSA-unsplash-480x360.jpg",
            "position": 1
        }
    ],
    "providers": [
        {
            "id": 17,
            "firstName": "Aktywny",
            "lastName": "Lublin",
            "birthday": null,
            "email": "m.wozniak@aktywnylublin.eu",
            "phone": "",
            "type": "provider",
            "status": null,
            "note": null,
            "zoomUserId": null,
            "countryPhoneIso": null,
            "externalId": null,
            "pictureFullPath": null,
            "pictureThumbPath": null,
            "translations": null,
            "weekDayList": [],
            "serviceList": [],
            "dayOffList": [],
            "specialDayList": [],
            "locationId": null,
            "googleCalendar": null,
            "outlookCalendar": null,
            "timeZone": null,
            "description": null
        }
    ],
    "notifyParticipants": "1",
    "locationId": 18,
    "location": null,
    "customLocation": null,
    "parentId": 3879,
    "created": "2024-04-17 11:15:09",
    "zoomUserId": null,
    "organizerId": 17,
    "type": "event",
    "bringingAnyone": false,
    "bookMultipleTimes": false,
    "translations": null,
    "customPricing": false,
    "closeAfterMin": null,
    "closeAfterMinBookings": false,
    "maxExtraPeople": null,
    "initialEventStart": null,
    "initialEventEnd": null,
    "bookable": true,
    "cancelable": true,
    "opened": true,
    "closed": false,
    "places": 6,
    "upcoming": false,
    "full": false
};

const callAsync = async () => {
    if (counter >= 100) return false;

    counter++;
    console.log(`Próba numer: ${counter}`);

    try {
        // const response = await axios.get(URL);
        const event = event_response;

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
    }
}

const coundown = () => {
    console.log('Start');
    clearInterval(interval);
    callAsync();
}

let interval;

console.log('Uruchamianie bota...');
interval = setInterval(() => {
    console.log(`Zapisy dnia: ${NEXT_DATE}`);
    coundown();
}, 1000);
