import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
const Nexmo = require('nexmo');

admin.initializeApp();

const subject = 'Narozeninové přání';

const { api_key, api_secret } = functions.config().nexmo;

const nexmo = new Nexmo({
    apiKey: api_key,
    apiSecret: api_secret,
});

type User = {
    name?: string | null;
    port?: number | null;
    host?: string | null;
    email?: string | null;
    password?: string | null;
    transporter: nodemailer.Transporter;
};

export const checkAndSendEmails = functions
    .region('europe-west1')
    .pubsub.schedule('0 9 * * *')
    .timeZone('Europe/Prague')
    .onRun(async () => {
        const firestore = admin.firestore();
        const usersData: Record<string, User> = {};
        const today = new Date();
        const yesterday = new Date();
        const promisesToWait = [];
        const dataWaiting: Record<
            string,
            Promise<
                admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>
            >
        > = {};
        yesterday.setDate(yesterday.getDate() - 1);
        const people = await firestore
            .collection('people')
            .where('message', '>', '')
            .get();
        const peopleWithBirthday: admin.firestore.DocumentData[] = people.docs
            .map((pupil) => {
                const pupilData = pupil.data();
                const birthday = (pupilData.birthday as admin.firestore.Timestamp).toDate();
                birthday.setFullYear(today.getFullYear());
                if (birthday < today && birthday > yesterday) {
                    return pupilData;
                }
                return undefined;
            })
            .filter((p) => p) as admin.firestore.DocumentData[];
        if (peopleWithBirthday.length) {
            console.log(
                'Found some people with birthday',
                JSON.stringify(peopleWithBirthday)
            );
            for (const pupil of peopleWithBirthday) {
                if (pupil.message) {
                    console.log(
                        'Trying to send a message to ',
                        pupil.email || pupil.number
                    );
                    promisesToWait.push(
                        (async () => {
                            let userData = usersData[pupil.owner];
                            if (!userData) {
                                let user;
                                if (dataWaiting[pupil.owner]) {
                                    user = await dataWaiting[pupil.owner];
                                } else {
                                    console.log(
                                        'Does not have info about ',
                                        pupil.owner,
                                        'getting data ....'
                                    );
                                    dataWaiting[
                                        pupil.owner
                                    ] = firestore
                                        .collection('users')
                                        .doc(pupil.owner)
                                        .get();
                                    user = await dataWaiting[pupil.owner];
                                }
                                console.log('Got the data for', user.id);
                                userData = user.data() as User;
                                userData.transporter = nodemailer.createTransport(
                                    userData.host
                                        ? {
                                              // @ts-ignore
                                              host: userData.host,
                                              port: userData.port || 25,
                                              secure: false,
                                              auth: {
                                                  user: userData.email,
                                                  pass: userData.password,
                                              },
                                          }
                                        : {
                                              service: 'gmail',
                                              auth: {
                                                  user: userData.email,
                                                  pass: userData.password,
                                              },
                                          }
                                );
                                usersData[pupil.owner] = userData;
                            } else {
                                userData = usersData[pupil.owner];
                            }
                            if (pupil.email) {
                                console.log(
                                    'Trying to send an email to',
                                    pupil.email
                                );
                                await userData.transporter.sendMail({
                                    from: userData.email!,
                                    to: pupil.email,
                                    subject,
                                    text: pupil.message,
                                });
                                console.log(
                                    `Email to ${pupil.name} has been sent successfully`
                                );
                            } else if (pupil.number) {
                                console.log(
                                    'Trying to send an sms to',
                                    pupil.number
                                );
                                nexmo.message.sendSms(
                                    userData.name,
                                    `420${pupil.number}`,
                                    pupil.message,
                                    async (
                                        err: any,
                                        messageData: {
                                            messages: { [x: string]: string }[];
                                        }
                                    ) => {
                                        if (err) {
                                            console.log(err);
                                        } else if (
                                            messageData.messages[0][
                                                'status'
                                            ] === '0'
                                        ) {
                                            console.log(
                                                `Sms to ${pupil.name} has been sent successfully`
                                            );
                                        }
                                    }
                                );
                            }
                        })()
                    );
                }
            }
        }
        await Promise.all(promisesToWait);
    });

export const addUserToDb = functions
    .region('europe-west1')
    .auth.user()
    .onCreate((user) =>
        admin.firestore().runTransaction(
            async (transaction) =>
                await transaction.set(
                    admin.firestore().doc(`users/${user.uid}`),
                    {
                        name: user.displayName,
                        email: user.email,
                        password: '',
                    }
                )
        )
    );
