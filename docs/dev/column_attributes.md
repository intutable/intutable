# Adding New Column Attributes
Adding new meta properties to columns is a serious challenge right now. This
guide will hopefully help you through the worst.

## Overview
Data generally exist in three stages in this application.  
  - Relational data in the database (usually named `DB.<something>`)  
  - Serialized versions of the visible front-end data, often prefixed
    with `Serialized...`  
  - Visible front-end, often prefixed with `Deserialized...`.  

See `gui/src/types/tables/index.ts` and follow imports for a rough overview.
In addition to implementing these types, we must also implement conversions
between them. The following section will explain this further.

## What to Change when Adding a New Attribute
1. add to database schema in `init.sql`
2. add to the type representing the database `DB.Column` in 
`shared/src/types/tables/backend.ts`
3. add to front-end columns:
  - the type `metaColumnProps` in `shared/src/types/tables/base`
    contains properties that both serialized and non-serialized front-end
    columns have. Most likely, you will want to add it here  
  - If the type should only exist on serialized columns, add it to the
    definition of `SerializedColumn` in
    `shared/src/types/tables/serialized`.  
  - To convert between DB and serialized columns, go to 
    `dekanat-app-plugin/src/api/parse/DBParser.ts` and change the
    methods `parseColumnInfo` and `partialDeparseColumn` appropriately  
  - You may also want to change `serializeColumn` or `deserializeColumn`
    in `gui/src/utils/SerDes.ts` if you want some conversion or other
    special treatment (default behavior is to just copy the prop)
4. Set it: Default meta props for various kinds of column are defined in
   `shared/src/attributes/defaults.ts`, or you can manually add it if
   it is only supposed to exist in specific situations.
5. Use the property wherever you need to for the functionality it is
   supposed to achieve.
    
