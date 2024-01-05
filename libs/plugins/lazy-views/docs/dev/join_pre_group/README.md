## Pre-grouping joins

With of version 7.0.0, we decided to introduce a feature wherein joins could be configured with
an option `preGroup`. If `preGroup` is set, then the subquery of the joined source is grouped
before joining. This is because, in a view with multiple joins, SQL forms an n-ary cartesian
product, which can lead to individual row values being duplicated. Grouping the view will
only create aggregations with these duplicate values - eliminating them requires grouping
after every single join. `preGroup` solves this problem. For more detail and an example, see
`prez.odp` or `prez.pptx` in this same directory.
