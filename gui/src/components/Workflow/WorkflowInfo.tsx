import { Workflow } from "@intutable/process-manager/dist/types"
import {
    Typography,
    Divider,
    FormControl,
    TextField,
    List,
    ListItem,
    ListItemText,
} from "@mui/material"

const WorkflowInfo = (props: {
    edit: boolean
    workflow: Workflow
    setWorkflow: (workflow: Workflow) => void
}) => {
    // --- Functions ---
    const handleChange = (evt: { target: { name: string; value: unknown } }) => {
        props.setWorkflow({
            ...props.workflow,
            [evt.target.name]: evt.target.value,
        })
    }
    return (
        <>
            <Typography variant={"h6"}>Allgemeines</Typography>
            <Divider />
            {props.edit ? (
                <FormControl fullWidth>
                    <TextField
                        sx={{ mt: 2, mx: 2 }}
                        label="Name"
                        variant="outlined"
                        name="name"
                        value={props.workflow.name}
                        onChange={handleChange}
                    />
                    <TextField
                        sx={{ mt: 2, mx: 2 }}
                        label="Beschreibung"
                        variant="outlined"
                        name="description"
                        value={props.workflow.description}
                        onChange={handleChange}
                    />
                    <TextField
                        type="number"
                        sx={{ mt: 2, mx: 2 }}
                        label="Besitzer"
                        variant="outlined"
                        name="owner"
                        value={props.workflow.owner}
                        onChange={handleChange}
                        size="small"
                    />
                </FormControl>
            ) : (
                <List>
                    <ListItem>
                        <ListItemText primary="Id" secondary={props.workflow._id} />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Name" secondary={props.workflow.name} />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Beschreibung"
                            secondary={props.workflow.description}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Status" secondary={props.workflow.state} />
                    </ListItem>
                </List>
            )}
        </>
    )
}

export default WorkflowInfo
