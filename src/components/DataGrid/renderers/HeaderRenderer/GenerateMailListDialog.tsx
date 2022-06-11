import { LoadingButton } from "@mui/lab"
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    InputAdornment,
    InputLabel,
    MenuItem,
    OutlinedInput,
    Select,
    Stack,
    Switch,
    Typography,
} from "@mui/material"
import { fetcher } from "api"
import { isAppColumn } from "api/utils/de_serialize/column"
import { useSelectedRows } from "context/SelectedRowsContext"
import { useSnacki } from "hooks/useSnacki"
import { useView } from "hooks/useView"
import {
    CSVExportOptions,
    ExportViewRequestBody,
} from "pages/api/util/export/view/[viewId]"
import React, { useMemo, useState } from "react"
import { HeaderRendererProps } from "react-data-grid"
import { Row } from "types"

type GenerateMailListDialogProps = {
    open: boolean
    onClose: () => void
    headerRendererProps: HeaderRendererProps<Row>
}

export const GenerateMailListDialog: React.FC<
    GenerateMailListDialogProps
> = props => {
    const { snackError } = useSnacki()
    const { data: viewData } = useView()
    const { selectedRows } = useSelectedRows() // TODO: consider row selection

    const [state, setState] = useState<ExportViewRequestBody>({
        fileName: "",
        format: "csv",
        columns: [],
        options: {
            csvOptions: {
                header: false,
                includeEmptyRows: false,
            },
        },
    })

    const valid = useMemo(
        () => state.fileName.length > 0 && state.columns.length > 0,
        [state]
    )

    const [loading, setLoading] = useState<boolean>(false)

    const exportView = async () => {
        try {
            setLoading(true)
            const csv = await fetcher({
                url: `/api/util/export/view/${viewData?.descriptor.id}`,
                body: {
                    ...state,
                },
                method: "POST",
                headers: {
                    "Content-Type": "text/csv",
                    Accept: "text/csv",
                },
            })
            console.log(csv)
        } catch (error) {
            console.log(error)
            snackError("Export fehlgeschlagen")
        } finally {
            setLoading(false)
            props.onClose()
        }
    }

    const updateState = <T extends keyof ExportViewRequestBody>(
        key: T,
        value: ExportViewRequestBody[T]
    ) =>
        setState(prev => ({
            ...prev,
            [key]: value,
        }))

    const updateCsvOptions = <T extends keyof CSVExportOptions>(
        key: T,
        value: CSVExportOptions[T]
    ) => {
        setState(prev => ({
            ...prev,
            options: {
                ...prev.options,
                csvOptions: {
                    ...prev.options?.csvOptions,
                    [key]: value,
                },
            },
        }))
    }

    return (
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Mailing-Liste erstellen</DialogTitle>
            <DialogContent>
                <FormControl
                    fullWidth
                    sx={{
                        mt: 3,
                    }}
                >
                    <FormControl variant="outlined" sx={{ mb: 3 }}>
                        <InputLabel htmlFor="fileName-label">
                            Dateiname
                        </InputLabel>
                        <OutlinedInput
                            type="text"
                            id="fileName-label"
                            endAdornment={
                                <InputAdornment position="end">
                                    .csv
                                </InputAdornment>
                            }
                            label="Dateiname"
                            required
                            value={state.fileName}
                            onChange={e =>
                                updateState("fileName", e.target.value)
                            }
                        />
                    </FormControl>

                    <FormControl sx={{ mb: 3 }}>
                        <InputLabel id="format-label">Format</InputLabel>
                        <Select
                            required
                            labelId="format-label"
                            value={state.format}
                            onChange={e =>
                                updateState(
                                    "format",
                                    e.target
                                        .value as ExportViewRequestBody["format"]
                                )
                            }
                            input={<OutlinedInput label="Format" />}
                        >
                            <MenuItem value="json" disabled>
                                JSON
                            </MenuItem>
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="xlsx" disabled>
                                Excel
                            </MenuItem>
                            <MenuItem value="xml" disabled>
                                XML
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl sx={{ mb: 3 }}>
                        <InputLabel id="columns-label">Spalten</InputLabel>
                        <Select
                            required
                            labelId="columns-label"
                            value={state.columns}
                            multiple
                            multiline
                            onChange={e =>
                                updateState(
                                    "columns",
                                    e.target
                                        .value as ExportViewRequestBody["columns"]
                                )
                            }
                            input={<OutlinedInput label="Format" />}
                        >
                            {viewData?.columns
                                .filter(col => isAppColumn(col) === false)
                                .map((col, i) => (
                                    <MenuItem key={i} value={col._id}>
                                        {col.name}
                                    </MenuItem>
                                ))}
                        </Select>
                    </FormControl>

                    {state.format === "csv" && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={state.options?.csvOptions?.header}
                                    onChange={e =>
                                        updateCsvOptions(
                                            "header",
                                            e.target.checked
                                        )
                                    }
                                />
                            }
                            label="Mit Headern in CSV-Datei"
                        />
                    )}

                    {state.format === "csv" && (
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={
                                        state.options?.csvOptions
                                            ?.includeEmptyRows
                                    }
                                    onChange={e =>
                                        updateCsvOptions(
                                            "includeEmptyRows",
                                            e.target.checked
                                        )
                                    }
                                />
                            }
                            label="Leere Zeile übernehmen"
                        />
                    )}

                    {selectedRows.size > 0 &&
                        props.headerRendererProps.allRowsSelected === false && (
                            <FormControlLabel
                                control={<Switch checked disabled />}
                                label="Nur markierte Zeilen exportieren"
                            />
                        )}
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onClose()}>Abbrechen</Button>
                <LoadingButton
                    loading={loading}
                    loadingIndicator={
                        <Stack direction="row">
                            <Typography variant="caption" sx={{ mr: 2 }}>
                                Exportiere
                            </Typography>
                            <CircularProgress size="1rem" sx={{ mr: 2 }} />
                        </Stack>
                    }
                    onClick={exportView}
                    disabled={valid === false}
                >
                    Exportieren
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}
