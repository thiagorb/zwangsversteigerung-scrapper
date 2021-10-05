export default {
    delay_after_scrap_seconds: 10,
    notifier: {
        delay_before_sending_email_seconds: 60
    },
    mailer: {
        transporters: [
            {
                type: 'smtp',
                enabled: false,
                from: '"Vorname Nachname" <email@example.org>',
                to: '"Vorname Nachname" <email@example.org>',
                params: {
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: 'email@example.org',
                        pass: 'abcdabcdabcdabcd'
                    }
                }
            },
            {
                type: 'sendmail',
                enabled: true,
                from: '"Zwangsversteigerung Scrapper" <email@example.org>',
                to: '"Zwangsversteigerung Scrapper" <email@example.org>',
                params: {
                    sendmail: true,
                    newline: 'unix',
                    path: '/usr/sbin/sendmail'
                }
            }
        ]
    }
};
