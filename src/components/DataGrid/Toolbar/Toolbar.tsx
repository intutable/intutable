import { Toolbar as MUIToolbar, Button, useTheme, Divider } from "@mui/material"

type ToolbarProps = {
    position: "top" | "bottom"
    children: React.ReactElement | React.ReactElement[]
}

const Toolbar: React.FC<ToolbarProps> = props => {
    const theme = useTheme()
    return (
        <MUIToolbar
            sx={{
                border: "1px solid",
                borderColor: theme.palette.divider,
                ...theme.mixins.toolbar,
                overflowX: "scroll",
                px: theme.spacing(1),
                borderTopLeftRadius:
                    props.position === "top" ? theme.shape.borderRadius : 0,
                borderTopRightRadius:
                    props.position === "top" ? theme.shape.borderRadius : 0,
                borderBottomLeftRadius:
                    props.position === "bottom" ? theme.shape.borderRadius : 0,
                borderBottomRightRadius:
                    props.position === "bottom" ? theme.shape.borderRadius : 0,
            }}
            disableGutters
        >
            {/* TODO: add key */}
            {Array.isArray(props.children)
                ? props.children.map((child, index, array) =>
                      index + 1 === array.length ? (
                          child
                      ) : (
                          <>
                              {child}
                              <Divider
                                  orientation="vertical"
                                  flexItem
                                  variant="middle"
                                  sx={{
                                      mx: theme.spacing(1),
                                  }}
                              />
                          </>
                      )
                  )
                : props.children}
        </MUIToolbar>
    )
}

export default Toolbar
