import React from 'react';
import { auth } from 'firebase/app';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    paper: {
        padding: theme.spacing(2),
    },
}));

const SignIn: React.FC = () => {
    const classes = useStyles();

    return (
        <Paper elevation={5} className={classes.paper}>
            <Button
                onClick={() =>
                    auth().signInWithPopup(new auth.GoogleAuthProvider())
                }
            >
                Přihlásit se pomocí Google
            </Button>
        </Paper>
    );
};

export default SignIn;
