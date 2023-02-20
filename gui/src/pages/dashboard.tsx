import { Divider, Stack, Typography } from "@mui/material"
import { BookmarkedRecord } from "components/BookmarkedRecord"
import { CollapsableSection } from "components/CollapsableSection"
import { InputMaskCTACard } from "components/InputMaskCTACard"
import MetaTitle from "components/MetaTitle"
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
    const { userSettings } = useUserSettings()

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

            <CollapsableSection
                title="Bookmarks"
                badgeCount={userSettings?.bookmarkedRecords.length}
                badgeColor="info"
            >
                {userSettings == null ? (
                    <>Lädt...</>
                ) : userSettings.bookmarkedRecords.length === 0 ? (
                    <em>Keine gespeicherten Einträge</em>
                ) : (
                    userSettings.bookmarkedRecords.map(bookmark => (
                        <BookmarkedRecord key={bookmark.rowId} bookmark={bookmark} />
                    ))
                )}
            </CollapsableSection>

            <CollapsableSection title="Eingabemasken">
                <Stack direction="row" sx={{ width: "100%" }} gap={4}>
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
