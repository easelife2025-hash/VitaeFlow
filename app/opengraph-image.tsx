import { ImageResponse } from 'next/og';

export const alt =
  'VitaeFlow – AI Resume Builder, ATS Quality Checker & Job Keyword Matcher';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#090A0F',
          backgroundImage:
            'radial-gradient(circle at 85% 15%, rgba(109, 92, 232, 0.35), transparent 45%), radial-gradient(circle at 15% 85%, rgba(24, 184, 154, 0.25), transparent 45%)',
          padding: '64px 72px',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top Brand Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#6D5CE8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              VF
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '34px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              <span>Vitae</span>
              <span style={{ color: '#6D5CE8' }}>Flow</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(24, 184, 154, 0.16)',
              border: '1px solid rgba(24, 184, 154, 0.4)',
              color: '#18B89A',
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Fact-Safe AI · 1:1 Vector A4 PDF
          </div>
        </div>

        {/* Middle Headline & Subheading */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '980px',
          }}
        >
          <div
            style={{
              fontSize: '60px',
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span>Build an ATS-Friendly Resume</span>
            <span style={{ color: '#8B7CF6' }}>
              With Fact-Safe Gemini AI & Live A4 Preview
            </span>
          </div>
          <div
            style={{
              fontSize: '24px',
              lineHeight: 1.45,
              color: '#CBD5E1',
              maxWidth: '880px',
            }}
          >
            8-Section AI Resume Editor, Deterministic ATS Quality Checker,
            Target Job Keyword Matcher, and 6 Recruiter-Approved A4 Templates.
          </div>
        </div>

        {/* Bottom 4 Feature Cards */}
        <div
          style={{
            display: 'flex',
            gap: '18px',
            width: '100%',
          }}
        >
          {[
            { label: '01. AI Resume Builder', sub: 'Action-Verb Bullet Studio' },
            { label: '02. ATS Quality Audit', sub: '8-Section & Formatting Check' },
            { label: '03. Job Keyword Matcher', sub: 'Resume vs. JD Comparison' },
            { label: '04. Designer A4 Templates', sub: '6 Switchable CV Layouts' },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '18px 20px',
                borderRadius: '18px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.14)',
              }}
            >
              <span
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  color: '#94A3B8',
                }}
              >
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
