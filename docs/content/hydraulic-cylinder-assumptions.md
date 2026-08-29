# Hydraulic Cylinder Visual Lesson Assumptions

## Checked Assumptions

- Pressure is treated as uniform over the circular cap-end piston area.
- The selected case is cap-end extension, so the full circular piston area is used.
- Pressure is supplied internally in Pa, diameter in m, area in m^2, and force in N.
- The force result is ideal theoretical force from `F = pA`.
- The pressure measurement equals the validated cap-end pressure state; no noise or sensor error is invented.
- Source evidence is limited to `SRC-PARKER-140H8-CYLINDER-2024`, `SRC-NIST-SP330-2019`, and the narrow application use of `SRC-CAT-BOOM-CYLINDER-6040431-2026`.

## Educational Assumptions

- 0 to 20 MPa and 25 to 100 mm are bounded lesson controls, not manufacturer ratings.
- 15 kN is an educational challenge target, not a rated load.
- The piston-position change is demonstrative and does not represent a calculated displacement.
- Force-vector length and displayed piston size are normalised visual cues, not scaled physical dimensions.
- The generic pressure-source symbol provides supply context without claiming a particular pump, valve, or circuit design.

## Excluded Physical Effects

The model excludes rod-side annular area, retraction, friction, seal drag, leakage, pressure loss, back pressure, compressibility, temperature, acceleration, impact, side load, buckling, cylinder mounting, linkage geometry, machine structure, load position, component ratings, relief settings, and safety factors.

It also excludes flow rate, piston speed, stroke, and true time progression. A pressurised line is shown; calculated flow is not implied.

## Safety Interpretation

A passing challenge means only that calculated ideal theoretical force meets the educational opposing-force target. It does not mean that a cylinder, machine, attachment, load, or procedure is safe. Real hydraulic work requires authorised supervision, equipment data, risk controls, and a complete engineering assessment.

## Review Limitation

The area and force equations are checked and source-linked. The lesson, visual mapping, interaction ranges, challenge, animation, application illustration, and safety language have not received named independent engineering, educational, and safety approval. The correct status remains `Engineering review required` and publication remains `internal`.
