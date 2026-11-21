---
title: Where to put the temperature sensors in a 192-cell pack
summary: >-
  Fourteen simulated runs of an air-cooled 12S16P pack, built in Battery Sim Suite
  with PyBaMM cell models, were used to choose temperature sensor positions. Two
  sensors were enough to estimate the temperature of every cell to within 0.44 °C
  RMSE on seven runs the method had never seen.
date: 2026-10-15
authors: Soham Dange, Nachiket Bhate
event: PyBaMM Conference 2026, Ann Arbor
sector: Pack thermal design
models: [PyBaMM SPM + SEI ageing]
pack: 12S16P, 192 × LG M50T, air-cooled
image: /case-studies/images/sensor-placement-cover.jpg
image_alt: Top of the conference poster, with heat maps of pack temperature for three of the simulated runs
---

## The challenge

A battery pack usually carries only a few temperature sensors, so most of its cells
are never measured. Where those few sensors go decides how well the battery
management system can see a hot cell. Placement studies rarely start from
physics-based cell models, so they can miss things such as cells that age or
heat differently from their neighbours.

This study tested a single workflow that takes cell physics all the way through to
sensor positions: simulate the pack under many conditions, learn its typical
temperature patterns, and choose the fewest cells to measure so that the rest can
be estimated.

## The setup: what ran in Battery Sim Suite

All of the temperature data came from pack simulations in Battery Sim Suite.

- **Pack:** 12 in series, 16 in parallel: 192 LG M50T 21700 cells on a 23 mm pitch in one layer, air-cooled.
- **Cell model:** PyBaMM's single-particle model (SPM) with SEI ageing and the OKane2022 parameter set, run through the [Electrochemical Models Add-On]({{ '/features/' | relative_url }}#engines). At every time step the cell model takes current and temperature and returns voltage, heat, state of charge and capacity lost to SEI growth.
- **Pack thermal model:** cell-to-cell heat links (30 K/W), cooling to the air (10–15 K/W) and a 25 °C ambient.
- **Cell differences:** a production spread drawn from measured LG M50T data (resistance σ 2.4 %, capacity σ 0.45 %), plus five deliberately bad cells in some runs: three with 1.6× resistance and two with 85 % capacity.
- **Duties:** an aggressive 1.5C cycle over 3 days, and a residential solar home-battery day repeated for 15 days.
- **Other conditions:** an airflow gradient from inlet to outlet, and packs that start already aged to 95 %, 90 % and 85 % health.

That gave 14 runs with the temperature of every cell at every step. Seven were used to
choose the sensors (training runs) and seven were kept back to test them (unseen runs).
The runs were split by whole run, never by time.

## Choosing the sensor positions

<div class="callout callout--charge"><p><strong>Coming to the app:</strong> this step ran in a separate sensor-placement tool that reads the temperature results exported from Battery Sim Suite. Sensor placement is planned as a future module inside the app.</p></div>

1. **Data check.** Each training run is hidden in turn and rebuilt from the other six. The accuracy target is an RMSE of at most 1 °C *and* at least 95 % of cells within ±2 °C; the worse of the two decides. The airflow-gradient run failed this check because it was the only run of its kind. That is a useful warning: the training data needs more runs like it.
2. **Temperature patterns.** A proper orthogonal decomposition (POD, through an SVD) splits the training data into a few pack-wide patterns. Five were kept: the whole pack warming together (98.4 % of the energy), inlet to outlet (1.5 %), edge against centre, the five bad cells, and fine detail.
3. **Ranking positions.** QR pivoting ranks the cells that best capture those patterns.
4. **Sensor count.** Take the fewest sensors that meet the target on the worst training run. One sensor fails (1.31 °C RMSE, 87.5 % of cells within ±2 °C). Two pass (0.39 °C, 100 %).

The temperature of every other cell is then estimated from the two readings: fit the
patterns to the readings and add the result to the average pack temperature.

## Results

| Measure | Result |
|---|---|
| Sensors needed | **2** |
| Worst RMSE, training runs | 0.39 °C |
| Cells within ±2 °C, all 7 training runs | 100 % |
| Unseen runs that meet the target | **7 of 7** |
| Worst RMSE, unseen runs | 0.44 °C (bad cells plus airflow gradient) |
| Worst single cell, unseen runs | 2.27 °C (a bad cell near the inlet) |
| RMSE on the aged packs | 0.06 °C or less |
| Estimate error per 1 °C of sensor error | 0.82 °C |

Two well-placed sensors were enough for this pack and these duties, including runs with
bad cells, an airflow gradient and aged cells that the method had not trained on. The
largest single-cell error was on a bad cell, the kind of cell a pack designer most
wants to see.

## The poster

The study was presented as a poster at the PyBaMM Conference 2026 in Ann Arbor,
Michigan (15–16 October). Click the poster for the full-size image.

[![The full A0 conference poster: problem, workflow, simulation model, model building, validation and conclusions]({{ '/case-studies/images/sensor-placement-poster.jpg' | relative_url }})]({{ '/case-studies/images/sensor-placement-poster.png' | relative_url }})

Download: [full-size poster image (1.8 MB)]({{ '/case-studies/images/sensor-placement-poster.png' | relative_url }})

## What's next

- Packs with more than one layer, and a higher-fidelity thermal model.
- Checking the method against measured temperatures from a real pack.
- Bringing sensor placement into Battery Sim Suite as its own module, so the whole
  workflow runs in one place.

## References

1. Sulzer et al., PyBaMM, *J. Open Res. Softw.* 9(1), 14 (2021). doi:10.5334/jors.309
2. O'Kane et al., Lithium-ion battery degradation: how to model it, *PCCP* 24, 7909 (2022). doi:10.1039/D2CP00417H
3. Manohar, Brunton, Kutz & Brunton, Data-driven sparse sensor placement for reconstruction, *IEEE Control Syst. Mag.* 38, 63 (2018)
4. Chaturantabut & Sorensen, Nonlinear model reduction via DEIM, *SIAM J. Sci. Comput.* 32(5), 2737 (2010)
5. Drmač & Gugercin, A new selection operator for DEIM, *SIAM J. Sci. Comput.* 38(2), A631 (2016)
6. Kirkaldy et al., Cycle ageing data for 21700 cells, *J. Power Sources* 603, 234185 (2024)
7. Kirkaldy et al., dataset for [6], Zenodo record 10637534
8. Baumhöfer et al., Production caused variation in capacity aging trend, *J. Power Sources* 247, 332 (2014)
