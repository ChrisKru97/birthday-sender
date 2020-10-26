import React from 'react';
import { auth } from 'firebase/app';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import UserList from './components/UserList';
import AddPerson from './components/AddPerson';
import CircularProgress from '@material-ui/core/CircularProgress';
import SignIn from './SignIn';
import Fab from '@material-ui/core/Fab';
import SettingsModal from './components/SettingsModal';
import { Person } from './components/MessageModal';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    margin: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
    },
    button: {
        marginRight: theme.spacing(1),
    },
    grid: {
        padding: 30,
        minHeight: '100vh',
        width: '100%',
        margin: '0 auto',
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
        maxHeight: 'calc(100vh - 108px)',
        overflow: 'auto',
    },
}));

const App: React.FC = () => {
    const classes = useStyles();
    const [logged, setLogged] = React.useState<boolean | undefined>();
    const [settings, setSettings] = React.useState<boolean>(false);
    const [userToEdit, setUserToEdit] = React.useState<Person | undefined>();

    React.useEffect(() => {
        if (logged === undefined) {
            auth().onAuthStateChanged((e) => setLogged(!!e));
        }
    }, [setLogged, logged]);

    return (
        <div className={classes.root}>
            <SettingsModal close={() => setSettings(false)} open={settings} />
            <Grid
                className={classes.grid}
                container
                direction="row"
                justify="space-around"
                alignItems="center"
                spacing={4}
            >
                {logged === undefined ? (
                    <CircularProgress />
                ) : logged ? (
                    <>
                        <Grid item xs>
                            <Paper elevation={5} className={classes.paper}>
                                <UserList setUserToEdit={setUserToEdit} />
                            </Paper>
                        </Grid>
                        <Grid item xs>
                            <Paper className={classes.paper} elevation={5}>
                                <AddPerson
                                    userToEdit={userToEdit}
                                    cancelUserEdit={() =>
                                        setUserToEdit(undefined)
                                    }
                                />
                            </Paper>
                        </Grid>
                        <div className={classes.margin}>
                            <Fab
                                variant="extended"
                                size="medium"
                                color="secondary"
                                className={classes.button}
                                onClick={() => setSettings(true)}
                            >
                                Nastavení
                            </Fab>
                            <Fab
                                variant="extended"
                                size="medium"
                                color="primary"
                                onClick={() => auth().signOut()}
                            >
                                Odhlásit se
                            </Fab>
                        </div>
                    </>
                ) : (
                    <SignIn />
                )}
            </Grid>
        </div>
    );
};

export default App;
