import { TreeView } from "@mui/lab"
import {
    MinusSquare,
    PlusSquare,
    CloseSquare,
    StyledTreeItem,
} from "./TreeView"
import { Box } from "@mui/material"
import Link from "components/Link"
import { isWikiNode, WikiNode, WikiTree as WikiTreeType } from "./types"
import { docs as nodes } from "public/wikidocs"

const buildTree = (nodes: WikiTreeType, depth = 0) =>
    nodes.map((node, i) =>
        isWikiNode(node) ? (
            <StyledTreeItem
                key={`${depth}-${i}`}
                nodeId={`${depth}-${i}`}
                label={node.title}
            >
                {buildTree(node.children, ++depth)}
            </StyledTreeItem>
        ) : (
            <StyledTreeItem
                key={`${depth}-${i}`}
                nodeId={`${depth}-${i}`}
                label={<Link href={node.href}>{node.title}</Link>}
            />
        )
    )

export const WikiTree: React.FC = () => {
    return (
        <Box>
            <TreeView
                aria-label="customized"
                defaultExpanded={["1"]}
                defaultCollapseIcon={<MinusSquare />}
                defaultExpandIcon={<PlusSquare />}
                defaultEndIcon={<CloseSquare />}
                sx={{
                    height: 264,
                    flexGrow: 1,
                    maxWidth: 400,
                    overflowY: "auto",
                }}
            >
                {buildTree(nodes)}
            </TreeView>
        </Box>
    )
}

export default WikiTree
