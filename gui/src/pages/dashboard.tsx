import { Divider, Stack, Typography, Box } from "@mui/material"
import { BookmarkedRecord } from "components/BookmarkedRecord"
import { CollapsableSection } from "components/CollapsableSection"
import { InputMaskCTACard } from "components/InputMaskCTACard"
import MetaTitle from "components/MetaTitle"
import { useBookmark } from "hooks/useBookmark"
import type { InferGetServerSidePropsType, NextPage } from "next"
import Head from "next/head"
import { getServerSideProps as forms_getServerSideProps, InputMaskCallToActionCard } from "./forms"
import NotificationCard from "components/NotificationCard"
import { IncompleteUserSettingsWarning } from "components/IncompleteUserSettingsWarning"

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
            <IncompleteUserSettingsWarning />
            <Typography variant={"h4"}>Dashboard</Typography>
            <Divider />

            {/* <CollapsableSection title="Dringend" defaultClosed>
                <em>Coming Soon</em>
            </CollapsableSection> */}

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
                    {props.cards
                        .sort((a, b) =>
                            a.inputMask.disabled === b.inputMask.disabled
                                ? 0
                                : a.inputMask.disabled
                                ? 1
                                : -1
                        )
                        .map(card => (
                            <InputMaskCTACard key={card.inputMask.id} card={card} />
                        ))}
                </Stack>
            </CollapsableSection>

            <CollapsableSection title="Prozesse">
                <Stack direction="row" sx={{ width: "100%" }} gap={4} flexWrap="wrap">
                    <NotificationCard type="deansOffice" />
                    <NotificationCard type="professor" />
                </Stack>
            </CollapsableSection>
        </>
    )
}

export const getServerSideProps = forms_getServerSideProps

export default Dashboard
