# `web-import`

Plugin for the Dekanatapp to import data from other sites like the LSF.

## Usage

### Add this plugin to your project

```bash
npm install --save @intutable-org/web-import
```

### Scraper reference

#### `LSF-scraper`

|                 | List persons from LSF                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Description** | List all persons from the LSF that have a by name and surname                                                                                                                                  |
| **URL**         | `list-persons-lsf`                                                                                                                                                                             |
| **Params**      | `(name)` `(surname)`                                                                                                                                                                           |
| **Returns**     | `Array` <ul><li>`title` the persons title (e.g. Dr.)</li><li>`name` the persons name</li><li>`surname` the persons surname</li><li>`id` the persons id (usefull to get persons data)</li></ul> |

|                | Get person from LSF                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Decription** | Get a persons data from the LSF by id                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **URL**        | `get-person-lsf`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| **Params**     | **`id`**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| **Returns**    | <details><summary>`Object` (all kind of data)</summary><ul><li>`title` the persons title (e.g. Dr.)</li><li>`firstname` the persons name</li><li>`surname` the persons surname</li><li>`mark` the persons mark</li><li>`state` the persons state</li><li>`topics` the persons topics</li><li>`room` the persons room</li><li>`building` the persons building</li><li>`street` the persons street</li><li>`plz` the persons plz</li><li>`location` the persons location</li><li>`phone` the persons phone</li><li>`mail` the persons mail</li></ul></details> |

## Development

### Setup

-   clone this repository:

```bash
git clone https://gitlab.com/intutable/web-import.git
```

-   cd into the directory: `cd web-import`
-   run `npm install`
-   then: `npm run dev`

### Best practices

-   use `npm run lint` to check for linting and format errors
-   some can be fixed automatically with `npm run lint:fix`
-   doing this is voluntarily but recommended (for now)

editor specific settings to make your life easier:

<details>
  <summary>Visual Studio Code</summary>
  
  There is a `.vscode` folder with some sane settings for the editor. It also includes some suggested extensions. If you want to use them, you accept the prompt (when opening this workspace) or search for `@recommended` in the extensions tab.

The extensions will enable:

-   auto format prettier on save
-   auto format eslint on save
-   eslint hightlighting (usefull for eslint rules that are not auto fixable)

</details>
