import { Chip, Tooltip } from "@mui/material"
import { Beta } from "components/Beta"
import { MarkdownPage } from "pages/wiki"

export const WikiBadge: React.FC = () => (
    <Chip variant="outlined" label="Wiki" color="primary" size="small" sx={{ cursor: "help" }} />
)

export const UserGuideBadge: React.FC<{ onDelete?: () => void }> = props => (
    <Chip
        onDelete={props.onDelete}
        variant="outlined"
        label="User Guide"
        color="success"
        size="small"
        sx={{ cursor: "help" }}
    />
)

export const TechnicalDocumentationBadge: React.FC<{ onDelete?: () => void }> = props => (
    <Tooltip
        title="Diese Seite ist nur für Entwickler und Administratoren."
        arrow
        placement="right"
    >
        <Chip
            onDelete={props.onDelete}
            variant="outlined"
            label="Technical Documentation"
            color="error"
            size="small"
            sx={{ cursor: "help" }}
        />
    </Tooltip>
)

export const getTypeBadge = (type: MarkdownPage["type"]) => {
    switch (type) {
        case "user-guide":
            return <UserGuideBadge />
        case "technical-documentation":
            return <TechnicalDocumentationBadge />
        default:
            throw new Error(`Unknown type: ${type}`)
    }
}

export const getTypeBadgeComponent = (type: MarkdownPage["type"]) => {
    switch (type) {
        case "user-guide":
            return UserGuideBadge
        case "technical-documentation":
            return TechnicalDocumentationBadge
        default:
            throw new Error(`Unknown type: ${type}`)
    }
}

export const getBadges = (badges: MarkdownPage["badge"]) => {
    if (badges === undefined || badges.length === 0) return null

    return badges.map(badge => {
        switch (badge) {
            case "wiki":
                return <WikiBadge />
            case "beta":
                return <Beta />
            default:
                throw new Error(`Unknown badge: ${badge}`)
        }
    })
}
