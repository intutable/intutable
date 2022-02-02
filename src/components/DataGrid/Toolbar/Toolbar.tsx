import Obj from "@app/utils/Obj"
import { Toolbar as MUIToolbar, Button, useTheme, Divider } from "@mui/material"
import { Toolbar, ToolbarItem } from "./types"

type TProps = Obj
/**
 * Toolbar for DataGrid.
 * @param {TProps} props
 * @returns {Toolbar} Toolbar Component
 */
const T: Toolbar<TProps> = props => {
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

/**
 * Use `Toolbar.Item` if no other predefined Toolbar Item suits your needs.
 * @tutorial $ `<Toolbar>
 *  <Toolbar.Item {...requiredProps}>
 *    Hello
 *  </Toolbar.Item>
 * </Toolbar`
 */
const TItem: ToolbarItem = props => {
    const theme = useTheme()
    return <Button onClick={props.onClickHandler}>{props.children}</Button>
}

T.Item = TItem
export default T
