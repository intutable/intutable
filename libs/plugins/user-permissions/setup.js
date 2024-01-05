const symlinkSync = require("fs").symlinkSync
const remove = require("fs").rmSync
const joinPath = require("path").join

const files = [
    ".gitlab-ci.yml",
    "jest.config.js",
    "LICENSE",
    ".npmignore",
    ".npmrc",
    ".prettierignore",
    ".prettierrc.json",
    "tsconfig.json",
]

if (process.cwd === __dirname) {
    process.chdir("..")
}

files.forEach(file => {
    const source = joinPath(__dirname, file)
    const target = file

    // delete if present
    // imitates ln -sf
    try {
        remove(target)
    } catch (err) {}

    symlinkSync(source, target)
})
