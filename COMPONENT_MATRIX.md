# shadcn capability matrix

Source target: current shadcn Base UI component catalog. The framework preserves the UA stylesheet and ports capability, semantics, keyboard behavior, and composition rather than shadcn's visual theme.

## Native HTML / no framework visual component
button, checkbox, dialog, input, kbd, label, native-select, progress, radio-group, select, slider, switch, table, textarea, typography, date-picker

## Native composition / recipes
accordion, alert, alert-dialog, attachment, avatar, breadcrumb, button-group, card, collapsible, drawer, empty, field, form, input-group, item, pagination, popover, sheet, sidebar

## CSS-only capability
aspect-ratio, badge, marker, scroll-area, separator, skeleton, spinner

## Progressive JS behavior
carousel, combobox, command, context-menu, dropdown-menu, hover-card, input-otp, menubar, message-scroller, navigation-menu, questionnaire, resizable, tabs, toast, toggle, toggle-group, tooltip

## Higher-level / optional modules
bubble, calendar, chart, data-table, direction, message

## Porting rule
1. Preserve a native element if one exists.
2. Prefer native declarative APIs: dialog, popover, details/summary, form validation.
3. Add CSS only for a capability the UA stylesheet does not provide.
4. Add JS only for missing state/keyboard behavior.
5. Never port Tailwind aesthetic utilities or shadcn theme tokens into core.
