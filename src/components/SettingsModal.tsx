import React from 'react';
import { firestore, auth } from 'firebase/app';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const SettingsModal: React.FC<{
    close: () => void;
    open: boolean;
}> = ({ close, open }) => {
    const [email, setEmail] = React.useState<string | undefined>();
    const [pass, setPass] = React.useState<string | undefined>();
    const [name, setName] = React.useState<string | undefined>();
    const [host, setHost] = React.useState<string | undefined>();
    const [port, setPort] = React.useState<number | undefined>();

    React.useEffect(() => {
        if (email === undefined && open) {
            const uid = auth().currentUser?.uid;
            firestore()
                .doc(`users/${uid}`)
                .get()
                .then((doc) => {
                    const data = doc.data();
                    if (data) {
                        setEmail(data['email']);
                        setPort(data['port']);
                        setHost(data['host']);
                        setName(data['name']);
                        setPass(data['password']);
                    }
                });
        }
    }, [setEmail, setPass, email, open]);

    const onSubmit = React.useCallback(() => {
        const uid = auth().currentUser?.uid;
        firestore()
            .doc(`users/${uid}`)
            .set({ email, password: pass, name, port, host })
            .then(close);
    }, [email, pass, close, name, host, port]);

    // TODO add time selector for time sending
    return (
        <Modal open={open} onClose={close}>
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
                    <TextField
                        label="Tvůj e-mail"
                        autoFocus
                        style={{
                            width: 'calc(100% - 40px)',
                            margin: '16px 20px',
                        }}
                        type="email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Tvoje jméno (SMS odesílatel)"
                        style={{
                            width: 'calc(100% - 40px)',
                            margin: '16px 20px',
                        }}
                        type="text"
                        helperText="Max 11 znaků"
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 11))}
                    />
                    <TextField
                        label="Tvoje heslo"
                        style={{
                            width: 'calc(100% - 40px)',
                            margin: '16px 20px',
                        }}
                        variant="outlined"
                        type="password"
                        value={pass}
                        onChange={(e) => setPass(e.target.value)}
                    />
                    <TextField
                        label="SMTP host?"
                        style={{
                            width: 'calc(100% - 40px)',
                            margin: '16px 20px',
                        }}
                        variant="outlined"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                    />
                    <TextField
                        label="Port?"
                        style={{
                            width: 'calc(100% - 40px)',
                            margin: '16px 20px',
                        }}
                        placeholder="25"
                        type="number"
                        variant="outlined"
                        value={port}
                        onChange={(e) => setPort(parseInt(e.target.value))}
                    />
                    <Button variant="outlined" onClick={onSubmit}>
                        Ulož
                    </Button>
                </Grid>
            </Paper>
        </Modal>
    );
};

export default SettingsModal;
