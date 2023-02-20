import { Divider, Stack, Typography } from "@mui/material"
import { BookmarkedRecord } from "components/BookmarkedRecord"
import { CollapsableSection } from "components/CollapsableSection"
import { InputMaskCTACard } from "components/InputMaskCTACard"
import MetaTitle from "components/MetaTitle"
import { useBookmark } from "hooks/useBookmark"
import { useUserSettings } from "hooks/useUserSettings"
import type { InferGetServerSidePropsType, NextPage } from "next"
import Head from "next/head"
import { getServerSideProps as forms_getServerSideProps, InputMaskCallToActionCard } from "./forms"

type DashboardProps = {
    cards: InputMaskCallToActionCard[]
}

const Dashboard: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (
    props: DashboardProps
) => {
    const { bookmarks } = useBookmark()

    return (
        <>
            <MetaTitle title="Dashboard" />
            <Head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/icon?family=Material+Icons"
                />
            </Head>
            <Typography variant={"h4"}>Dashboard</Typography>
            <Divider />

            <CollapsableSection title="Dringend" defaultClosed>
                <em>Coming Soon</em>
            </CollapsableSection>

            <CollapsableSection title="Bookmarks" badgeCount={bookmarks?.length} badgeColor="info">
                <Stack direction="row" sx={{ width: "100%" }} gap={4} flexWrap="wrap">
                    {bookmarks == null ? (
                        <>Lädt...</>
                    ) : bookmarks.length === 0 ? (
                        <em>Keine gespeicherten Einträge</em>
                    ) : (
                        bookmarks.map(bookmark => (
                            <BookmarkedRecord
                                key={`bookmark-${bookmark.table.id}-${bookmark.row._id}`}
                                bookmark={bookmark}
                            />
                        ))
                    )}
                </Stack>
            </CollapsableSection>

            <CollapsableSection title="Eingabemasken" defaultClosed>
                <Stack direction="row" sx={{ width: "100%" }} gap={4} flexWrap="wrap">
                    {props.cards.map(card => (
                        <InputMaskCTACard key={card.inputMask.id} card={card} />
                    ))}
                </Stack>
            </CollapsableSection>
        </>
    )
}

export const getServerSideProps = forms_getServerSideProps

export default Dashboard
