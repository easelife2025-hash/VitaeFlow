import { jsPDF } from 'jspdf';
import { ResumeDraft, resolveResumeColors } from './types';

export interface AdaptiveRhythm {
  densityTier: 'spacious' | 'balanced' | 'compact';
  sectionGapMm: number;
  headingBottomGapMm: number;
  entryGapMm: number;
  bulletGapMm: number;
  lineHeightMm: number;
  bodyFontPt: number;
  subheadFontPt: number;
  sectionFontPt: number;
  nameFontPt: number;
  roleFontPt: number;
}

export function computeAdaptiveRhythm(resume: ResumeDraft): AdaptiveRhythm {
  const expCount = resume.experience?.length || 0;
  const expBullets = (resume.experience || []).reduce(
    (acc, e) => acc + (e.bullets?.filter((b) => b.trim()).length || 0),
    0
  );
  const projCount = resume.projects?.length || 0;
  const projBullets = (resume.projects || []).reduce(
    (acc, p) => acc + (p.bullets?.filter((b) => b.trim()).length || 0),
    0
  );
  const eduCount = resume.education?.length || 0;
  const certCount = resume.certifications?.length || 0;
  const langCount = resume.languages?.length || 0;
  const summaryChars = resume.personalInfo?.summary?.trim().length || 0;

  // Estimate content weight
  const weight =
    expCount * 4 +
    expBullets * 2.5 +
    projCount * 3 +
    projBullets * 2 +
    eduCount * 2.5 +
    certCount * 1.5 +
    langCount * 1 +
    Math.ceil(summaryChars / 100) * 1.5;

  if (resume.compactMode || weight > 34) {
    return {
      densityTier: 'compact',
      sectionGapMm: 6.5,
      headingBottomGapMm: 4.5,
      entryGapMm: 4.5,
      bulletGapMm: 2.0,
      lineHeightMm: 4.8,
      bodyFontPt: 10.5,
      subheadFontPt: 11.5,
      sectionFontPt: 10.5,
      nameFontPt: 22,
      roleFontPt: 12,
    };
  }

  if (weight <= 22) {
    return {
      densityTier: 'spacious',
      sectionGapMm: 10.2,
      headingBottomGapMm: 5.8,
      entryGapMm: 6.2,
      bulletGapMm: 2.8,
      lineHeightMm: 5.4,
      bodyFontPt: 11.2,
      subheadFontPt: 12.2,
      sectionFontPt: 11,
      nameFontPt: 25,
      roleFontPt: 13,
    };
  }

  return {
    densityTier: 'balanced',
    sectionGapMm: 8.2,
    headingBottomGapMm: 5.2,
    entryGapMm: 5.5,
    bulletGapMm: 2.4,
    lineHeightMm: 5.1,
    bodyFontPt: 10.8,
    subheadFontPt: 11.8,
    sectionFontPt: 10.8,
    nameFontPt: 24,
    roleFontPt: 12.5,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = (hex || '#6D5CE8').replace('#', '');
  if (clean.length !== 6) return [109, 92, 232];
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function tintRgb(
  rgb: [number, number, number],
  alpha: number
): [number, number, number] {
  return [
    Math.round(255 - (255 - rgb[0]) * alpha),
    Math.round(255 - (255 - rgb[1]) * alpha),
    Math.round(255 - (255 - rgb[2]) * alpha),
  ];
}

function getBasePdfFont(resume: ResumeDraft): 'helvetica' | 'times' {
  if (
    resume.fontFamily === 'playfair' ||
    resume.templateId === 'elegant-editorial'
  ) {
    return 'times';
  }
  return 'helvetica';
}

function tryDrawProfilePhoto(
  doc: jsPDF,
  resume: ResumeDraft,
  x: number,
  y: number,
  sizeMm: number,
  borderColorRgb: [number, number, number]
): boolean {
  const p = resume.personalInfo;
  if (!p.photoUrl || p.photoShape === 'hidden') return false;
  try {
    doc.addImage(p.photoUrl, 'JPEG', x, y, sizeMm, sizeMm);
    doc.setDrawColor(borderColorRgb[0], borderColorRgb[1], borderColorRgb[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, sizeMm, sizeMm, p.photoShape === 'square' ? 2 : sizeMm / 2, p.photoShape === 'square' ? 2 : sizeMm / 2, 'S');
    return true;
  } catch {
    return false;
  }
}

function renderModernVioletPdf(
  doc: jsPDF,
  resume: ResumeDraft,
  rhythm: AdaptiveRhythm
) {
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  const colors = resolveResumeColors(resume);
  const primary = hexToRgb(colors.primary);
  const accent = hexToRgb(colors.accent);
  const heading = hexToRgb(colors.heading);
  const softTint = tintRgb(primary, 0.06);
  const font = getBasePdfFont(resume);

  let y = 0;

  // Top decorative primary bar across the A4 top edge
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageWidth, 3.2, 'F');

  // Soft tinted header background band
  doc.setFillColor(softTint[0], softTint[1], softTint[2]);
  doc.rect(0, 3.2, pageWidth, 36, 'F');

  y = 16;
  const p = resume.personalInfo;
  const hasPhoto = Boolean(p.photoUrl && p.photoShape !== 'hidden');
  const headerTextWidth = hasPhoto ? contentWidth - 26 : contentWidth;

  if (hasPhoto) {
    tryDrawProfilePhoto(doc, resume, pageWidth - marginX - 22, 8.5, 22, primary);
  }

  doc.setFont(font, 'bold');
  doc.setFontSize(rhythm.nameFontPt);
  doc.setTextColor(heading[0], heading[1], heading[2]);
  doc.text(p.fullName || 'Your Name', marginX, y);
  y += 7.2;

  if (p.jobTitle) {
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.roleFontPt);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(p.jobTitle, marginX, y);
    y += 6.2;
  }

  const contactParts = [
    p.email,
    p.phone,
    p.location,
    p.website,
    p.linkedin,
  ].filter((item) => item && item.trim().length > 0);

  if (contactParts.length > 0) {
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const contactLine = contactParts.join('   •   ');
    const wrappedContact = doc.splitTextToSize(contactLine, headerTextWidth);
    doc.text(wrappedContact, marginX, y);
    y += wrappedContact.length * 4.6;
  }

  y = Math.max(y + 4, 39.2);
  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.6);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += rhythm.sectionGapMm;

  const checkPageBreak = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      doc.addPage();
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, pageWidth, 2, 'F');
      y = 18;
    }
  };

  const drawModernSectionHeading = (title: string) => {
    checkPageBreak(15);
    doc.setFillColor(primary[0], primary[1], primary[2]);
    doc.rect(marginX, y - 3.6, 2.2, 4.6, 'F');

    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.sectionFontPt);
    doc.setTextColor(heading[0], heading[1], heading[2]);
    doc.text(title.toUpperCase(), marginX + 4.5, y);

    y += 2.2;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.35);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += rhythm.headingBottomGapMm;
  };

  if (p.summary && p.summary.trim()) {
    drawModernSectionHeading('Professional Summary');
    doc.setFont(font, 'normal');
    doc.setFontSize(rhythm.bodyFontPt);
    doc.setTextColor(39, 39, 42);
    const lines = doc.splitTextToSize(p.summary.trim(), contentWidth);
    checkPageBreak(lines.length * rhythm.lineHeightMm + 4);
    doc.text(lines, marginX, y);
    y += lines.length * rhythm.lineHeightMm + rhythm.sectionGapMm - 2;
  }

  if (resume.skills && resume.skills.length > 0) {
    drawModernSectionHeading('Core Competencies & Technical Skills');
    const cols = 3;
    const colWidth = contentWidth / cols;
    const rows = Math.ceil(resume.skills.length / cols);
    checkPageBreak(rows * 6.2 + 4);

    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.bodyFontPt - 0.3);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        if (idx >= resume.skills.length) break;
        const skill = resume.skills[idx];
        const cellX = marginX + c * colWidth;

        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.circle(cellX + 1.2, y - 1.2, 0.9, 'F');

        doc.setTextColor(24, 24, 27);
        const clipped = doc.splitTextToSize(skill, colWidth - 6)[0] || skill;
        doc.text(clipped, cellX + 4, y);
      }
      y += 6.0;
    }
    y += rhythm.sectionGapMm - 3.5;
  }

  if (resume.experience && resume.experience.length > 0) {
    drawModernSectionHeading('Professional Experience');
    resume.experience.forEach((exp, expIdx) => {
      checkPageBreak(18);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(exp.role || 'Role Title', marginX, y);

      const dateStr = `${exp.startDate || ''} — ${exp.current ? 'Present' : exp.endDate || ''}`.trim();
      doc.setFont(font, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(dateStr, pageWidth - marginX, y, { align: 'right' });
      y += 5.0;

      const companyLine = [exp.company, exp.location]
        .filter(Boolean)
        .join('  •  ');
      if (companyLine) {
        doc.setFont(font, 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(companyLine, marginX, y);
        y += 5.4;
      }

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      for (const bullet of exp.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, contentWidth - 6);
        checkPageBreak(bLines.length * rhythm.lineHeightMm + 2);
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.circle(marginX + 1.5, y - 1.3, 0.85, 'F');
        doc.text(bLines, marginX + 5.2, y);
        y += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }

      if (expIdx < resume.experience.length - 1) {
        y += rhythm.entryGapMm - 2;
      }
    });
    y += rhythm.sectionGapMm - 1.5;
  }

  if (resume.projects && resume.projects.length > 0) {
    drawModernSectionHeading('Selected Projects & Key Initiatives');
    resume.projects.forEach((proj, pIdx) => {
      checkPageBreak(15);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.3);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      const projHeader = [proj.name, proj.subtitle]
        .filter(Boolean)
        .join('  —  ');
      doc.text(projHeader, marginX, y);

      if (proj.link) {
        doc.setFont(font, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(proj.link, pageWidth - marginX, y, { align: 'right' });
      }
      y += 5.2;

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      for (const bullet of proj.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, contentWidth - 6);
        checkPageBreak(bLines.length * rhythm.lineHeightMm + 2);
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.circle(marginX + 1.5, y - 1.3, 0.85, 'F');
        doc.text(bLines, marginX + 5.2, y);
        y += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }

      if (pIdx < resume.projects.length - 1) {
        y += rhythm.entryGapMm - 2;
      }
    });
    y += rhythm.sectionGapMm - 1.5;
  }

  if (resume.education && resume.education.length > 0) {
    drawModernSectionHeading('Education');
    resume.education.forEach((edu, eIdx) => {
      checkPageBreak(14);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.3);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(edu.institution || 'Institution', marginX, y);

      const eduDates = [edu.startDate, edu.endDate]
        .filter(Boolean)
        .join(' — ');
      doc.setFont(font, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(eduDates, pageWidth - marginX, y, { align: 'right' });
      y += 5.0;

      const degLine = [
        [edu.degree, edu.field].filter(Boolean).join(' in '),
        edu.location,
        edu.gpa ? `GPA: ${edu.gpa}` : '',
      ]
        .filter(Boolean)
        .join('  •  ');
      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(51, 65, 85);
      doc.text(degLine, marginX, y);
      y += eIdx < resume.education.length - 1 ? 6.5 : 4.5;
    });
    y += rhythm.sectionGapMm - 2.5;
  }

  const certs = resume.certifications || [];
  const langs = resume.languages || [];
  if (certs.length > 0 || langs.length > 0) {
    if (certs.length > 0) {
      drawModernSectionHeading('Certifications');
      certs.forEach((cert) => {
        checkPageBreak(10);
        doc.setFont(font, 'bold');
        doc.setFontSize(rhythm.bodyFontPt);
        doc.setTextColor(heading[0], heading[1], heading[2]);
        doc.text(cert.name, marginX, y);
        const rightMeta = [cert.issuer, cert.date].filter(Boolean).join(' · ');
        doc.setFont(font, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(rightMeta, pageWidth - marginX, y, { align: 'right' });
        y += 5.5;
      });
      y += 3;
    }
    if (langs.length > 0) {
      drawModernSectionHeading('Languages');
      const langLine = langs
        .map((l) => `${l.language} (${l.proficiency})`)
        .join('   •   ');
      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      doc.text(langLine, marginX, y);
    }
  }
}

function renderExecutiveMinimalPdf(
  doc: jsPDF,
  resume: ResumeDraft,
  rhythm: AdaptiveRhythm,
  isElegant = false
) {
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  const centerX = pageWidth / 2;
  const colors = resolveResumeColors(resume);
  const primary = hexToRgb(colors.primary);
  const accent = hexToRgb(colors.accent);
  const heading = hexToRgb(colors.heading);
  const font = isElegant ? 'times' : getBasePdfFont(resume);
  const p = resume.personalInfo;

  let y = 18;

  if (p.photoUrl && p.photoShape !== 'hidden') {
    const drew = tryDrawProfilePhoto(doc, resume, centerX - 10, 12, 20, primary);
    if (drew) {
      y = 38;
    }
  }

  doc.setFont(font, 'bold');
  doc.setFontSize(rhythm.nameFontPt + 1);
  doc.setTextColor(heading[0], heading[1], heading[2]);
  doc.text(p.fullName || 'Your Name', centerX, y, { align: 'center' });
  y += 6.8;

  if (p.jobTitle) {
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.roleFontPt);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(p.jobTitle.toUpperCase(), centerX, y, { align: 'center' });
    y += 5.8;
  }

  const contactParts = [
    p.location,
    p.email,
    p.phone,
    p.linkedin,
    p.website,
  ].filter((item) => item && item.trim().length > 0);

  if (contactParts.length > 0) {
    doc.setFont(font, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(82, 82, 91);
    const contactStr = contactParts.join('   ·   ');
    const wrapped = doc.splitTextToSize(contactStr, contentWidth);
    doc.text(wrapped, centerX, y, { align: 'center' });
    y += wrapped.length * 4.5 + 2;
  }

  doc.setDrawColor(primary[0], primary[1], primary[2]);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineWidth(0.2);
  doc.line(marginX, y + 1.2, pageWidth - marginX, y + 1.2);
  y += rhythm.sectionGapMm;

  const checkPageBreak = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  const drawExecutiveHeading = (title: string) => {
    checkPageBreak(14);
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.sectionFontPt);
    doc.setTextColor(heading[0], heading[1], heading[2]);
    if (isElegant) {
      doc.text(`—  ${title.toUpperCase()}  —`, centerX, y, {
        align: 'center',
      });
    } else {
      doc.text(title.toUpperCase(), marginX, y);
    }
    y += 2.0;
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(0.3);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += rhythm.headingBottomGapMm;
  };

  if (p.summary && p.summary.trim()) {
    doc.setFont(font, isElegant ? 'italic' : 'normal');
    doc.setFontSize(rhythm.bodyFontPt);
    doc.setTextColor(51, 65, 85);
    const lines = doc.splitTextToSize(p.summary.trim(), contentWidth - 10);
    checkPageBreak(lines.length * rhythm.lineHeightMm + 4);
    doc.text(lines, centerX, y, { align: 'center' });
    y += lines.length * rhythm.lineHeightMm + rhythm.sectionGapMm - 1;
  }

  if (resume.experience && resume.experience.length > 0) {
    drawExecutiveHeading('Professional Experience');
    resume.experience.forEach((exp, idx) => {
      checkPageBreak(18);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(`${exp.company} — ${exp.role}`, marginX, y);

      const dateLoc = [
        exp.location,
        `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`,
      ]
        .filter(Boolean)
        .join(' · ');
      doc.setFont(font, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(dateLoc, pageWidth - marginX, y, { align: 'right' });
      y += 5.8;

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      for (const bullet of exp.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, contentWidth - 6);
        checkPageBreak(bLines.length * rhythm.lineHeightMm + 2);
        doc.text('•', marginX + 1, y);
        doc.text(bLines, marginX + 5.2, y);
        y += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }

      if (idx < resume.experience.length - 1) {
        y += rhythm.entryGapMm - 2;
      }
    });
    y += rhythm.sectionGapMm - 1.5;
  }

  if (resume.projects && resume.projects.length > 0) {
    drawExecutiveHeading('Key Projects');
    resume.projects.forEach((proj, idx) => {
      checkPageBreak(14);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.3);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(
        [proj.name, proj.subtitle].filter(Boolean).join(' · '),
        marginX,
        y
      );
      if (proj.link) {
        doc.setFont(font, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(proj.link, pageWidth - marginX, y, { align: 'right' });
      }
      y += 5.2;

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      for (const bullet of proj.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, contentWidth - 6);
        checkPageBreak(bLines.length * rhythm.lineHeightMm + 2);
        doc.text('•', marginX + 1, y);
        doc.text(bLines, marginX + 5.2, y);
        y += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }
      if (idx < resume.projects.length - 1) {
        y += rhythm.entryGapMm - 2;
      }
    });
    y += rhythm.sectionGapMm - 1.5;
  }

  if (resume.education && resume.education.length > 0) {
    drawExecutiveHeading('Education');
    resume.education.forEach((edu) => {
      checkPageBreak(12);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.3);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(edu.institution, marginX, y);

      doc.setFont(font, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${edu.startDate} – ${edu.endDate}`,
        pageWidth - marginX,
        y,
        { align: 'right' }
      );
      y += 5.0;

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(51, 65, 85);
      doc.text(
        [
          `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
          edu.gpa ? `GPA: ${edu.gpa}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
        marginX,
        y
      );
      y += 6.0;
    });
    y += rhythm.sectionGapMm - 3;
  }

  if (resume.skills && resume.skills.length > 0) {
    drawExecutiveHeading('Technical & Domain Skills');
    doc.setFont(font, 'normal');
    doc.setFontSize(rhythm.bodyFontPt);
    doc.setTextColor(39, 39, 42);
    const skillLines = doc.splitTextToSize(
      resume.skills.join('   ·   '),
      contentWidth
    );
    checkPageBreak(skillLines.length * rhythm.lineHeightMm + 3);
    doc.text(skillLines, marginX, y);
    y += skillLines.length * rhythm.lineHeightMm + rhythm.sectionGapMm - 2;
  }

  const certs = resume.certifications || [];
  const langs = resume.languages || [];
  if (certs.length > 0 || langs.length > 0) {
    checkPageBreak(22);
    if (certs.length > 0) {
      drawExecutiveHeading('Certifications');
      certs.forEach((c) => {
        doc.setFont(font, 'bold');
        doc.setFontSize(rhythm.bodyFontPt);
        doc.setTextColor(heading[0], heading[1], heading[2]);
        doc.text(`${c.name} — ${c.issuer}`, marginX, y);
        if (c.date) {
          doc.setFont(font, 'normal');
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.text(c.date, pageWidth - marginX, y, { align: 'right' });
        }
        y += 5.5;
      });
      y += 3;
    }
    if (langs.length > 0) {
      drawExecutiveHeading('Languages');
      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      doc.text(
        langs.map((l) => `${l.language} (${l.proficiency})`).join('   ·   '),
        marginX,
        y
      );
    }
  }
}

function renderTealSplitPdf(
  doc: jsPDF,
  resume: ResumeDraft,
  rhythm: AdaptiveRhythm
) {
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const colors = resolveResumeColors(resume);
  const primary = hexToRgb(colors.primary);
  const accent = hexToRgb(colors.accent);
  const heading = hexToRgb(colors.heading);
  const sidebarTint = tintRgb(primary, 0.05);
  const font = getBasePdfFont(resume);
  const p = resume.personalInfo;

  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageWidth, 3, 'F');

  let nameX = marginX;
  if (p.photoUrl && p.photoShape !== 'hidden') {
    const drew = tryDrawProfilePhoto(doc, resume, marginX, 8, 18, primary);
    if (drew) {
      nameX = marginX + 22;
    }
  }

  const headerY = 17;
  doc.setFont(font, 'bold');
  doc.setFontSize(rhythm.nameFontPt);
  doc.setTextColor(heading[0], heading[1], heading[2]);
  doc.text(p.fullName || 'Your Name', nameX, headerY);

  if (p.jobTitle) {
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.roleFontPt);
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.text(p.jobTitle, nameX, headerY + 6.5);
  }

  let contactY = 14;
  doc.setFont(font, 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  if (p.email) {
    doc.text(p.email, pageWidth - marginX, contactY, { align: 'right' });
    contactY += 4.5;
  }
  if (p.phone) {
    doc.text(p.phone, pageWidth - marginX, contactY, { align: 'right' });
    contactY += 4.5;
  }
  const locWeb = [p.location, p.website || p.linkedin]
    .filter(Boolean)
    .join(' · ');
  if (locWeb) {
    doc.text(locWeb, pageWidth - marginX, contactY, { align: 'right' });
    contactY += 4.5;
  }

  const splitTopY = 33;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(marginX, splitTopY, pageWidth - marginX, splitTopY);

  const leftX = marginX;
  const leftW = 112;
  const rightX = marginX + leftW + 8;
  const rightW = pageWidth - rightX - marginX;

  doc.setFillColor(sidebarTint[0], sidebarTint[1], sidebarTint[2]);
  doc.rect(
    rightX - 4,
    splitTopY + 2,
    rightW + 8,
    pageHeight - splitTopY - 14,
    'F'
  );
  doc.setDrawColor(226, 232, 240);
  doc.line(rightX - 4, splitTopY + 2, rightX - 4, pageHeight - 12);

  let leftY = splitTopY + 8;

  const drawLeftHeading = (title: string) => {
    if (leftY + 15 > pageHeight - 16) {
      doc.addPage();
      leftY = 18;
    }
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.sectionFontPt);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(title.toUpperCase(), leftX, leftY);
    leftY += 2.0;
    doc.setDrawColor(226, 232, 240);
    doc.line(leftX, leftY, leftX + leftW, leftY);
    leftY += rhythm.headingBottomGapMm;
  };

  if (p.summary && p.summary.trim()) {
    drawLeftHeading('Profile Summary');
    doc.setFont(font, 'normal');
    doc.setFontSize(rhythm.bodyFontPt);
    doc.setTextColor(39, 39, 42);
    const lines = doc.splitTextToSize(p.summary.trim(), leftW);
    doc.text(lines, leftX, leftY);
    leftY += lines.length * rhythm.lineHeightMm + rhythm.sectionGapMm - 1;
  }

  if (resume.experience && resume.experience.length > 0) {
    drawLeftHeading('Work Experience');
    resume.experience.forEach((exp, idx) => {
      if (leftY + 18 > pageHeight - 16) {
        doc.addPage();
        leftY = 18;
      }
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.2);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(exp.role || 'Role', leftX, leftY);

      doc.setFont(font, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`,
        leftX + leftW,
        leftY,
        { align: 'right' }
      );
      leftY += 4.8;

      doc.setFont(font, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(
        [exp.company, exp.location].filter(Boolean).join(' · '),
        leftX,
        leftY
      );
      leftY += 5.2;

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt - 0.2);
      doc.setTextColor(39, 39, 42);
      for (const bullet of exp.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, leftW - 5);
        if (leftY + bLines.length * rhythm.lineHeightMm > pageHeight - 16) {
          doc.addPage();
          leftY = 18;
        }
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.circle(leftX + 1.2, leftY - 1.2, 0.8, 'F');
        doc.text(bLines, leftX + 4.5, leftY);
        leftY += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }

      if (idx < resume.experience.length - 1) {
        leftY += rhythm.entryGapMm - 2;
      }
    });
    leftY += rhythm.sectionGapMm - 1.5;
  }

  if (resume.projects && resume.projects.length > 0) {
    drawLeftHeading('Selected Projects');
    resume.projects.forEach((proj) => {
      if (leftY + 15 > pageHeight - 16) {
        doc.addPage();
        leftY = 18;
      }
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.4);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(proj.name, leftX, leftY);
      if (proj.link) {
        doc.setFont(font, 'normal');
        doc.setFontSize(9);
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(proj.link, leftX + leftW, leftY, { align: 'right' });
      }
      leftY += 4.6;

      if (proj.subtitle) {
        doc.setFont(font, 'normal');
        doc.setFontSize(9.8);
        doc.setTextColor(71, 85, 105);
        doc.text(proj.subtitle, leftX, leftY);
        leftY += 4.8;
      }

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt - 0.2);
      doc.setTextColor(39, 39, 42);
      for (const bullet of proj.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, leftW - 5);
        doc.setFillColor(primary[0], primary[1], primary[2]);
        doc.circle(leftX + 1.2, leftY - 1.2, 0.8, 'F');
        doc.text(bLines, leftX + 4.5, leftY);
        leftY += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }
      leftY += 3;
    });
  }

  doc.setPage(1);
  let rightY = splitTopY + 8;

  const drawRightHeading = (title: string) => {
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.sectionFontPt - 0.4);
    doc.setTextColor(primary[0], primary[1], primary[2]);
    doc.text(title.toUpperCase(), rightX, rightY);
    rightY += 2.0;
    doc.setDrawColor(203, 213, 225);
    doc.line(rightX, rightY, rightX + rightW, rightY);
    rightY += 5.0;
  };

  if (resume.skills && resume.skills.length > 0) {
    drawRightHeading('Skills & Stack');
    doc.setFont(font, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(24, 24, 27);
    resume.skills.forEach((skill) => {
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.circle(rightX + 1.2, rightY - 1.1, 0.75, 'F');
      const sLines = doc.splitTextToSize(skill, rightW - 4);
      doc.text(sLines, rightX + 3.8, rightY);
      rightY += sLines.length * 4.8;
    });
    rightY += 5.5;
  }

  if (resume.education && resume.education.length > 0) {
    drawRightHeading('Education');
    resume.education.forEach((edu) => {
      doc.setFont(font, 'bold');
      doc.setFontSize(10.2);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      const instLines = doc.splitTextToSize(edu.institution, rightW);
      doc.text(instLines, rightX, rightY);
      rightY += instLines.length * 4.5;

      doc.setFont(font, 'normal');
      doc.setFontSize(9.8);
      doc.setTextColor(51, 65, 85);
      const degLines = doc.splitTextToSize(
        `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
        rightW
      );
      doc.text(degLines, rightX, rightY);
      rightY += degLines.length * 4.4;

      doc.setFont(font, 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(100, 116, 139);
      doc.text(`${edu.startDate} – ${edu.endDate}`, rightX, rightY);
      rightY += 4.2;
      if (edu.gpa) {
        doc.text(`GPA: ${edu.gpa}`, rightX, rightY);
        rightY += 4.2;
      }
      rightY += 3.5;
    });
    rightY += 3;
  }

  const certs = resume.certifications || [];
  if (certs.length > 0) {
    drawRightHeading('Certifications');
    certs.forEach((cert) => {
      doc.setFont(font, 'bold');
      doc.setFontSize(9.8);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      const cLines = doc.splitTextToSize(cert.name, rightW);
      doc.text(cLines, rightX, rightY);
      rightY += cLines.length * 4.4;

      doc.setFont(font, 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(100, 116, 139);
      doc.text(
        [cert.issuer, cert.date].filter(Boolean).join(' · '),
        rightX,
        rightY
      );
      rightY += 5.5;
    });
    rightY += 3;
  }

  const langs = resume.languages || [];
  if (langs.length > 0) {
    drawRightHeading('Languages');
    langs.forEach((lang) => {
      doc.setFont(font, 'bold');
      doc.setFontSize(9.8);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(lang.language, rightX, rightY);
      rightY += 4.2;
      doc.setFont(font, 'normal');
      doc.setFontSize(9.2);
      doc.setTextColor(100, 116, 139);
      doc.text(lang.proficiency, rightX, rightY);
      rightY += 5.5;
    });
  }
}

function renderCreativeStudioPdf(
  doc: jsPDF,
  resume: ResumeDraft,
  rhythm: AdaptiveRhythm
) {
  const pageWidth = 210;
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  const colors = resolveResumeColors(resume);
  const primary = hexToRgb(colors.primary);
  const p = resume.personalInfo;
  const font = getBasePdfFont(resume);

  // Solid primary header block
  doc.setFillColor(primary[0], primary[1], primary[2]);
  doc.rect(0, 0, pageWidth, 42, 'F');

  if (p.photoUrl && p.photoShape !== 'hidden') {
    tryDrawProfilePhoto(
      doc,
      resume,
      pageWidth - marginX - 24,
      9,
      24,
      [255, 255, 255]
    );
  }

  doc.setFont(font, 'bold');
  doc.setFontSize(rhythm.nameFontPt);
  doc.setTextColor(255, 255, 255);
  doc.text(p.fullName || 'Your Name', marginX, 17);

  if (p.jobTitle) {
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.roleFontPt);
    doc.setTextColor(240, 240, 255);
    doc.text(p.jobTitle, marginX, 24);
  }

  const contactParts = [
    p.email,
    p.phone,
    p.location,
    p.website,
    p.linkedin,
  ].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont(font, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(235, 235, 245);
    doc.text(
      doc.splitTextToSize(contactParts.join('  •  '), contentWidth - 28),
      marginX,
      31
    );
  }

  // Delegate body rendering below header using Modern renderer structure
  renderModernVioletPdfBodyOnly(doc, resume, rhythm, 50);
}

function renderModernVioletPdfBodyOnly(
  doc: jsPDF,
  resume: ResumeDraft,
  rhythm: AdaptiveRhythm,
  startY: number
) {
  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 18;
  const contentWidth = pageWidth - marginX * 2;
  const colors = resolveResumeColors(resume);
  const primary = hexToRgb(colors.primary);
  const accent = hexToRgb(colors.accent);
  const heading = hexToRgb(colors.heading);
  const font = getBasePdfFont(resume);
  const p = resume.personalInfo;

  let y = startY;

  const checkPageBreak = (neededMm: number) => {
    if (y + neededMm > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  const drawSectionHeading = (title: string) => {
    checkPageBreak(15);
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.rect(marginX, y - 3.4, 2.5, 4.2, 'F');
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.sectionFontPt);
    doc.setTextColor(heading[0], heading[1], heading[2]);
    doc.text(title.toUpperCase(), marginX + 4.8, y);
    y += 2.2;
    doc.setDrawColor(primary[0], primary[1], primary[2]);
    doc.setLineWidth(0.35);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += rhythm.headingBottomGapMm;
  };

  if (p.summary && p.summary.trim()) {
    drawSectionHeading('Professional Summary');
    doc.setFont(font, 'normal');
    doc.setFontSize(rhythm.bodyFontPt);
    doc.setTextColor(39, 39, 42);
    const lines = doc.splitTextToSize(p.summary.trim(), contentWidth);
    checkPageBreak(lines.length * rhythm.lineHeightMm + 4);
    doc.text(lines, marginX, y);
    y += lines.length * rhythm.lineHeightMm + rhythm.sectionGapMm - 2;
  }

  if (resume.skills && resume.skills.length > 0) {
    drawSectionHeading('Core Capabilities & Skills');
    doc.setFont(font, 'bold');
    doc.setFontSize(rhythm.bodyFontPt);
    doc.setTextColor(heading[0], heading[1], heading[2]);
    const skillStr = resume.skills.join('   •   ');
    const sLines = doc.splitTextToSize(skillStr, contentWidth);
    checkPageBreak(sLines.length * rhythm.lineHeightMm + 3);
    doc.text(sLines, marginX, y);
    y += sLines.length * rhythm.lineHeightMm + rhythm.sectionGapMm - 2;
  }

  if (resume.experience && resume.experience.length > 0) {
    drawSectionHeading('Professional Experience');
    resume.experience.forEach((exp, expIdx) => {
      checkPageBreak(18);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(exp.role || 'Role Title', marginX, y);

      const dateStr = `${exp.startDate || ''} — ${exp.current ? 'Present' : exp.endDate || ''}`.trim();
      doc.setFont(font, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(dateStr, pageWidth - marginX, y, { align: 'right' });
      y += 5.0;

      const companyLine = [exp.company, exp.location]
        .filter(Boolean)
        .join('  •  ');
      if (companyLine) {
        doc.setFont(font, 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(primary[0], primary[1], primary[2]);
        doc.text(companyLine, marginX, y);
        y += 5.4;
      }

      doc.setFont(font, 'normal');
      doc.setFontSize(rhythm.bodyFontPt);
      doc.setTextColor(39, 39, 42);
      for (const bullet of exp.bullets || []) {
        const clean = bullet.trim();
        if (!clean) continue;
        const bLines = doc.splitTextToSize(clean, contentWidth - 6);
        checkPageBreak(bLines.length * rhythm.lineHeightMm + 2);
        doc.setFillColor(accent[0], accent[1], accent[2]);
        doc.circle(marginX + 1.5, y - 1.3, 0.85, 'F');
        doc.text(bLines, marginX + 5.2, y);
        y += bLines.length * rhythm.lineHeightMm + rhythm.bulletGapMm - 1.2;
      }
      if (expIdx < resume.experience.length - 1) {
        y += rhythm.entryGapMm - 2;
      }
    });
    y += rhythm.sectionGapMm - 1.5;
  }

  if (resume.education && resume.education.length > 0) {
    drawSectionHeading('Education');
    resume.education.forEach((edu) => {
      checkPageBreak(12);
      doc.setFont(font, 'bold');
      doc.setFontSize(rhythm.subheadFontPt - 0.3);
      doc.setTextColor(heading[0], heading[1], heading[2]);
      doc.text(edu.institution, marginX, y);
      doc.setFont(font, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`${edu.startDate} – ${edu.endDate}`, pageWidth - marginX, y, {
        align: 'right',
      });
      y += 5;
      doc.setTextColor(51, 65, 85);
      doc.text(
        [
          `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`,
          edu.gpa ? `GPA: ${edu.gpa}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
        marginX,
        y
      );
      y += 6;
    });
  }
}

export function downloadResumePdf(resume: ResumeDraft) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const rhythm = computeAdaptiveRhythm(resume);

  if (resume.templateId === 'executive-minimal') {
    renderExecutiveMinimalPdf(doc, resume, rhythm, false);
  } else if (resume.templateId === 'elegant-editorial') {
    renderExecutiveMinimalPdf(doc, resume, rhythm, true);
  } else if (resume.templateId === 'teal-split') {
    renderTealSplitPdf(doc, resume, rhythm);
  } else if (resume.templateId === 'creative-studio') {
    renderCreativeStudioPdf(doc, resume, rhythm);
  } else if (resume.templateId === 'professional-ats') {
    renderExecutiveMinimalPdf(doc, resume, rhythm, false);
  } else {
    renderModernVioletPdf(doc, resume, rhythm);
  }

  const safeFilename =
    (resume.title || resume.personalInfo.fullName || 'resume')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'resume';

  doc.save(`${safeFilename}.pdf`);
}
