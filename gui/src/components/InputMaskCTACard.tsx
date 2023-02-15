import { ViewDescriptor } from "@intutable/lazy-views/dist/types"
import { ProjectDescriptor } from "@intutable/project-management/dist/types"
import AddRecordIcon from "@mui/icons-material/PlaylistAddCircle"
import TableIcon from "@mui/icons-material/TableRows"
import ViewIcon from "@mui/icons-material/TableView"
import {
    Avatar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material"
import Icon from "@mui/material/Icon"
import { useTheme } from "@mui/material/styles"
import { InputMask } from "@shared/input-masks/types"
import { useRouter } from "next/router"
import { UrlObject } from "url"

export type InputMaskCallToActionCard = {
    inputMask: InputMask
    url: string | UrlObject
    callToActionUrl: string | UrlObject
    originType: "table" | "view"
    source: {
        project: ProjectDescriptor
        table: ViewDescriptor
        view: ViewDescriptor
    }
}

export const InputMaskCTACard: React.FC<{ card: InputMaskCallToActionCard }> = ({ card }) => {
    const theme = useTheme()
    const router = useRouter()

    return (
        <Card
            sx={{
                "&:hover": {
                    bgcolor: card.inputMask.disabled
                        ? theme.palette.action.disabled
                        : theme.palette.action.hover,
                },
                bgcolor: card.inputMask.disabled ? theme.palette.action.disabled : "inherit",
                maxWidth: "500px",
            }}
        >
            <CardContent>
                <Stack direction="column">
                    <Stack direction="row" gap={2} alignContent="center" sx={{ mb: 1 }}>
                        <Tooltip
                            arrow
                            placement="right"
                            title={`${card.source.project.name} > ${card.source.table.name} > ${
                                card.source.view.name
                            } (${card.originType === "table" ? "Tabelle" : "View"})`}
                            sx={{ mr: 2 }}
                        >
                            <Avatar
                                sx={{
                                    bgcolor: card.inputMask.disabled
                                        ? theme.palette.action.disabled
                                        : "tomato",
                                }}
                                variant="rounded"
                            >
                                {card.originType === "table" ? <TableIcon /> : <ViewIcon />}
                            </Avatar>
                        </Tooltip>
                        <Stack>
                            <Typography sx={{ fontSize: 10 }} color="text.secondary">
                                {card.inputMask.name}
                            </Typography>
                            <Typography gutterBottom variant="h5" component="div">
                                {card.originType === "table"
                                    ? card.source.table.name
                                    : `${card.source.view.name} in ${card.source.table.name}`}
                            </Typography>
                        </Stack>
                        {card.inputMask.disabled && (
                            <>
                                <Box flexGrow={1} />
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        color: theme.palette.warning.dark,
                                        fontStyle: "italic",
                                    }}
                                >
                                    inaktiv
                                </Typography>
                            </>
                        )}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                        {card.inputMask.description}
                    </Typography>
                </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end" }}>
                <Button
                    size="small"
                    onClick={() =>
                        router.push(
                            card.url,
                            typeof card.url === "string" ? card.url : card.url.pathname!
                        )
                    }
                    disabled={card.inputMask.disabled}
                >
                    Einträge ansehen
                </Button>
                <Button
                    onClick={e => {
                        e.stopPropagation()
                        router.push(
                            card.callToActionUrl,
                            typeof card.url === "string" ? card.url : card.url.pathname!
                        )
                    }}
                    size="small"
                    disabled={card.inputMask.disabled}
                    startIcon={
                        card.inputMask.addRecordButtonIcon ? (
                            <Icon>{card.inputMask.addRecordButtonIcon}</Icon>
                        ) : (
                            <AddRecordIcon />
                        )
                    }
                    sx={{
                        fontWeight: "600",
                    }}
                >
                    {card.inputMask.addRecordButtonText ?? "Neuer Eintrag"}
                </Button>
            </CardActions>
        </Card>
    )
}
