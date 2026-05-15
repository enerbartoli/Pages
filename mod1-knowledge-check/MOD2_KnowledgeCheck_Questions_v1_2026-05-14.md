# MOD 2 Knowledge Check — Final Question Set
**Version:** v1  
**Date:** 2026-05-14  
**Total:** 15 questions · Pass threshold: ≥12 (≥80%)  
**Answer-key distribution:** 4A / 4B / 4C / 3D  
**Results-screen header for failed questions:** "Questions to Review to Better Your Understanding"

---

## Q1 — Stable carry-forward, no event in scope

**Question:** A carry-forward item shows two consecutive years of stable seasonal demand, with no confirmed commercial event, no supply issue, and no distribution change in scope. The Daybreak baseline and the Resultant Forecast track the same seasonal shape at L3. What is the correct action?

**(A) Accept the L3 baseline — no enrichment required. ✓**
(B) Apply a positive base trend adjustment to lock the seasonal pattern into next year.
(C) Override the Daybreak baseline with the Sales Forecast.
(D) Submit a disaggregation adjustment request to DP/Genpact.

Slide refs: 4, 5, 6  
Rationale: Two consecutive years of clean history that converge with the baseline mean the model is fit-for-purpose at L3 — adding an enrichment without a missing event would introduce noise without adding value.

---

## Q2 — Diagnostic logic (L3 right, L2 wrong)

**Question:** You are reviewing a scenario where the total demand at L3 looks correct against history, but the customer-level split at L2 routes most of the volume to inactive partners. Where does the issue live?

(A) In the L3 baseline — apply a base trend correction.
**(B) In the L2 disaggregation — fix the customer mix without changing L3. ✓**
(C) In the Daybreak engine — escalate to Genpact for a model rerun.
(D) In both layers — apply offsetting enrichments at L3 and L1.

Slide refs: 4  
Rationale: When L3 totals are right but the customer mix is wrong, the issue lives in the L2 disaggregation logic — adding an enrichment at L3 would inflate the total instead of fixing the split.

---

## Q3 — Stockout-suppressed history

**Question:** An item shipped near zero for several months in 2025 because of a confirmed stockout. The Daybreak baseline now projects 2026 demand at a fraction of the pre-stockout run-rate, because the model learned the suppression as true decline. What is the correct action?

(A) Apply a positive promo enrichment to lift demand back to historical levels.
(B) Override the Daybreak baseline with the Sales Forecast each cycle going forward.
**(C) Cleanse the stockout-affected months in historical data so Daybreak can rebuild an accurate baseline. ✓**
(D) Accept the Daybreak baseline — the model is reading the most recent year correctly.

Slide refs: 7, 8  
Rationale: Stockout-suppressed history is contaminated input, not a true demand signal, so cleansing the affected months at source rebuilds the baseline durably and avoids re-doing the same correction every cycle.

---

## Q4 — Warm-start NPI cross-year reset

**Question:** A Warm Start NPI has 16 weeks of actuals that came in below the 2026 Resultant plan. Daybreak interprets this as a structural correction and slashes the 2027 baseline by more than half. The item still has under 12 months of history. What is the correct action?

(A) Accept the Daybreak 2027 baseline — 16 weeks of actuals is a strong signal.
(B) Apply a negative base trend in 2026 to match the Daybreak 2027 view.
**(C) Recalculate overall demand with Brand Captain and Sales input, preserving NPI logic. ✓**
(D) Phase the item out — the early sell-in is signaling end of life.

Slide refs: 9, 10  
Rationale: Sixteen weeks of actuals on an NPI with under twelve months of history is not enough signal to justify a structural reset of the next-year baseline, so the team recalculates demand together to balance the model's signal against commercial knowledge.

---

## Q5 — Exclusive item disaggregation

**Question:** A carry-forward item is exclusive to a single retailer — that retailer absorbs ~100% of actuals across the past two years. The Current Resultant disaggregation routes a large share to other customers with no recent history, while the Moving Average method routes ~100% to the exclusive partner. What is the correct action?

(A) Keep the Current disaggregation; the model will self-correct over time.
(B) Apply a negative base trend to remove the non-active customers.
(C) Submit a disaggregation request to DP/Genpact to rebuild the customer hierarchy.
**(D) Switch the L2 disaggregation method from Current to Moving Average. ✓**

Slide refs: 11, 12, 13, 14  
Rationale: For an exclusive item, Moving Average over recent actuals captures the real customer mix while Current Resultant fragments to inactive partners — switching the disaggregation method is the direct fix, no L3 enrichment needed.

---

## Q6 — Set vs Base Trend core distinction

**Question:** Which statement correctly describes the difference between a Set and a Base Trend enrichment?

(A) A Set is positive only; a Base Trend can be positive or negative.
**(B) A Set cleanses out of history after the period passes; a Base Trend enters the baseline permanently. ✓**
(C) A Set is owned by Sales; a Base Trend is owned by Demand Planning.
(D) A Set applies to NPI items only; a Base Trend applies to carry-forward items only.

Slide refs: 24  
Rationale: Sets are for one-time events because they cleanse out of history after they ship; Base Trend is for structural changes that should repeat because it permanently enters the baseline.

---

## Q7 — Confirmed ladder

**Question:** A customer pulls confirmed annual demand into a specific order window (ladder), with offsetting reductions in the months from which demand is being moved. The full-year total does not change. Which enrichment approach is correct?

(A) Positive base trend in the ladder month + negative base trend in the pulled-from months.
**(B) Positive set in the ladder month + negative sets in the pulled-from months. ✓**
(C) Single positive base trend in the ladder month — the negative offset is not needed.
(D) No enrichment — let the baseline absorb the timing shift over the next cycle.

Slide refs: 32  
Rationale: A ladder is a timing move, not incremental demand — sets are the right tool because they cleanse out of history, while base trend would permanently distort next year's baseline with the same timing shift.

---

## Q8 — Customer distribution expansion

**Question:** A customer is adding new stores to its distribution. The initial pipeline fill ships in one window (F1), and ongoing replenishment continues in those new stores afterwards. Which enrichment approach is correct?

(A) Single base trend from F1 onward — covers both the fill and ongoing replenishment.
(B) Single set in F1 — covers the fill; the model will pick up the new run-rate from actuals.
**(C) Set in F1 for the new-store fill + base trend from F2 onward for ongoing replenishment. ✓**
(D) Two sets — one in F1 for the fill, one in F2 onward for replenishment.

Slide refs: 29  
Rationale: The new-store fill is one-time (Set, cleanses out) and the higher run-rate is structural (Base Trend, enters baseline) — using a single enrichment type for both would either contaminate next year's baseline or leave the ongoing lift uncaptured.

---

## Q9 — Standard promo on carry-forward item

**Question:** An established carry-forward item has a future confirmed retail promotion that is not already reflected in baseline behavior. The promo will generate incremental units in a specific ship window. Which enrichment is correct?

**(A) Promo enrichment for the confirmed incremental units in the relevant ship week(s). ✓**
(B) Positive base trend for the promo lift, to persist into future cycles.
(C) Set enrichment for the entire month containing the promo.
(D) No enrichment — the baseline will capture the lift once actuals come in.

Slide refs: 26  
Rationale: A confirmed, incremental, time-bounded promo is exactly what the promo enrichment type was built for — base trend would inflate next year's baseline, and a set would over-capture by extending beyond the promo window.

---

## Q10 — Pre-order / committed initial volume

**Question:** A customer has provided a specific pre-order quantity and timing for a new item with no comparable history. What is the correct way to capture it?

**(A) Pre-order enrichment for the confirmed quantity and timing only. ✓**
(B) Pre-order enrichment for the confirmed quantity, plus an additional run-rate estimate for the rest of the year.
(C) Set enrichment for the pre-order, then convert to base trend once actuals start coming in.
(D) No enrichment — the NPI baseline will absorb the pre-order.

Slide refs: 37  
Rationale: Pre-orders are entered at confirmed quantity only — adding speculative volume beyond the commitment undermines the rationale for using the enrichment type in the first place.

---

## Q11 — NPI with channel-fill in baseline

**Question:** An NPI's stat baseline already includes the channel-fill volume in its launch shape, but the team needs the fill visible as a discrete set for allocation traceability. What is the correct approach in F1?

(A) Add a positive set for the channel-fill on top of the existing baseline.
(B) Apply a positive base trend in F1 to make the channel-fill visible.
(C) Submit a disaggregation request to split the channel-fill into a separate baseline component.
**(D) Two offsetting sets in F1 — negative to remove the embedded fill, positive of equal magnitude to restore it visibly. ✓**

Slide refs: 31  
Rationale: The channel-fill is already in the NPI baseline, so a single positive set would double-count — two offsetting sets keep the total unchanged while making the fill visible for allocation, and both cleanse out after launch.

---

## Q12 — Historical promo spike not repeating

**Question:** Last year a deal spike inflated demand for a specific period, and the promotion is not repeating this year. The baseline is now projecting the spike forward as if it were normal seasonality. What is the correct action?

(A) Apply a positive promo enrichment to confirm the new run-rate.
(B) Submit a disaggregation adjustment to redistribute the spike across customers.
**(C) Apply a negative base trend to remove the phantom spike from the projection. ✓**
(D) Let the baseline run — actuals will pull it back to normal within two cycles.

Slide refs: 39  
Rationale: A non-repeating historical spike that the model is echoing forward needs to be removed structurally — negative base trend corrects it now, and flagging the period for historical cleansing prevents the same correction from being needed next cycle.

---

## Q13 — Customer discontinued the item

**Question:** A specific customer has discontinued an item that remains active at other customers. The baseline is still allocating volume to the dropped customer based on past proportions. What is the correct action?

**(A) Apply a negative base trend and update the forecasting range to stop allocating to that customer. ✓**
(B) Wait — the model will reduce the customer's share once actuals show zero.
(C) Submit a disaggregation request to remove the customer from the L2 split.
(D) Apply a one-time negative set for the year, then let the baseline rebuild.

Slide refs: 44  
Rationale: A customer exit is a structural change — base trend removes the phantom volume while the forecasting-range update prevents the model from continuing to route demand to a customer that no longer takes the item.

---

## Q14 — Channel shift DOM ↔ DI

**Question:** A customer is changing its buying route from Domestic to Direct Import. Total demand is unchanged — only the channel is moving. The volume in scope currently sits in the baseline. What is the correct approach?

(A) Create a positive enrichment on DI and an offsetting negative enrichment on DOM.
(B) Submit a disaggregation request to reroute the volume between channels.
(C) Apply a base trend on DI to grow the channel; let DOM decay through actuals.
**(D) Use the channel-shift functionality on the baseline to move volume from DOM to DI. ✓**

Slide refs: 51  
Rationale: Channel shift is a routing change, not new demand — the channel-shift functionality moves baseline volume cleanly between channels, while creating offsetting enrichments would distort total demand.

---

## Q15 — L3 right, L2 wrong (disaggregation request)

**Question:** At the BU/brand level the L3 total is accurate against history, but the L2 customer split allocates too much volume to a customer with declining actuals. What is the correct path?

(A) Apply a negative enrichment on the over-allocated customer to bring the split back in line.
**(B) Submit a disaggregation adjustment request to DP/Genpact; do not enter an enrichment. ✓**
(C) Apply offsetting enrichments — negative on the over-allocated customer, positive on the under-allocated one.
(D) Switch the L2 disaggregation method from Moving Average back to Current Resultant.

Slide refs: 54  
Rationale: When L3 is right, no enrichment is needed — enriching at L1 to fix an L2 split would inflate L3 total demand, so the correct path is a disaggregation adjustment routed through DP/Genpact.

---

## Answer Key

```javascript
const ANSWER_KEY_MOD2 = {
  Q1:  "A",
  Q2:  "B",
  Q3:  "C",
  Q4:  "C",
  Q5:  "D",
  Q6:  "B",
  Q7:  "B",
  Q8:  "C",
  Q9:  "A",
  Q10: "A",
  Q11: "D",
  Q12: "C",
  Q13: "A",
  Q14: "D",
  Q15: "B"
};
```

## Slide References

```javascript
const SLIDE_REFS_MOD2 = {
  Q1:  "4, 5, 6",
  Q2:  "4",
  Q3:  "7, 8",
  Q4:  "9, 10",
  Q5:  "11, 12, 13, 14",
  Q6:  "24",
  Q7:  "32",
  Q8:  "29",
  Q9:  "26",
  Q10: "37",
  Q11: "31",
  Q12: "39",
  Q13: "44",
  Q14: "51",
  Q15: "54"
};
```

## Rationales (shown on failure)

```javascript
const RATIONALES_MOD2 = {
  Q1:  "Two consecutive years of clean history that converge with the baseline mean the model is fit-for-purpose at L3 — adding an enrichment without a missing event would introduce noise without adding value.",
  Q2:  "When L3 totals are right but the customer mix is wrong, the issue lives in the L2 disaggregation logic — adding an enrichment at L3 would inflate the total instead of fixing the split.",
  Q3:  "Stockout-suppressed history is contaminated input, not a true demand signal, so cleansing the affected months at source rebuilds the baseline durably and avoids re-doing the same correction every cycle.",
  Q4:  "Sixteen weeks of actuals on an NPI with under twelve months of history is not enough signal to justify a structural reset of the next-year baseline, so the team recalculates demand together to balance the model's signal against commercial knowledge.",
  Q5:  "For an exclusive item, Moving Average over recent actuals captures the real customer mix while Current Resultant fragments to inactive partners — switching the disaggregation method is the direct fix, no L3 enrichment needed.",
  Q6:  "Sets are for one-time events because they cleanse out of history after they ship; Base Trend is for structural changes that should repeat because it permanently enters the baseline.",
  Q7:  "A ladder is a timing move, not incremental demand — sets are the right tool because they cleanse out of history, while base trend would permanently distort next year's baseline with the same timing shift.",
  Q8:  "The new-store fill is one-time (Set, cleanses out) and the higher run-rate is structural (Base Trend, enters baseline) — using a single enrichment type for both would either contaminate next year's baseline or leave the ongoing lift uncaptured.",
  Q9:  "A confirmed, incremental, time-bounded promo is exactly what the promo enrichment type was built for — base trend would inflate next year's baseline, and a set would over-capture by extending beyond the promo window.",
  Q10: "Pre-orders are entered at confirmed quantity only — adding speculative volume beyond the commitment undermines the rationale for using the enrichment type in the first place.",
  Q11: "The channel-fill is already in the NPI baseline, so a single positive set would double-count — two offsetting sets keep the total unchanged while making the fill visible for allocation, and both cleanse out after launch.",
  Q12: "A non-repeating historical spike that the model is echoing forward needs to be removed structurally — negative base trend corrects it now, and flagging the period for historical cleansing prevents the same correction from being needed next cycle.",
  Q13: "A customer exit is a structural change — base trend removes the phantom volume while the forecasting-range update prevents the model from continuing to route demand to a customer that no longer takes the item.",
  Q14: "Channel shift is a routing change, not new demand — the channel-shift functionality moves baseline volume cleanly between channels, while creating offsetting enrichments would distort total demand.",
  Q15: "When L3 is right, no enrichment is needed — enriching at L1 to fix an L2 split would inflate L3 total demand, so the correct path is a disaggregation adjustment routed through DP/Genpact."
};
```
