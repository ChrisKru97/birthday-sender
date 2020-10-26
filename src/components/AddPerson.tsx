import React from 'react';
import { firestore, auth } from 'firebase/app';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { KeyboardDatePicker } from '@material-ui/pickers';
import moment, { Moment } from 'moment';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Person } from './MessageModal';

const numberRe = /^(?:\+420)?([0-9]{9})$/;
const emailRe = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const defaultDate = moment('01-01-1990');

interface IProps {
    userToEdit?: Person;
    cancelUserEdit: () => void;
}

const AddPerson: React.FC<IProps> = ({ userToEdit, cancelUserEdit }) => {
    const [name, setName] = React.useState<string>();
    const [snack, setSnack] = React.useState<string>('');
    const [email, setEmail] = React.useState<string>('');
    const [street, setStreet] = React.useState<string>('');
    const [city, setCity] = React.useState<string>('');
    const [job, setJob] = React.useState<string>('');
    const [ZIP, setZIP] = React.useState<string>('');
    const [birthName, setBirthName] = React.useState<string>('');
    const [number, setNumber] = React.useState<string>('');
    const [loading, setLoading] = React.useState<boolean>(false);
    const [date, setDate] = React.useState<Moment | null>(defaultDate);
    const [baptism, setBaptism] = React.useState<Moment | null>(null);
    const [confirmation, setConfirmation] = React.useState<Moment | null>(null);
    const [wedding, setWedding] = React.useState<Moment | null>(null);

    const preparedNumber = number?.replace(/\s/g, '').match(numberRe)?.[1];

    React.useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setNumber(userToEdit.number);
            setStreet(userToEdit.street);
            setCity(userToEdit.city);
            setJob(userToEdit.job);
            setZIP(userToEdit.ZIP);
            setBirthName(userToEdit.birthName);
            if (userToEdit.birthday)
                setDate(moment(userToEdit.birthday.toMillis()));
            if (userToEdit.baptism)
                setBaptism(moment(userToEdit.baptism.toMillis()));
            if (userToEdit.confirmation)
                setConfirmation(moment(userToEdit.confirmation.toMillis()));
            if (userToEdit.wedding)
                setWedding(moment(userToEdit.wedding.toMillis()));
        }
    }, [userToEdit]);

    const enabledSubmit = React.useMemo<boolean>(
        () => !!(name && (emailRe.test(email) || preparedNumber)),
        [name, email, preparedNumber]
    );

    const onSubmit = React.useCallback(async () => {
        setLoading(true);
        const preparedUser = {
            name,
            birthday: date
                ? firestore.Timestamp.fromDate(date?.toDate())
                : undefined,
            message: '',
            email,
            number: preparedNumber ?? '',
            owner: auth().currentUser?.uid ?? '',
            street,
            city,
            ZIP,
            birthName,
            job,
            baptism: baptism
                ? firestore.Timestamp.fromDate(baptism?.toDate())
                : null,
            confirmation: confirmation
                ? firestore.Timestamp.fromDate(confirmation?.toDate())
                : null,
            wedding: wedding
                ? firestore.Timestamp.fromDate(wedding?.toDate())
                : null,
        };
        await (userToEdit
            ? firestore()
                  .collection('people')
                  .doc(userToEdit.id)
                  .update(preparedUser)
            : firestore().collection('people').add(preparedUser));
        setLoading(false);
        cancelUserEdit();
        setName('');
        setEmail('');
        setNumber('');
        setStreet('');
        setCity('');
        setJob('');
        setZIP('');
        setBirthName('');
        setDate(defaultDate);
        setBaptism(null);
        setConfirmation(null);
        setWedding(null);
    }, [
        street,
        city,
        ZIP,
        baptism,
        confirmation,
        wedding,
        birthName,
        job,
        cancelUserEdit,
        userToEdit,
        preparedNumber,
        name,
        date,
        setName,
        setDate,
        email,
        setNumber,
        setEmail,
    ]);

    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={0}
            onKeyPress={(e) =>
                e.key === 'Enter' && !loading && enabledSubmit && onSubmit()
            }
        >
            <Snackbar
                open={!!snack}
                autoHideDuration={3000}
                onClose={() => setSnack('')}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={() => setSnack('')}
                    severity="warning"
                >
                    {snack}
                </MuiAlert>
            </Snackbar>
            <TextField
                autoFocus
                margin="normal"
                error={name === ''}
                helperText={name === '' && 'Zadej jméno!'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                label="Jméno"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={email}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                label="E-mail"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                label="Telefonní číslo"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                label="Ulice"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                label="Město"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={ZIP}
                onChange={(e) => setZIP(e.target.value)}
                label="PSČ"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                label="Zaměstnání"
                variant="outlined"
            />
            <TextField
                margin="normal"
                value={birthName}
                onChange={(e) => setBirthName(e.target.value)}
                label="Rodné příjmení"
                variant="outlined"
            />
            <KeyboardDatePicker
                openTo="year"
                disableFuture
                autoOk
                views={['year', 'month', 'date']}
                margin="normal"
                onChange={setBaptism}
                value={baptism}
                inputVariant="outlined"
                label="Datum křtu"
                format="DD/MM/yyyy"
            />
            <KeyboardDatePicker
                openTo="year"
                disableFuture
                autoOk
                views={['year', 'month', 'date']}
                margin="normal"
                onChange={setConfirmation}
                value={confirmation}
                inputVariant="outlined"
                label="Datum konfirmace"
                format="DD/MM/yyyy"
            />
            <KeyboardDatePicker
                openTo="year"
                disableFuture
                autoOk
                views={['year', 'month', 'date']}
                margin="normal"
                onChange={setWedding}
                value={wedding}
                inputVariant="outlined"
                label="Datum svatby"
                format="DD/MM/yyyy"
            />
            <KeyboardDatePicker
                openTo="year"
                disableFuture
                autoOk
                views={['year', 'month', 'date']}
                margin="normal"
                onChange={setDate}
                value={date}
                inputVariant="outlined"
                label="Datum narození"
                format="DD/MM/yyyy"
            />
            <Button
                disabled={loading || !enabledSubmit}
                variant="outlined"
                color="primary"
                onClick={onSubmit}
            >
                {loading ? (
                    <CircularProgress />
                ) : userToEdit ? (
                    'Změň'
                ) : (
                    'Přidej'
                )}
            </Button>
        </Grid>
    );
};

export default AddPerson;
