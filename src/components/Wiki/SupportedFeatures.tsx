import {
    TableContainer,
    Paper,
    Table,
    TableRow,
    TableCell,
    TableHead,
    TableBody,
    TableFooter,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material"
import Link from "components/Link"
import { VersionTag } from "types/VersionTag"
import InfoIcon from "@mui/icons-material/Info"
import SupportedIcon from "@mui/icons-material/CheckCircleRounded"
import UnsupportedIcon from "@mui/icons-material/Dangerous"
import InDevelopmentIcon from "@mui/icons-material/Settings"
const getIcon = (support: Feature["support"]): React.ReactNode =>
    support === "supported" ? (
        <SupportedIcon />
    ) : support === "unsupported" ? (
        <UnsupportedIcon />
    ) : (
        <InDevelopmentIcon />
    )

export type Feature = {
    name: string
    infoText: string
    support: "supported" | "unsupported" | "in-development"
    /**
     * since when this feature is supported
     */
    release: VersionTag
}

export type SupportedFeaturesProps = {
    features: Feature[]
}

export const SupportedFeatures: React.FC<SupportedFeaturesProps> = props => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Feature</TableCell>
                        <TableCell>Support</TableCell>
                        <TableCell>Release</TableCell>
                    </TableRow>
                    <TableBody>
                        {props.features.map(feature => (
                            <TableRow key={feature.name}>
                                <TableCell>
                                    <Typography>{feature.name}</Typography>
                                    <Tooltip
                                        arrow
                                        placement="right"
                                        title={feature.infoText}
                                    >
                                        <IconButton>
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                                <TableCell>
                                    {getIcon(feature.support)}
                                </TableCell>
                                <TableCell>
                                    <Link href={`/release/${feature.release}`}>
                                        {feature.release}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </TableHead>
                <TableFooter>
                    <TableRow>
                        <TableCell>Footer</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </TableContainer>
    )
}

export default SupportedFeatures
