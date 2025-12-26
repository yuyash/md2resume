/**
 * CSS styles for Rirekisho (履歴書)
 */

import type { LayoutDimensions } from './types.js';

// ============================================================================
// Utility Functions
// ============================================================================

function mm(value: number): string {
  return `${value}mm`;
}

function pt(value: number): string {
  return `${value}pt`;
}

// ============================================================================
// CSS Generation
// ============================================================================

/**
 * Generate complete CSS for the rirekisho document
 */
export function generateCSS(layout: LayoutDimensions): string {
  const {
    paper,
    scale,
    margin,
    marginBottom,
    centerGap,
    pageWidth,
    pageHeight,
    footerHeight,
  } = layout;

  // Content area height (excluding footer)
  const contentHeight = pageHeight - footerHeight;

  return `
/* Reset & Base */
@page {
  size: ${mm(paper.width)} ${mm(paper.height)} landscape;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

body {
  font-family: "Noto Serif JP", "Yu Mincho", "MS Mincho", serif;
  font-size: ${pt(10 * scale)};
  color: #000;
  background: #fff;
}

/* Layout */
.spread {
  width: ${mm(paper.width)};
  height: ${mm(paper.height)};
  display: flex;
  flex-direction: column;
  padding: ${mm(margin)} ${mm(margin)} ${mm(marginBottom)} ${mm(margin)};
  overflow: hidden;
  background: #fff;
}

.spread-content {
  display: flex;
  flex: 1;
  height: ${mm(contentHeight)};
}

.spread-footer {
  height: ${mm(footerHeight)};
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: ${pt(6 * scale)};
}

.page {
  width: ${mm(pageWidth)};
  height: ${mm(contentHeight)};
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page--left {
  margin-right: ${mm(centerGap / 2)};
}

.page--right {
  margin-left: ${mm(centerGap / 2)};
}

/* History container on left page - fills remaining space */
.history-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-container .table-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-container table {
  flex: 1;
}

/* Typography */
.text--title {
  font-size: ${pt(22 * scale)};
  letter-spacing: ${mm(6 * scale)};
  font-weight: bold;
}

.text--name {
  font-size: ${pt(16 * scale)};
}

.text--address {
  font-size: ${pt(12 * scale)};
}

.text--normal {
  font-size: ${pt(10 * scale)};
}

.text--small {
  font-size: ${pt(8 * scale)};
}

.text--xs {
  font-size: ${pt(7 * scale)};
}

.text--xxs {
  font-size: ${pt(6 * scale)};
}

.text--bold {
  font-weight: bold;
}

/* Alignment */
.align--center {
  text-align: center;
}

.align--left {
  text-align: left;
}

.align--right {
  text-align: right;
}

.valign--top {
  vertical-align: top;
}

.valign--middle {
  vertical-align: middle;
}

/* Borders */
.border {
  border: 0.5pt solid #000;
}

/* Spacing */
.pad {
  padding: ${mm(1 * scale)} ${mm(2 * scale)};
}

.pad--sm {
  padding: ${mm(1 * scale)};
}

.mt--sm {
  margin-top: ${mm(layout.tableMargin)};
}

/* Flex utilities */
.flex {
  display: flex;
}

.flex--col {
  flex-direction: column;
}

.flex--1 {
  flex: 1;
}

.flex--center {
  align-items: center;
}

.flex--start {
  align-items: flex-start;
}

.flex--between {
  justify-content: space-between;
}

.flex--end {
  align-items: flex-end;
}

/* Tables */
.table-wrapper {
  display: block;
}

table {
  width: 100%;
  border-collapse: collapse;
}

td, th {
  border: 0.5pt solid #000;
  padding: 0;
  vertical-align: middle;
  font-weight: normal;
}

.col--year {
  width: ${mm(layout.yearColumnWidth)};
}

.col--month {
  width: ${mm(layout.monthColumnWidth)};
}

/* Cell component */
.cell {
  display: flex;
  align-items: center;
  border: 0.5pt solid #000;
  min-height: ${mm(7 * scale)};
}

.cell__label {
  width: ${mm(14 * scale)};
  font-size: ${pt(7 * scale)};
  text-align: center;
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cell__value {
  flex: 1;
  padding: ${mm(1 * scale)} ${mm(2 * scale)};
}

/* Photo box */
.photo-box {
  width: ${mm(30 * scale)};
  height: ${mm(40 * scale)};
  border: 0.5pt dashed #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: ${pt(6 * scale)};
  line-height: 1.4;
  text-align: center;
  padding-top: ${mm(2 * scale)};
  overflow: hidden;
}

/* Photo box with image */
.photo-box--with-image {
  padding: 0;
  border: 0.5pt solid #000;
}

.photo-box--with-image img {
  display: block;
}

/* Section boxes */
.section-box {
  border: 0.5pt solid #000;
  display: flex;
  flex-direction: column;
}

.section-box__header {
  padding: ${mm(1 * scale)};
  border-bottom: 0.5pt solid #000;
  font-size: ${pt(10 * scale)};
  flex-shrink: 0;
}

.section-box__content {
  padding: ${mm(2 * scale)};
  flex: 1;
}

/* Motivation container - 60% of flexible space */
.motivation-container {
  flex: 6;
  display: flex;
  flex-direction: column;
}

.motivation-container .section-box {
  flex: 1;
}

/* Notes container - 40% of flexible space to align with left page */
.notes-container {
  flex: 4;
  display: flex;
  flex-direction: column;
}

.notes-container .section-box {
  flex: 1;
}

/* Print & Screen media */
@media print {
  html, body {
    width: ${mm(paper.width)};
    height: ${mm(paper.height)};
    overflow: hidden !important;
    max-height: ${mm(paper.height)} !important;
  }

  * {
    page-break-inside: avoid;
  }

  .spread {
    page-break-after: always;
    page-break-before: avoid;
  }
}

@media screen {
  html {
    height: 100%;
  }

  body {
    background: #888;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20mm;
  }

  .spread {
    box-shadow: 0 2mm 12mm rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
  }
}
`;
}
