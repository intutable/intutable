import CloseIcon from "@mui/icons-material/Close"
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography,
    Grid,
} from "@mui/material"
import { NO_INPUT_MASK_DEFAULT, useRowMask } from "context/RowMaskContext"
import { useView } from "hooks/useView"
import React, { useDebugValue, useEffect, useState } from "react"
import { ColumnUtility } from "utils/column utils/ColumnUtility"
import { InputMaskSelect } from "./InputMaskSelect"
import { AddColumnButton, AddLinkButton } from "./DialogActions"
import { RowMaskColumn } from "./Column"
import { RowMaskContextMenu } from "./ContextMenu"
import { RowNavigator } from "./RowNavigator"
import { useInputMask } from "hooks/useInputMask"
import { CommentSection } from "./Comments"
import { useTheme } from "@mui/material/styles"
import { AddRow } from "@datagrid/Toolbar/ToolbarItems"
import { Column } from "types/tables/rdg"
import { UserPrimaryKeyColumn } from "./UserPrimaryKeyColumn"
import { ColumnGroup } from "@shared/input-masks/types"
import { MakeInputMaskColumns } from "./MakeInputMaskColumns"

export const RowMask: React.FC = () => {
    const theme = useTheme()
    const { data } = useView()
    const { rowMaskState, setRowMaskState, selectedInputMask } = useRowMask()
    const usesInputMask = selectedInputMask !== NO_INPUT_MASK_DEFAULT

    const [commentsVisible, setCommentsVisible] = useState<boolean>(false)
    useEffect(() => {
        // no comment section for default mask
        if (usesInputMask === false) setCommentsVisible(false)
    }, [usesInputMask])

    const abort = () => setRowMaskState({ mode: "closed" })

    if (data == null) return null

    const nonHidden = data.columns.filter(column => column.hidden !== true)
    const userPrimaryKeyColumn = nonHidden.find(column => column.isUserPrimaryKey === true)
    const columns = nonHidden.filter(column => column.isUserPrimaryKey === false).sort(ColumnUtility.sortByIndex)

    return (
        <Dialog open={rowMaskState.mode !== "closed"} fullWidth onClose={abort} keepMounted>
            <DialogTitle>
                <Stack
                    direction="row"
                    sx={{
                        alignItems: "center",
                    }}
                >
                    {rowMaskState.mode === "edit" && <RowNavigator />}
                    <Typography sx={{ ml: 2 }}>
                        {rowMaskState.mode === "create"
                            ? "Neue Zeile erstellen"
                            : rowMaskState.mode === "edit"
                            ? `Zeile ${rowMaskState.row.index}`
                            : ""}
                    </Typography>

                    <Box flexGrow={1} />

                    <InputMaskSelect />
                    <RowMaskContextMenu
                        commentsVisible={commentsVisible}
                        toggleCommentsVisible={() => setCommentsVisible(prev => !prev)}
                    />
                    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} variant="middle" />
                    <CloseIcon onClick={abort} fontSize="small" sx={{ cursor: "pointer" }} />
                </Stack>
            </DialogTitle>

            <Divider />

            <DialogContent>
                <Grid container spacing={0}>
                    {/* columns */}
                    <Grid item xs={commentsVisible ? 8 : 12}>
                        <Box
                            sx={{ overflowY: "scroll", maxHeight: "70vh", minHeight: "70vh", height: "70vh", width: 1 }}
                        >
                            {userPrimaryKeyColumn && <UserPrimaryKeyColumn column={userPrimaryKeyColumn} />}
                            {/* without grouping */}
                            {usesInputMask === false &&
                                columns.map(column => <RowMaskColumn column={column} key={column.id} />)}
                            {/* with grouping through factory component */}
                            {usesInputMask === true && <MakeInputMaskColumns columns={columns} />}
                        </Box>
                    </Grid>

                    {/* comment section */}
                    {commentsVisible && (
                        <Grid item xs={4}>
                            <Stack
                                sx={{
                                    maxHeight: "70vh",
                                    minHeight: "70vh",
                                    height: "70vh",
                                    width: 1,
                                }}
                                direction="row"
                            >
                                <Divider orientation="vertical" sx={{ mx: 2 }} />
                                <CommentSection />
                            </Stack>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>

            <Divider />

            <DialogActions
                sx={{
                    justifyContent: "space-evenly",
                }}
            >
                <AddRow />
                {usesInputMask === false && (
                    <>
                        <Divider flexItem variant="middle" orientation="vertical" />
                        <AddColumnButton />
                        <Divider flexItem variant="middle" orientation="vertical" />
                        <AddLinkButton />
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}

export default RowMask
