import React, { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const API_BASE = process.env.REACT_APP_API_URL;

const CHART_COLORS = [
  '#9C27B0', '#FF9800', '#4CAF50', '#00BCD4',
  '#F44336', '#2196F3', '#795548', '#E91E63',
];

const PATIENT_COLUMNS = [
  { field: 'subject_id', headerName: 'SUBJECT ID', width: 150 },
  { field: 'sex', headerName: 'GENDER', width: 110 },
  { field: 'race', headerName: 'RACE', width: 210 },
  { field: 'age', headerName: 'AGE', width: 90 },
  { field: 'cancer_type', headerName: 'CONDITION', width: 160,
    valueFormatter: (params) => params.value
      ? params.value.charAt(0).toUpperCase() + params.value.slice(1) + ' cancer'
      : '' },
  { field: 'study_id', headerName: 'SOURCE', width: 130 },
  { field: 'snp_count', headerName: 'SNP COUNT', width: 130, type: 'number',
    valueFormatter: (params) => params.value?.toLocaleString() },
  { field: 'indel_count', headerName: 'INDEL COUNT', width: 130, type: 'number',
    valueFormatter: (params) => params.value?.toLocaleString() },
];

function SideSection({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Typography style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#444' }}>
          {title}
        </Typography>
        <span style={{ color: '#2358C2', fontSize: 18, fontWeight: 700, lineHeight: 1, cursor: 'default' }}>+</span>
      </div>
      <Divider style={{ marginBottom: 8 }} />
      {children}
    </div>
  );
}

export default function MutationDashboard() {
  const [studies, setStudies] = useState({});
  const [cancerType, setCancerType] = useState('');
  const [rsidInput, setRsidInput] = useState('');
  const [selectedRsids, setSelectedRsids] = useState([]);
  const [statType, setStatType] = useState('count');
  const [showBar, setShowBar] = useState(true);
  const [showPie, setShowPie] = useState(true);

  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientPage, setPatientPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  const [carrierData, setCarrierData] = useState([]);
  const [cohortTotal, setCohortTotal] = useState(0);

  useEffect(() => { fetchStudies(); }, []);

  useEffect(() => { fetchPatients(); }, [cancerType, patientPage, pageSize]);

  useEffect(() => {
    if (selectedRsids.length > 0) fetchCarrierData();
    else { setCarrierData([]); setCohortTotal(0); }
  }, [selectedRsids, cancerType]);

  const fetchStudies = async () => {
    try {
      const res = await fetch(`${API_BASE}/cohort/`);
      if (res.ok) {
        const data = await res.json();
        setStudies(data.studies || {});
      }
    } catch (e) { console.error('fetchStudies:', e); }
  };

  const fetchPatients = async () => {
    setPatientsLoading(true);
    try {
      const params = new URLSearchParams({ limit: pageSize, offset: patientPage * pageSize });
      if (cancerType) params.set('cancer_type', cancerType);
      const res = await fetch(`${API_BASE}/patients/?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients.map((p) => ({
          ...p,
          id: `${p.study_id}:${p.subject_id}`,
        })));
        setTotalPatients(data.total);
      }
    } catch (e) { console.error('fetchPatients:', e); }
    setPatientsLoading(false);
  };

  const fetchCarrierData = async () => {
    try {
      const params = new URLSearchParams({ rsids: selectedRsids.join(',') });
      if (cancerType) params.set('cancer_type', cancerType);
      const res = await fetch(`${API_BASE}/rsid-carriers/?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCarrierData(data.variants || []);
        setCohortTotal(data.total_patients || 0);
      }
    } catch (e) { console.error('fetchCarrierData:', e); }
  };

  const addRsid = () => {
    const rsid = rsidInput.trim();
    if (!rsid || selectedRsids.includes(rsid)) return;
    setSelectedRsids((prev) => [...prev, rsid]);
    setRsidInput('');
  };

  const toggleRsid = (rsid) => {
    setSelectedRsids((prev) =>
      prev.includes(rsid) ? prev.filter((r) => r !== rsid) : [...prev, rsid]
    );
  };

  const uniqueCancerTypes = [...new Set(
    Object.values(studies).map((s) => s.cancer_type)
  )].sort();

  const cancerLabel = cancerType
    ? cancerType.charAt(0).toUpperCase() + cancerType.slice(1) + ' Cancer'
    : 'All Cancers';

  // Build chart values, preserving the order rsIDs were added
  const orderedCarrier = selectedRsids
    .map((rsid) => carrierData.find((v) => v.rsid === rsid))
    .filter(Boolean);

  const chartValues = orderedCarrier.map((v) => ({
    rsid: v.rsid,
    value: statType === 'percentage' && cohortTotal > 0
      ? parseFloat(((v.carrier_count / cohortTotal) * 100).toFixed(2))
      : v.carrier_count,
  }));

  const valueLabel = statType === 'percentage' ? '% of Patients' : 'Carrier Count';

  const barChartData = chartValues.length > 0
    ? [
        ['rsID', valueLabel, { role: 'style' }],
        ...chartValues.map((v, i) => [v.rsid, v.value, CHART_COLORS[i % CHART_COLORS.length]]),
      ]
    : null;

  const pieChartData = chartValues.length > 0
    ? [['rsID', valueLabel], ...chartValues.map((v) => [v.rsid, v.value])]
    : null;

  const hasCharts = selectedRsids.length > 0 && (showBar || showPie) && chartValues.length > 0;

  return (
    <div style={{ display: 'flex', minHeight: '80vh', fontFamily: 'inherit' }}>

      {/* ── Left filter panel ── */}
      <div style={{
        minWidth: 220, maxWidth: 240, padding: '16px 12px',
        borderRight: '1px solid #ddd', backgroundColor: '#f7f7f7', flexShrink: 0,
      }}>

        <SideSection title="Define Cohort">
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>
            Population: All Patients
          </div>
          <FormControl fullWidth size="small" style={{ marginBottom: 8 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={cancerType}
              onChange={(e) => { setCancerType(e.target.value); setPatientPage(0); }}
              label="Condition"
            >
              <MenuItem value="">All Cancers</MenuItem>
              {uniqueCancerTypes.map((ct) => (
                <MenuItem key={ct} value={ct}>
                  {ct.charAt(0).toUpperCase() + ct.slice(1)} Cancer
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Start Date" type="date" size="small" fullWidth
            InputLabelProps={{ shrink: true }} defaultValue="2019-01-01"
            disabled style={{ marginBottom: 6 }} />
          <TextField label="End Date" type="date" size="small" fullWidth
            InputLabelProps={{ shrink: true }} defaultValue="2024-12-31"
            disabled />
        </SideSection>

        <SideSection title="Filter by Attributes">
          <div style={{ fontSize: 13, color: '#555', marginBottom: 6 }}>Filter: SNPs</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <TextField
              size="small"
              placeholder="e.g. rs12354"
              value={rsidInput}
              onChange={(e) => setRsidInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addRsid()}
              inputProps={{ style: { fontSize: 12 } }}
              style={{ flex: 1 }}
            />
            <button className="btn btn-outline-secondary btn-sm" onClick={addRsid}>Add</button>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {selectedRsids.map((rsid, i) => (
              <div key={rsid} style={{ display: 'flex', alignItems: 'center', fontSize: 13, marginBottom: 2 }}>
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleRsid(rsid)}
                  style={{ marginRight: 6, accentColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span style={{ color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: 600 }}>
                  {rsid}
                </span>
              </div>
            ))}
          </div>
          {selectedRsids.length > 0 && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setSelectedRsids([])}
              style={{ marginTop: 6, fontSize: 12 }}
            >
              Clear All
            </button>
          )}
        </SideSection>

        <SideSection title="Select Statistics">
          <RadioGroup value={statType} onChange={(e) => setStatType(e.target.value)}>
            <FormControlLabel
              value="count"
              control={<Radio size="small" />}
              label={<span style={{ fontSize: 13 }}>Number of Patients</span>}
              style={{ marginBottom: -4 }}
            />
            <FormControlLabel
              value="percentage"
              control={<Radio size="small" />}
              label={<span style={{ fontSize: 13 }}>Percent of Patients</span>}
            />
          </RadioGroup>
        </SideSection>

        <SideSection title="Data Visualization">
          <div>
            <FormControlLabel
              control={<Checkbox size="small" checked={showBar} onChange={(e) => setShowBar(e.target.checked)} />}
              label={<span style={{ fontSize: 13 }}>Bar Chart</span>}
              style={{ marginBottom: -4 }}
            />
          </div>
          <div>
            <FormControlLabel
              control={<Checkbox size="small" checked={showPie} onChange={(e) => setShowPie(e.target.checked)} />}
              label={<span style={{ fontSize: 13 }}>Pie Chart</span>}
            />
          </div>
        </SideSection>

        <SideSection title="AI Tools">
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>AI Data Insights</div>
          <div style={{ fontSize: 13, color: '#aaa' }}>BRAIN for unstructured data</div>
        </SideSection>

      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, padding: '16px 20px', overflowX: 'auto' }}>

        {/* Charts row */}
        {hasCharts && (
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            {showBar && barChartData && (
              <div style={{ flex: '1 1 400px', minWidth: 300 }}>
                <Chart
                  chartType="ColumnChart"
                  width="100%"
                  height="360px"
                  data={barChartData}
                  options={{
                    title: `Number of SNPs in Patients with ${cancerLabel}`,
                    titleTextStyle: { fontSize: 13, bold: true },
                    legend: { position: 'none' },
                    vAxis: { title: valueLabel, format: statType === 'percentage' ? '#.##\'%\'' : '#,###' },
                    hAxis: { title: 'rsID' },
                    bar: { groupWidth: '55%' },
                    chartArea: { width: '75%', height: '65%' },
                  }}
                  loader={<div style={{ padding: 8, color: '#888' }}>Loading chart…</div>}
                />
              </div>
            )}
            {showPie && pieChartData && (
              <div style={{ flex: '1 1 300px', minWidth: 260 }}>
                <Chart
                  chartType="PieChart"
                  width="100%"
                  height="360px"
                  data={pieChartData}
                  options={{
                    title: `Percentage of SNPs in Patients with ${cancerLabel}`,
                    titleTextStyle: { fontSize: 13, bold: true },
                    pieHole: 0,
                    colors: CHART_COLORS,
                    chartArea: { width: '85%', height: '70%' },
                  }}
                  loader={<div style={{ padding: 8, color: '#888' }}>Loading chart…</div>}
                />
              </div>
            )}
          </div>
        )}

        {selectedRsids.length > 0 && chartValues.length === 0 && (
          <div style={{ padding: '12px 0', color: '#888', fontSize: 13, marginBottom: 16 }}>
            No carrier data found for selected rsIDs
            {cancerType ? ` in ${cancerLabel}` : ''}.
          </div>
        )}

        {/* Patient demographics table */}
        <div>
          <Typography style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
            Patient Demographics
            {totalPatients > 0 && (
              <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 8, color: '#666' }}>
                {totalPatients.toLocaleString()} patients
                {cancerType ? ` · ${cancerLabel}` : ' · All Cancers'}
              </span>
            )}
          </Typography>
          <Box sx={{ height: 520, width: '100%', background: '#fff' }}>
            <DataGrid
              sx={{ m: 0 }}
              rows={patients}
              columns={PATIENT_COLUMNS}
              loading={patientsLoading}
              rowCount={totalPatients}
              paginationMode="server"
              paginationModel={{ page: patientPage, pageSize }}
              onPaginationModelChange={(model) => {
                setPatientPage(model.page);
                setPageSize(model.pageSize);
              }}
              pageSizeOptions={[50, 100, 250]}
              disableRowSelectionOnClick
              getRowHeight={() => 'auto'}
            />
          </Box>
        </div>

      </div>
    </div>
  );
}
