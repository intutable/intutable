type PrereleaseTagVersion = `.${number}` | ""
type PrereleaseTags = `-alpha` | `-beta` | `-rc`

/**
 * type for semver version tags we use
 * keep it compatible with semver and especially
 * their regex https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
 */
export type VersionTag = `${number}.${number}.${number}${
    | `${PrereleaseTags}${PrereleaseTagVersion}`
    | ""}`
