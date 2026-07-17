import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css'
import { allConsumerReports, getTrendData, getReportStats } from './reportData';

function FDADashboard(){
    const navigate = useNavigate();
    const reportStats = useMemo(() => getReportStats(allConsumerReports), []);

    const categoryGradient = reportStats.categoryMix.reduce((acc, item) => {
        const previous = acc.ranges[acc.ranges.length - 1]?.end ?? 0;
        const size = Math.round((item.value / reportStats.total) * 100);
        const start = previous;
        const end = start + size;
        acc.ranges.push({ color: item.color, start, end });
        return acc;
    }, { ranges: [] }).ranges;

    const trendData = useMemo(() => getTrendData(allConsumerReports), []);

    const chartConfig = {
        width: 360,
        height: 190,
        padding: 36,
        maxValue: 4
    };

    const xStep = (chartConfig.width - chartConfig.padding * 2) / (trendData.months.length - 1);

    const getPointY = (value) => chartConfig.height - chartConfig.padding - (value / chartConfig.maxValue) * (chartConfig.height - chartConfig.padding * 2);

    const buildLinePoints = (values) => values
        .map((value, index) => `${chartConfig.padding + index * xStep},${getPointY(value)}`)
        .join(' ');

    const buildPointData = (values) => values.map((value, index) => ({
        x: chartConfig.padding + index * xStep,
        y: getPointY(value),
        value
    }));

    const buildAreaPath = (values) => {
        const points = buildLinePoints(values);
        const endX = chartConfig.padding + xStep * (values.length - 1);
        const baseline = chartConfig.height - chartConfig.padding;
        return `M${chartConfig.padding},${baseline} ${points} L${endX},${baseline} Z`;
    };

    const browserLine = buildLinePoints(trendData.browserValues);
    const walkinLine = buildLinePoints(trendData.walkinValues);
    const browserArea = buildAreaPath(trendData.browserValues);
    const walkinArea = buildAreaPath(trendData.walkinValues);
    const browserPoints = buildPointData(trendData.browserValues);
    const walkinPoints = buildPointData(trendData.walkinValues);

    const donutStyle = {
        background: `conic-gradient(${categoryGradient.map(seg => `${seg.color} ${seg.start}% ${seg.end}%`).join(', ')})`
    };

import Sidebar from "../component/sidebar";
import TopBar from "../component/top-bar";
import './fda-css.css'

function FDADashboard(){
    return(
        <div className="FdaDashboardMain">
            <Sidebar sidebarType="FDA" />
            <div className="FdaContentContainer">
                <TopBar />
                <div className="FdaMainFeed">
                    <div className="FdaHeader">
                        <div className="FdaHeaderLeft">
                            <p className="FdaEyebrow">Dashboard</p>
                            <h1 className="FdaHeaderTitle">FDA Overview</h1>
                            <p className="FdaSubtitle">Category mix of unregistered product reports.</p>
                        </div>
                    </div>

                    <div className="FdaMetricGrid">
                        <div
                            className="FdaMetricCard FdaMetricCardLink"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'Browser Extension' } })}
                        >
                            <span className="FdaMetricLabel">Browser extension reports</span>
                            <span className="FdaMetricNumber">{reportStats.browserExtension}</span>
                           
                        </div>
                        <div
                            className="FdaMetricCard FdaMetricCardLink"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'Walk-in' } })}
                        >
                            <span className="FdaMetricLabel">Walk-in reports</span>
                            <span className="FdaMetricNumber">{reportStats.walkIn}</span>
                           
                        </div>
                        <div className="FdaMetricCard">
                            <span className="FdaMetricLabel">Takedowns recorded</span>
                            <span className="FdaMetricNumber">{reportStats.takedownsRecorded}</span>
                          
                        </div>
                        <div className="FdaMetricCard">
                            <span className="FdaMetricLabel">Takedowns completed</span>
                            <span className="FdaMetricNumber">{reportStats.takedownsCompleted}</span>
                       
                        </div>
                    </div>

                    <div className="FdaOverviewGrid">
                        <div className="FdaChartCard">
                            <div className="FdaChartHeader">
                                <div>
                                    <div className="FdaChartTitle">Reports trend</div>
                                    <div className="FdaChartSubtitle">Monthly report volume across the year</div>
                                </div>
                                <div className="FdaTrendLegend">
                                    <span className="FdaTrendBadge browser">Browser Extension</span>
                                    <span className="FdaTrendBadge walkin">Walk-in</span>
                                </div>
                            </div>
                            <div
                                className="FdaTrendChart"
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'All' } })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'All' } });
                                    }
                                }}
                            >
                                <svg viewBox="0 0 360 190" role="img" aria-label="Reports trend line chart" className="FdaTrendSvg">
                                    <defs>
                                        <linearGradient id="browserGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.32" />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                                        </linearGradient>
                                        <linearGradient id="walkinGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <rect x="0" y="0" width="360" height="190" fill="#F8FAFC" rx="18" />
                                    <line x1="28" y1="22" x2="28" y2="154" stroke="rgba(15, 23, 42, 0.16)" strokeWidth="1.5" />
                                    <line x1="28" y1="154" x2="332" y2="154" stroke="rgba(15, 23, 42, 0.16)" strokeWidth="1.5" />
                                    <g className="FdaGridLines">
                                        {[0, 1, 2, 3, 4].map((step) => {
                                            const y = 22 + step * 34;
                                            return (
                                                <line key={step} x1="28" y1={y} x2="332" y2={y} stroke="rgba(15, 23, 42, 0.08)" strokeWidth="1" />
                                            );
                                        })}
                                    </g>
                                    {[4, 3, 2, 1, 0].map((value) => {
                                        const y = getPointY(value);
                                        return (
                                            <text key={value} x="20" y={y + 4} fontSize="10" fill="rgba(31, 41, 55, 0.45)">{value}</text>
                                        );
                                    })}
                                    <path d={browserArea} fill="url(#browserGradient)" opacity="0.55" />
                                    <path d={walkinArea} fill="url(#walkinGradient)" opacity="0.55" />
                                    <polyline className="FdaTrendPath browser" points={browserLine} fill="none" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <polyline className="FdaTrendPath walkin" points={walkinLine} fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    {browserPoints.map((point, index) => (
                                        <g
                                            key={`b-${index}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'Browser Extension' } });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.stopPropagation();
                                                    navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'Browser Extension' } });
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <circle cx={point.x} cy={point.y} r="3" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
                                            {point.value > 0 && (
                                                <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="9" fill="#2563eb" fontWeight="500">{point.value}</text>
                                            )}
                                        </g>
                                    ))}
                                    {walkinPoints.map((point, index) => (
                                        <g
                                            key={`w-${index}`}
                                            role="button"
                                            tabIndex={0}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'Walk-in' } });
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.stopPropagation();
                                                    navigate('/fdafolder/fda-view-reports', { state: { selectedTab: 'Walk-in' } });
                                                }
                                            }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <circle cx={point.x} cy={point.y} r="3" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
                                            {point.value > 0 && (
                                                <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="9" fill="#10b981" fontWeight="500">{point.value}</text>
                                            )}
                                        </g>
                                    ))}
                                    {trendData.months.map((month, index) => (
                                        <text key={month} x={chartConfig.padding + index * xStep} y="186" textAnchor="middle" fontSize="10" fill="rgba(31, 41, 55, 0.45)">{month}</text>
                                    ))}
                                </svg>
                            </div>
                        </div>

                        <div className="FdaCategoryCard">
                            <div className="FdaCategoryTitle">Category mix</div>
                            <div className="FdaCategorySubtitle">Unregistered product reports</div>
                            <div className="FdaDonutChartWrapper">
                                <div className="FdaDonutChart" style={donutStyle}>
                                    <div className="FdaDonutCenter">{reportStats.total}</div>
                                </div>
                                <div className="FdaCategoryLegend">
                                    {reportStats.categoryMix.map((item) => (
                                        <div key={item.label} className="FdaCategoryLegendItem">
                                            <span className="FdaLegendMarker" style={{ background: item.color }} />
                                            <span>{item.label}</span>
                                            <strong>{Math.round((item.value / reportStats.total) * 100)}%</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FDADashboard