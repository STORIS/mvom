---
id: model_user_defined_options
title: User Defined Options
---

# User Defined Options

Many `Model` methods have an option property named `userDefined` available. As noted in the [Detecting MVOM in Triggers](model_detecting_mvom) section, MVOM is standalone but can potentially fire triggers upon writing. The `userDefined` object allows for passing values through to those trigger subroutines via the `/S$MVOM/` named common area.

The `userDefined` property accepts an object with the following properties:

- `option1`
- `option2`
- `option3`
- `option4`
- `option5`

Each property is optional so you can specify as many or as few of them as you want. These values will be assigned to the `/S$MVOM/` named common area as the second through sixth variables of the common block. If you wish to utilize these values in your trigger subroutines, you can declare your own `/S$MVOM/` named common area:

```
COM /S$MVOM/ S$MVOM.PROCESS
COM /S$MVOM/ S$MVOM.USER1, S$MVOM.USER2, S$MVOM.USER3, S$MVOM.USER4, S$MVOM.USER5
```

The value from `option1` will be assigned to `S$MVOM.USER1`, the value from `option2` will be assigned to `S$MVOM.USER2`, and so on.

Related: [Detecting MVOM in Triggers](model_detecting_mvom)
