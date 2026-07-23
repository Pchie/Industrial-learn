# Manual Accessibility Test Checklist

Use this checklist before releasing major Industrial Learn learning workflows.

## Keyboard

- Tab from the browser chrome through skip link, header navigation and page controls.
- Activate the skip link and confirm focus lands on `main`.
- Check visible focus on links, buttons, summaries, inputs, tabs and custom controls.
- Open and close modals and drawers using keyboard only.
- Confirm focus returns to the opening control.
- Use ArrowLeft, ArrowRight, Home and End in tab lists.
- Complete quiz options without a mouse.
- Adjust sliders and number inputs without dragging.

## Screen Reader

- Confirm page title and first heading describe the route.
- Confirm landmarks are announced clearly.
- Confirm form labels and error messages are announced.
- Confirm progress values have a meaningful label.
- Confirm equations have accessible text labels.
- Confirm diagrams expose alt text or an equivalent description.
- Confirm warnings, fault states and status messages are announced only when useful.

## Visual And Responsive

- Test 320 px, 375 px, 430 px, tablet portrait, tablet landscape, laptop and large desktop widths.
- Test browser zoom at 200%.
- Test long course names, source IDs and validation messages.
- Confirm no horizontal overflow except intentionally scrollable technical tables or diagrams.
- Confirm touch targets remain at least 44 px where practical.
- Confirm dark appearance and light appearance preserve contrast.

## Reduced Motion And Low Data

- Enable reduced motion and confirm smooth scrolling and decorative motion are disabled.
- Confirm simulations remain operable in stepped or static mode when motion is reduced.
- Confirm no large images or animation assets are loaded for placeholder pages.
- Confirm protected pages do not fetch private data until authenticated.
