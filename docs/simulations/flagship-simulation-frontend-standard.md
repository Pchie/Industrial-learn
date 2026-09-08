# Flagship Simulation Frontend Standard

## Basic Fluid Pressure

The approved lesson retains its existing force/area controls, SI calculation, live
equation, observation questions, challenge, Deep Dive and authenticated progress action.
The shared workbench places the visual first and gives controls/measurements a consistent
responsive context. Standard is the only appropriate inspection mode; no fake equipment
or extra physics is added. The homepage preview reuses this same visual/model and appears
only while the exact lesson passes the existing publication checks.

## Hydraulic Cylinder

Standard retains the existing pressure source, cap-end cylinder, force arrow, linked
schematic, gauge, diameter/pressure inputs and load challenge. Anatomy adds labelled
barrel, piston, rod, seals, end caps and chamber orientation. Exploded view separates
illustrative parts; 360 view permits spatial inspection of the same simplified unit.
Camera/separation/pose changes never change computed force, score or completion.

The original SVG and procedural mesh are not copied manufacturer drawings. Parts were
checked against the official source already registered as
`SRC-PARKER-140H8-CYLINDER-2024`, catalog p. 3 (PDF page 5), with force relationships on
catalog p. 26 (PDF page 28). Only generic component identities/relationships are used;
no dimensions, pressure ratings, material specifications, seal selections or servicing
sequence are imported. These new visual interpretations still require independent
engineering review. Source checking is not approval for student use.

Existing calculations remain `EQ-HYD-PISTON-AREA-DIAMETER-001` and
`EQ-FLUID-FORCE-PRESSURE-AREA-001`. Display conversions continue through engineering-core.
This is the cap-end extension model only; no rod-side, load-motion, flow, speed, friction,
leakage, buckling or machine-capacity calculation is introduced. The animated inspection
pose is labelled illustrative and does not establish a predicted stroke or velocity.

## Bernoulli Flow Lab

Standard preserves the current lesson. Aerial view reframes the same horizontal,
two-section pipe: upstream/downstream pressure and velocity, shared zero-elevation datum,
direction arrows, contraction and linked P1/P2 pressure selection. Display values come
from the existing lesson model. It does not invent a wider plant, elevation variation,
pipe losses, extra fittings or new flow equations. Existing source references, assumptions
and engineering-review-required status remain in the structured lesson.

## Review Checklist

- Confirm selected view is supported and private/public authority remains fail-closed.
- Compare every numeric output with the unchanged model at zero, default and boundaries.
- Confirm anatomy/assembly shapes do not suggest a manufacturer-specific construction.
- Check 320/375/430 px, desktop, both themes, keyboard, zoom and reduced motion.
- Check labels and text alternatives without colour or animation.
- Check live equation, observation, challenge and assessment protections remain intact.
- Check renderer cleanup, fallback, lazy download and sustained input responsiveness.
- Record human visual/engineering acceptance before any advanced student-view release.

Prompt 51 is a frontend implementation, not new engineering approval or a production release.
