import { TableDescriptor, LinkKind, LinkDescriptor } from "../types/tables"

export const getOtherTable = (link: LinkDescriptor): TableDescriptor["id"] => {
    switch (link.kind) {
        case LinkKind.Forward:
            return link.foreignTable
        case LinkKind.Backward:
            return link.homeTable
    }
}
