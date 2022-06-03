---
id: model_detecting_mvom
title: Detecting MVOM in Triggers
---

# Detecting MVOM in Triggers

Generally speaking, MVOM will never interact directly with your MultiValue BASIC code as it is designed to be standalone. However, MVOM is reading and writing records from the MultiValue database the same way any other MultiValue BASIC programs would. Therefore, if a database file has a trigger established for it then database write operations will continue to fire those triggers.

It may be desirable to detect in those triggers that MVOM was the source of the record write. Whenever MVOM runs its functionality on the database server, it creates a named common area `/S$MVOM/`. Within that named common area will be a common variable `S$MVOM.PROCESS`. The value of this variable will be set to `@TRUE` at the start of the database server workflow.

If you wish to detect in a trigger subroutine that MVOM was the source of a record write, you merely need to declare your own `/S$MVOM/` named common area with the first variable of the common variable being the variable associated with `S$MVOM.PROCESS`:

```
COM /S$MVOM/ S$MVOM.PROCESS
```

If `S$MVOM.PROCESS` is equal to `@TRUE` then it should be safe to assume that the trigger was fired as a result of MVOM writing the record.
