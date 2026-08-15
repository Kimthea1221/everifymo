import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './lea-css.css';
import Sidebar from '../component/sidebar';
import TopBar from '../component/top-bar';
import {
  AlertTriangle,
  Footprints
} from 'lucide-react';

function LeaDashboard() {
  const navigate = useNavigate();
  const [hoveredLineIndex, setHoveredLineIndex] = useState(null);
  const [hoveredBarGroupIndex, setHoveredBarGroupIndex] = useState(null);

  // Line chart dataset with mock values
  const lineDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const intakeData = [4, 8, 15, 6, 18, 12, 22];
  const forwardedData = [2, 5, 10, 4, 12, 8, 15];

  // SVG Line Chart math
  const width = 800;
  const height = 250;
  const padX = 45;
  const padY = 25;
  const maxY = 24;

  const getX = (index) => padX + index * ((width - padX * 2) / (lineDays.length - 1));
  const getY = (val) => height - padY - (val / maxY) * (height - padY * 2);

  // SVG Bar Chart math & data
  const pipelineData = [
    { label: 'W18', ops: 6, takedowns: 3 },
    { label: 'W19', ops: 9, takedowns: 5 },
    { label: 'W20', ops: 11, takedowns: 8 },
    { label: 'W21', ops: 14, takedowns: 11 }
  ];
  const barPadLeft = 50;
  const barPadRight = 20;
  const padT = 15;
  const maxBarY = 16;
  const plotWidth = width - barPadLeft - barPadRight;
  const groupWidth = plotWidth / pipelineData.length;
  const barWidth = 48; // Width of each column bar
  const barGap = 8;   // Gap between the two bars inside a group

  const getBarY = (val) => height - padY - (val / maxBarY) * (height - padY - padT);
  const getBarHeight = (val) => (val / maxBarY) * (height - padY - padT);

  // Awaiting FDA verification cases mock dataset
  const awaitingFdaCases = [
    {
      id: 1,
      product: "HerbalSlim Capsules",
      manufacturer: "NatureFit Labs",
      caseNumber: "ICM-2025-00185",
      type: "Walk-in"
    }
  ];

  // Recent walk-in complaints mock dataset for dashboard table matching screenshot
  const recentComplaints = [
    {
      id: 'ICM-2025-00185',
      product: 'HerbalSlim Capsules',
      manufacturer: 'NatureFit Labs',
      complainant: 'M. Reyes',
      status: 'pending_verification',
      logged: '2026-05-17 10:42',
    },
    {
      id: 'ICM-2025-00187',
      product: 'PureVita Multivitamin',
      manufacturer: 'Vita Manufacturing Inc.',
      complainant: 'J. Cruz',
      status: 'verified',
      logged: '2026-05-16 11:21',
    },
    {
      id: 'ICM-2025-00188',
      product: 'Acne Clear Soap',
      manufacturer: 'DermaPure',
      complainant: 'A. Santos',
      status: 'forwarded_to_lea',
      logged: '2026-05-15 16:55',
    },
    {
      id: 'ICM-2025-00191',
      product: 'FreshBreath Mouthwash',
      manufacturer: 'OralCare PH',
      complainant: 'R. Tan',
      status: 'pending_verification',
      logged: '2026-05-18 08:02',
    }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending_verification':
        return 'badge-pending-verification';
      case 'verified':
        return 'badge-verified';
      case 'forwarded_to_lea':
        return 'badge-forwarded-to-lea';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending_verification':
        return 'Pending Verification';
      case 'verified':
        return 'Verified';
      case 'forwarded_to_lea':
        return 'Forwarded to LEA';
      default:
        return status;
    }
  };

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



  return (
    <div className='LeaDashboardMain'>
      <Sidebar sidebarType="LEA" />
      <div className='LeaContentContainer'>
        <TopBar topbarType="LEA" />
        <div className='LeaMainfeed'>
          <div className='LeaHeader'>
            <div>
              <p>LEA-CIDG: DASHBOARD</p>
              <p>OVERVIEW OF VERIFICATION REQUESTS & COMPLAINTS</p>
            </div>
          </div>
          {/* Top 4 Stats Cards */}
          <div className='LeaStatsGrid'>
            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Walk-in intakes</span>
              </div>
              <div className='statValue'>35</div>
            </div>

            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Verification requests sent</span>
              </div>
              <div className='statValue'>28</div>
            </div>

            <div className='LeaStatCard'>
              <div className='statTopRow'>
                <span className='statLabel'>Takedowns completed</span>
              </div>
              <div className='statValue'>16</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className='LeaChartsRow'>

            <div className='LeaChartsLeftCol'>
              {/* Left Line Chart Card */}
              <div className='LeaChartCard LineCard'>
                <div className='chartHeader'>
                  <div>
                    <h3>Walk-in intake vs Forwarded to FDA</h3>
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

              {/* Pipeline Chart Card */}
              <div className='LeaChartCard PipelineCard'>
                <div className='chartHeader'>
                  <div>
                    <h3>Verification actions pipeline</h3>
                  </div>
                  <div className='chartLegendInline'>
                    <div className='legendItemInline'>
                      <span className='legendDotNavy'></span>
                      <span>Confirm Unregistered</span>
                    </div>
                    <div className='legendItemInline'>
                      <span className='legendDotGreen'></span>
                      <span>Confirm Registered</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart SVG */}
                <div className='svgChartWrapper'>
                  <svg className='interactiveBarSvg' viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
                    {/* Horizontal Dashed Gridlines */}
                    {[0, 4, 8, 12, 16].map((val) => {
                      const y = getBarY(val);
                      return (
                        <g key={val}>
                          <line x1={barPadLeft} y1={y} x2={width - barPadRight} y2={y} stroke="#e2e8f0" strokeDasharray="2 2" strokeWidth="1" />
                          <text x={barPadLeft - 10} y={y + 4} className='yAxisText'>{val}</text>
                        </g>
                      );
                    })}

                    {/* Solid bottom axis line */}
                    <line x1={barPadLeft} y1={height - padY} x2={width - barPadRight} y2={height - padY} stroke="#cbd5e1" strokeWidth="1" />

                    {/* Bars and hover effects */}
                    {pipelineData.map((data, i) => {
                      const groupCenterX = barPadLeft + i * groupWidth + groupWidth / 2;
                      const isHovered = hoveredBarGroupIndex === i;

                      const opHeight = getBarHeight(data.ops);
                      const opY = getBarY(data.ops);
                      const opX = groupCenterX - barWidth - barGap / 2;

                      const tdHeight = getBarHeight(data.takedowns);
                      const tdY = getBarY(data.takedowns);
                      const tdX = groupCenterX + barGap / 2;

                      return (
                        <g key={i}>
                          {/* Hover background area */}
                          {isHovered && (
                            <rect
                              x={barPadLeft + i * groupWidth}
                              y={padT}
                              width={groupWidth}
                              height={height - padY - padT}
                              fill="#cbd5e1"
                              opacity="0.3"
                            />
                          )}

                          {/* Operations Bar (Navy) */}
                          <rect
                            x={opX}
                            y={opY}
                            width={barWidth}
                            height={opHeight}
                            fill="#07476F"
                            rx="3"
                            style={{ transition: 'all 0.15s ease' }}
                          />

                          {/* Takedowns Bar (Green) */}
                          <rect
                            x={tdX}
                            y={tdY}
                            width={barWidth}
                            height={tdHeight}
                            fill="#059669"
                            rx="3"
                            style={{ transition: 'all 0.15s ease' }}
                          />

                          {/* X-axis label (W18, W19, W20, W21) */}
                          <text x={groupCenterX} y={height - 4} className='xAxisText'>{data.label}</text>

                          {/* Invisible Hover Zone covering the entire group */}
                          <rect
                            x={barPadLeft + i * groupWidth}
                            y={padT}
                            width={groupWidth}
                            height={height - padY - padT}
                            fill="transparent"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredBarGroupIndex(i)}
                            onMouseLeave={() => setHoveredBarGroupIndex(null)}
                          />

                          {/* Tooltip Card */}
                          {isHovered && (
                            <foreignObject
                              x={Math.min(groupCenterX - 60, width - 130)}
                              y={Math.max(Math.min(opY, tdY) - 85, 10)}
                              width="120"
                              height="75"
                            >
                              <div className='barTooltipClean'>
                                <div className='ttWeek'>{data.label}</div>
                                <div className='ttRow navy'>unregistered : <strong>{data.ops}</strong></div>
                                <div className='ttRow green'>registered : <strong>{data.takedowns}</strong></div>
                              </div>
                            </foreignObject>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            <div className='LeaChartsRightCol'>


              {/* Awaiting FDA verification card */}
              <div className='LeaChartCard AwaitingFDACard'>
                <div className='chartHeader'>
                  <div>
                    <h3>Awaiting FDA verification</h3>
                  </div>
                  <span className='awaitingBadge'>
                    <AlertTriangle size={14} />
                    <span>{awaitingFdaCases.length}</span>
                  </span>
                </div>

                <div className='awaitingList'>
                  {awaitingFdaCases.map((item) => (
                    <div key={item.id} className='awaitingListItem'>
                      <div className='awaitingItemLeft'>
                        <span className='awaitingItemTitle'>{item.product}</span>
                        <span className='awaitingItemSubtitle'>
                          {item.manufacturer} · {item.caseNumber}
                        </span>
                      </div>
                      <div className='awaitingItemRight'>
                        <span className='walkinTag'>
                          <Footprints size={12} />
                          <span>{item.type}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent walk-in complaints Table */}
          <div className='RecentComplaintsCard'>
            <div className='recentComplaintsHeader'>
              <h3>Recent walk-in complaints</h3>
              <div
                className='openFullTableBtn'
                onClick={() => navigate('/leacidgfolder/lea-walkin-complaints')}
              >
                <span>Open full table</span>
                <span className='arrowIcon'>&rarr;</span>
              </div>
            </div>

            <div className='RecentComplaintsTableWrapper'>
              <table className='RecentComplaintsTable'>
                <thead>
                  <tr>
                    <th>CASE ID</th>
                    <th>PRODUCT</th>
                    <th>COMPLAINANT</th>
                    <th>STATUS</th>
                    <th>LOGGED</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className='CaseIdCol'>{complaint.id}</td>
                      <td>
                        <div className='ProductCell'>
                          <span className='ProductNameText'>{complaint.product}</span>
                          <span className='ManufacturerText'>{complaint.manufacturer}</span>
                        </div>
                      </td>
                      <td className='ComplainantCol'>{complaint.complainant}</td>
                      <td>
                        <span className={`DashboardStatusBadge ${getStatusBadgeClass(complaint.status)}`}>
                          {getStatusLabel(complaint.status)}
                        </span>
                      </td>
                      <td className='LoggedCol'>{complaint.logged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaDashboard;

