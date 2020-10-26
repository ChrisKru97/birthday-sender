import React from 'react';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import { firestore } from 'firebase/app';
import Grid from '@material-ui/core/Grid';

export type Person = {
    message?: string;
    email: string;
    number: string;
    birthday: firestore.Timestamp | null;
    baptism: firestore.Timestamp | null;
    confirmation: firestore.Timestamp | null;
    wedding: firestore.Timestamp | null;
    name: string;
    street: string;
    city: string;
    job: string;
    ZIP: string;
    birthName: string;
    id: string;
};

const MessageModal: React.FC<Partial<Person> & { close: () => void }> = ({
    message: oldMessage,
    id,
    name,
    close,
}) => {
    const [message, setMessage] = React.useState<string>(oldMessage ?? '');

    const onSubmit = React.useCallback(
        () =>
            firestore().runTransaction(async (transaction) => {
                await transaction.update(firestore().doc(`people/${id}`), {
                    message,
                });
                close();
            }),
        [id, message, close]
    );

    return (
        <Paper
            elevation={5}
            style={{
                padding: 30,
                width: '40%',
                minWidth: 400,
                margin: '10vh auto',
            }}
        >
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={0}
            >
                {name}
                <TextField
                    label="Zpráva"
                    autoFocus
                    style={{ width: 'calc(100% - 40px)', margin: '16px 20px' }}
                    variant="outlined"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    rows={6}
                />
                <Button variant="outlined" onClick={onSubmit}>
                    Změň
                </Button>
            </Grid>
        </Paper>
    );
};

export default MessageModal;
