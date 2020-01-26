# Product Model

## Current issue
1. Select any Order Item
2. Select Supplier
3. Clear Order Item filter
4. Customers are unfiltered (selected all)

Even when already filtered, making changes to a filter on a cube needs to propagate to other cubes somehow. Need to work out logic. Perhaps some concept of filtered by incoming vs not filtered by internal filters?

Solution? Keep a mask of dimensions that are incoming filters. Use this mask to remove them, then see if each item has gone from filtered -> unfiltered or back.