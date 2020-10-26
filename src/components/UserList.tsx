import React from 'react';
import { firestore, auth } from 'firebase/app';
import List from '@material-ui/core/List';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useCollection } from 'react-firebase-hooks/firestore';
import Modal from '@material-ui/core/Modal';
import MessageModal, { Person } from './MessageModal';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    popover: {
        padding: theme.spacing(2),
    },
    checkbox: {
        marginRight: theme.spacing(1),
    },
    popoverButton: {
        marginLeft: theme.spacing(1),
    },
}));

interface IProps {
    setUserToEdit: (user: Person) => void;
}

const UserList: React.FC<IProps> = ({ setUserToEdit }) => {
    const classes = useStyles();
    const [modal, setModal] = React.useState<Person | undefined>();
    const [selectedPupilName, setSelectedPupilName] = React.useState<
        string | undefined
    >();
    const [selectedPupilId, setSelectedPupilId] = React.useState<
        string | undefined
    >();
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
        null
    );
    const [value] = useCollection(
        firestore()
            .collection('people')
            .where('owner', '==', auth().currentUser?.uid)
    );

    const handleCancel = React.useCallback(() => {
        setAnchorEl(null);
        setSelectedPupilName(undefined);
        setSelectedPupilId(undefined);
    }, []);

    const handleDelete = React.useCallback(() => {
        handleCancel();
        firestore().collection('people').doc(selectedPupilId).delete();
    }, [handleCancel, selectedPupilId]);

    return (
        <>
            <Popover
                open={!!anchorEl}
                onClose={handleCancel}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <div className={classes.popover}>
                    Opravdu chceš smazat {selectedPupilName}?
                    <Button
                        onClick={handleDelete}
                        size="small"
                        variant="contained"
                        className={classes.popoverButton}
                        color="secondary"
                    >
                        Ano
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="outlined"
                        className={classes.popoverButton}
                        size="small"
                    >
                        Ne
                    </Button>
                </div>
            </Popover>
            <Modal open={!!modal} onClose={() => setModal(undefined)}>
                <MessageModal {...modal} close={() => setModal(undefined)} />
            </Modal>
            <Typography>Seznam lidí</Typography>
            <List className={classes.root}>
                {value?.docs?.map((value) => {
                    const person = {
                        ...(value.data() as Person),
                        id: value.id,
                    };
                    return (
                        <ListItem
                            key={value.id}
                            button
                            onClick={() => setModal(person)}
                        >
                            <ListItemText
                                primary={person.name}
                                secondary={((person.birthday as unknown) as firestore.Timestamp)
                                    .toDate()
                                    .toLocaleDateString('cs-CZ')}
                            />
                            <ListItemSecondaryAction>
                                <Checkbox
                                    className={classes.checkbox}
                                    disabled
                                    edge="end"
                                    checked={!!person.message}
                                />
                                <IconButton
                                    onClick={() => setUserToEdit(person)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton
                                    onClick={(e) => {
                                        setSelectedPupilName(person.name);
                                        setSelectedPupilId(person.id);
                                        setAnchorEl(e.currentTarget);
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    );
                })}
            </List>
        </>
    );
};

export default UserList;
