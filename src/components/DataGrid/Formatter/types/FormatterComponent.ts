import React from "react"
import { FormatterProps } from "react-data-grid"
import { Row } from "types"
import Obj from "types/Obj"

export type FormatterComponent = React.FunctionComponent<FormatterProps<Row>>
