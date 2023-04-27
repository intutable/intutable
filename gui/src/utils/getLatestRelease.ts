import { VersionTag } from "types/VersionTag"

/**
 * Returns the version of the most recent release/current version.
 *
 * Note that is does not use the package.json version,
 * but rather the last specified version in the CHANGELOG.md.
 */
export const getLatestRelease = async (): VersionTag => {}
