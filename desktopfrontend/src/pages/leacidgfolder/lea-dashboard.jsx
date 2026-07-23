import { useState } from 'react';
import './lea-css.css';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';
import {
  Users,
  Shield,
  Key,
  CheckCircle2
} from 'lucide-react';

function LeaDashboard() {
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  // Line chart dataset initialized to 0
  const lineDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const intakeData = [0, 0, 0, 0, 0, 0, 0];
  const forwardedData = [0, 0, 0, 0, 0, 0, 0];

  // SVG Line Chart math
  const width = 560;
  const height = 240;
  const padX = 40;
  const padY = 25;
  const maxY = 24;

  const getX = (index) => padX + index * ((width - padX * 2) / (lineDays.length - 1));
  const getY = (val) => height - padY - (val / maxY) * (height - padY * 2);

  const intakePoints = intakeData.map((val, i) => ({ x: getX(i), y: getY(val), val, day: lineDays[i] }));
  const forwardedPoints = forwardedData.map((val, i) => ({ x: getX(i), y: getY(val), val, day: lineDays[i] }));

  // Smooth Bezier curve generator
  const createSmoothPath = (pts) => {
    if (!pts.length) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1x = curr.x + (next.x - curr.x) / 2.2;
      const cp1y = curr.y;
      const cp2x = curr.x + (next.x - curr.x) / 2.2;
      const cp2y = next.y;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }
    return d;
  };

  const intakePath = createSmoothPath(intakePoints);
  const forwardedPath = createSmoothPath(forwardedPoints);

  // Donut chart dataset initialized to 0
  const regionCol1 = [
    { id: 'ncr', name: 'NCR', percent: 0, color: '#07476F' },
    { id: 'region7', name: 'Region VII', percent: 0, color: '#14B8A6' },
  ];

  const regionCol2 = [
    { id: 'region4a', name: 'Region IV-A', percent: 0, color: '#0D7685' },
    { id: 'region11', name: 'Region XI', percent: 0, color: '#164E63' },
  ];

  const allRegions = [...regionCol1, ...regionCol2];

  // SVG Donut Math (with segment gaps)
  const radius = 62;
  const circumference = 2 * Math.PI * radius; // ~389.55
  const gap = 0;
  let accumulatedPercent = 0;

  const donutSegments = allRegions.map((reg) => {
    const rawLength = (reg.percent / 100) * circumference;
    const dashLength = rawLength;
    const gapLength = circumference - dashLength;
    const offset = -(accumulatedPercent / 100) * circumference;
    accumulatedPercent += reg.percent;
    return {
      ...reg,
      dashArray: `${dashLength} ${gapLength}`,
      dashOffset: offset
    };
  });

  return (
    <div className='LeaDashboardMain'>
      <Sidebar sidebarType="LEA" />
      <div className='LeaContentContainer'>
        <TopBar />
        <div className='LeaMainfeed'>

          {/* Top 4 Stats Cards */}
          <div className='LeaStatsGrid'>
            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Walk-in intakes</span>
                <div className='statIconSquare navy'>
                  <Users size={18} />
                </div>
              </div>
              <div className='statValue'>0</div>
            </div>

            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Verification requests sent</span>
                <div className='statIconSquare teal'>
                  <Shield size={18} />
                </div>
              </div>
              <div className='statValue'>0</div>

            </div>

            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Field operations</span>
                <div className='statIconSquare navy'>
                  <Key size={18} />
                </div>
              </div>
              <div className='statValue'>0</div>

            </div>

            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Takedowns completed</span>
                <div className='statIconSquare green'>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className='statValue'>0</div>

            </div>
          </div>

          {/* Charts Row */}
          <div className='LeaChartsRow'>

            {/* Left Line Chart Card */}
            <div className='LeaChartCard LineCard'>
              <div className='chartHeader'>
                <div>
                  <h3>Walk-in intake vs Forwarded to FDA</h3>
                  <p className='chartSubtitle'>Last 7 days</p>
                </div>
                <div className='chartLegendInline'>
                  <div className='legendItemInline'>
                    <span className='legendDotNavy'></span>
                    <span>Intake</span>
                  </div>
                  <div className='legendItemInline'>
                    <span className='legendDotTeal'></span>
                    <span>Forwarded</span>
                  </div>
                </div>
              </div>

              {/* Line Chart SVG */}
              <div className='svgChartWrapper'>
                <svg className='interactiveLineSvg' viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">

                  {/* Horizontal Dashed Gridlines */}
                  {[0, 6, 12, 18, 24].map((val) => {
                    const y = getY(val);
                    return (
                      <g key={val}>
                        <line x1={padX} y1={y} x2={width - padX} y2={y} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="1" />
                        <text x={padX - 10} y={y + 4} className='yAxisText'>{val}</text>
                      </g>
                    );
                  })}

                  {/* Smooth Curves (No Gradient Fill as in image) */}
                  <path d={intakePath} fill="none" stroke="#07476F" strokeWidth="2.5" strokeLinecap="round" />
                  <path d={forwardedPath} fill="none" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Points & Day Labels */}
                  {intakePoints.map((pt, i) => {
                    const fPt = forwardedPoints[i];
                    const isHovered = hoveredLineIndex === i;

                    return (
                      <g key={i}>
                        {/* X-axis Day Text */}
                        <text x={pt.x} y={height - 4} className='xAxisText'>{pt.day}</text>

                        {/* Interactive Invisible Hover Zone */}
                        <rect
                          x={pt.x - 22}
                          y={10}
                          width="44"
                          height={height - 30}
                          fill="transparent"
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredLineIndex(i)}
                          onMouseLeave={() => setHoveredLineIndex(null)}
                        />

                        {/* Vertical Guide Line on Hover */}
                        {isHovered && (
                          <line x1={pt.x} y1={20} x2={pt.x} y2={height - 25} stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1.5" />
                        )}

                        {/* Intake Circle Dot */}
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? "5" : "3.5"}
                          fill="#FFFFFF"
                          stroke="#07476F"
                          strokeWidth="2.5"
                          style={{ transition: 'all 0.15s ease' }}
                        />

                        {/* Forwarded Circle Dot */}
                        <circle
                          cx={fPt.x}
                          cy={fPt.y}
                          r={isHovered ? "5" : "3.5"}
                          fill="#FFFFFF"
                          stroke="#14B8A6"
                          strokeWidth="2.5"
                          style={{ transition: 'all 0.15s ease' }}
                        />

                        {/* Tooltip */}
                        {isHovered && (
                          <foreignObject x={Math.min(pt.x - 60, width - 130)} y={Math.max(pt.y - 65, 10)} width="120" height="54">
                            <div className='lineTooltipClean'>
                              <div className='ttDay'>{pt.day}</div>
                              <div className='ttRow navy'>Intake: <strong>{pt.val}</strong></div>
                              <div className='ttRow teal'>Forwarded: <strong>{fPt.val}</strong></div>
                            </div>
                          </foreignObject>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Right Donut Chart Card */}
            <div className='LeaChartCard DonutCard'>
              <div className='chartHeader'>
                <div>
                  <h3>Cases by region</h3>
                  <p className='chartSubtitle'>Walk-in intake distribution</p>
                </div>
              </div>

              {/* Vector Donut Chart */}
              <div className='donutChartContainer'>
                <svg className='donutSvgClean' viewBox="0 0 200 200">
                  {donutSegments.map((seg) => {
                    const isHovered = hoveredRegion === seg.id;
                    return (
                      <circle
                        key={seg.id}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={isHovered ? "34" : "30"}
                        strokeDasharray={seg.dashArray}
                        strokeDashoffset={seg.dashOffset}
                        transform="rotate(-90 100 100)"
                        style={{
                          transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                          cursor: 'pointer',
                          opacity: hoveredRegion && !isHovered ? 0.7 : 1
                        }}
                        onMouseEnter={() => setHoveredRegion(seg.id)}
                        onMouseLeave={() => setHoveredRegion(null)}
                      />
                    );
                  })}
                </svg>
              </div>

              {/* 2-Column Legend Grid Matching Screenshot */}
              <div className='donutLegendGrid'>
                <div className='legendCol'>
                  {regionCol1.map((reg) => (
                    <div
                      key={reg.id}
                      className={`legendRow ${hoveredRegion === reg.id ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredRegion(reg.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <div className='legendLabelGroup'>
                        <span className='dotIndicator' style={{ backgroundColor: reg.color }}></span>
                        <span className='regionName'>{reg.name}</span>
                      </div>
                      <strong className='regionPercent'>{reg.percent}%</strong>
                    </div>
                  ))}
                </div>

                <div className='legendCol'>
                  {regionCol2.map((reg) => (
                    <div
                      key={reg.id}
                      className={`legendRow ${hoveredRegion === reg.id ? 'active' : ''}`}
                      onMouseEnter={() => setHoveredRegion(reg.id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    >
                      <div className='legendLabelGroup'>
                        <span className='dotIndicator' style={{ backgroundColor: reg.color }}></span>
                        <span className='regionName'>{reg.name}</span>
                      </div>
                      <strong className='regionPercent'>{reg.percent}%</strong>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaDashboard;

