import { TableData } from "types"
import { BareFetcher, PublicConfiguration } from "swr/dist/types"

/**
 * @description Default Configuration for the swr hook.
 *
 * {@link https://swr.vercel.app/docs/revalidation}
 */
export const SWRDefaultConfigProps: Partial<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PublicConfiguration<TableData, any, BareFetcher<TableData>>
> = {
    revalidateOnFocus: false,
}
