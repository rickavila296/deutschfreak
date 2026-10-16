# Decisions

One file per owner decision: `NNNN-short-slug.md`. These are created with `/decide <id>` in Claude Code, or written in a claude.ai chat and pasted here.

A decision here overrides the matching open question (OQ), recommendation (Rec, R, DB-REC) or PLAN-DEC row in the Bible. If it changes Bible text, the Bible is edited in a separate commit (see CLAUDE.md, "Changing the Bible").

Task 0.1 copies the System Specification's decision register into this folder, along with the owner decisions already recorded in Documents 1 to 5 (for example: email and password only, WCAG 2.2 AA, Inter, light theme only, Practice hidden until the hub exists, TRD-DEC-04 vibecoding).

Template:

```
# NNNN — Title
- **ID:** PLAN-DEC-NN (and the open-question IDs it closes)
- **Date:** YYYY-MM-DD
- **Status:** decided | superseded by NNNN
- **Decision:** the choice, stated as a rule
- **Reason:** why
- **Affects:** Bible part and section; phases
```
