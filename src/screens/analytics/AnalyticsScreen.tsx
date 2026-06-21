import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, XStack, YStack, styled, useTheme } from 'tamagui';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { HUDBarChart, HUDLineChart } from '../../components/ui/AnalyticsCharts';
import { getDb } from '../../db/sqlite';
import { BarChart2, TrendingUp, RefreshCw } from 'lucide-react-native';

const FilterChip = styled(View, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$2',
  paddingHorizontal: '$3',
  paddingVertical: '$2',
  marginRight: '$2',
  pressStyle: { opacity: 0.8 },
  
  variants: {
    active: {
      true: {
        borderColor: '$accentPrimary',
        backgroundColor: '$bgSurfaceRaised',
      },
    },
  } as const,
});

const TimeframeButton = styled(View, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$1',
  paddingHorizontal: '$2.5',
  paddingVertical: '$1.5',
  pressStyle: { opacity: 0.8 },
  
  variants: {
    active: {
      true: {
        backgroundColor: '$accentPrimary',
        borderColor: '$accentPrimary',
      },
    },
  } as const,
});

const DiagnosticItem = ({ label, value, unit }: { label: string; value: string | number; unit?: string }) => (
  <YStack flex={1} minWidth="45%" bg="$bgSurface" p="$3" br="$2" borderWidth={1} borderColor="$borderHairline">
    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">{label}</Text>
    <XStack ai="flex-end" gap="$1" mt="$1">
      <Text color="$accentPrimary" fontSize="$4" fontFamily="$mono" fontWeight="bold">{value}</Text>
      {unit && <Text color="$textSecondary" fontSize="$1" fontFamily="$body" mb="$1">{unit}</Text>}
    </XStack>
  </YStack>
);

const MOCK_EXERCISES = [
  { id: 'ex-bench', name: 'Barbell Bench Press', muscle: 'Chest' },
  { id: 'ex-squat', name: 'Squat (Barbell)', muscle: 'Quads' },
  { id: 'ex-deadlift', name: 'Deadlift (Barbell)', muscle: 'Posterior' },
  { id: 'ex-ohp', name: 'Overhead Press', muscle: 'Shoulders' },
];

const MOCK_VOLUME_DATA: Record<string, { label: string; value: number }[]> = {
  'ex-bench': [
    { label: 'Mon', value: 4500 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 5200 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 4800 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ],
  'ex-squat': [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 6800 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 7200 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ],
  'ex-deadlift': [
    { label: 'Mon', value: 0 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 8500 },
    { label: 'Thu', value: 0 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 9200 },
    { label: 'Sun', value: 0 },
  ],
  'ex-ohp': [
    { label: 'Mon', value: 2800 },
    { label: 'Tue', value: 0 },
    { label: 'Wed', value: 0 },
    { label: 'Thu', value: 3100 },
    { label: 'Fri', value: 0 },
    { label: 'Sat', value: 0 },
    { label: 'Sun', value: 0 },
  ],
};

const MOCK_1RM_DATA: Record<string, { label: string; value: number; dateStr: string }[]> = {
  'ex-bench': [
    { label: 'Wk 1', value: 205, dateStr: '05/10' },
    { label: 'Wk 2', value: 210, dateStr: '05/17' },
    { label: 'Wk 3', value: 212, dateStr: '05/24' },
    { label: 'Wk 4', value: 215, dateStr: '05/31' },
    { label: 'Wk 5', value: 220, dateStr: '06/07' },
    { label: 'Wk 6', value: 225, dateStr: '06/14' },
  ],
  'ex-squat': [
    { label: 'Wk 1', value: 275, dateStr: '05/10' },
    { label: 'Wk 2', value: 285, dateStr: '05/17' },
    { label: 'Wk 3', value: 290, dateStr: '05/24' },
    { label: 'Wk 4', value: 295, dateStr: '05/31' },
    { label: 'Wk 5', value: 300, dateStr: '06/07' },
    { label: 'Wk 6', value: 315, dateStr: '06/14' },
  ],
  'ex-deadlift': [
    { label: 'Wk 1', value: 315, dateStr: '05/10' },
    { label: 'Wk 2', value: 325, dateStr: '05/17' },
    { label: 'Wk 3', value: 335, dateStr: '05/24' },
    { label: 'Wk 4', value: 345, dateStr: '05/31' },
    { label: 'Wk 5', value: 360, dateStr: '06/07' },
    { label: 'Wk 6', value: 375, dateStr: '06/14' },
  ],
  'ex-ohp': [
    { label: 'Wk 1', value: 120, dateStr: '05/10' },
    { label: 'Wk 2', value: 125, dateStr: '05/17' },
    { label: 'Wk 3', value: 125, dateStr: '05/24' },
    { label: 'Wk 4', value: 130, dateStr: '05/31' },
    { label: 'Wk 5', value: 132, dateStr: '06/07' },
    { label: 'Wk 6', value: 135, dateStr: '06/14' },
  ],
};

export const AnalyticsScreen = () => {
  const theme = useTheme();

  const [selectedExId, setSelectedExId] = useState('ex-bench');
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | 'ALL'>('1M');
  const [selectedBarIdx, setSelectedBarIdx] = useState<number | null>(null);
  const [selectedNodeIdx, setSelectedNodeIdx] = useState<number | null>(null);
  
  const [isRealData, setIsRealData] = useState(false);
  const [volumeData, setVolumeData] = useState<{ label: string; value: number }[]>(MOCK_VOLUME_DATA['ex-bench']);
  const [rmData, setRmData] = useState<{ label: string; value: number; dateStr: string }[]>(MOCK_1RM_DATA['ex-bench']);
  const [stats, setStats] = useState({ maxRm: 225, totalVolume: 14500, totalSets: 18, delta: '+9.7%' });

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const db = getDb();
        const activeEx = MOCK_EXERCISES.find((e) => e.id === selectedExId);
        if (!activeEx) return;

        // Verify if SQLite database contains completed logs
        const countRow = await db.getFirstAsync('SELECT COUNT(*) as cnt FROM logs') as { cnt: number };
        
        if (countRow && countRow.cnt > 0) {
          // Fetch user logged sets for the current active exercise
          const logs = await db.getAllAsync(`
            SELECT 
              l.weight_lifted, 
              l.reps, 
              s.completed_at,
              l.date_completed
            FROM logs l
            JOIN workout_sessions s ON l.session_id = s.id
            JOIN exercise_library e ON l.exercise_id = e.id
            WHERE e.name LIKE ? AND s.completed_at IS NOT NULL
            ORDER BY s.completed_at ASC
          `, [`%${activeEx.name}%`]) as { weight_lifted: number; reps: number; completed_at: string; date_completed: string }[];

          if (logs && logs.length > 0) {
            setIsRealData(true);
            
            // 1. Calculate Estimated 1RM Trend over time (Epley formula)
            // Group logs by completed_at timestamp (session-level)
            const sessionMap: Record<string, { dateLabel: string; maxRm: number; dateStr: string }> = {};
            
            logs.forEach((log) => {
              const date = new Date(log.completed_at || log.date_completed);
              const dateKey = date.toDateString();
              const oneRepMax = log.weight_lifted * (1 + log.reps * 0.0333);

              if (!sessionMap[dateKey]) {
                sessionMap[dateKey] = {
                  dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
                  maxRm: oneRepMax,
                  dateStr: `${date.getMonth() + 1}/${date.getDate()}`,
                };
              } else {
                sessionMap[dateKey].maxRm = Math.max(sessionMap[dateKey].maxRm, oneRepMax);
              }
            });

            const sortedSessions = Object.values(sessionMap);
            const trendData = sortedSessions.map((s, idx) => ({
              label: `Sess ${idx + 1}`,
              value: Math.round(s.maxRm),
              dateStr: s.dateStr,
            }));

            // 2. Calculate Weekly/Daily Volume (Last 7 days)
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const volumeMap: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
            
            let totalVolumeSum = 0;
            let setsCount = 0;

            const now = new Date();
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(now.getDate() - 7);

            logs.forEach((log) => {
              const logDate = new Date(log.completed_at || log.date_completed);
              totalVolumeSum += log.weight_lifted * log.reps;
              setsCount++;

              if (logDate >= sevenDaysAgo && logDate <= now) {
                const dayName = days[logDate.getDay()];
                volumeMap[dayName] += log.weight_lifted * log.reps;
              }
            });

            const volumeTrend = days.map((d) => ({
              label: d,
              value: volumeMap[d],
            }));

            // 3. Compute stats
            const calculatedMaxRm = Math.round(Math.max(...sortedSessions.map((s) => s.maxRm)));
            
            // Overload Delta
            let percentageDeltaStr = '+0.0%';
            if (sortedSessions.length >= 2) {
              const startRm = sortedSessions[0].maxRm;
              const endRm = sortedSessions[sortedSessions.length - 1].maxRm;
              const percentage = ((endRm - startRm) / startRm) * 100;
              percentageDeltaStr = `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
            }

            setRmData(trendData);
            setVolumeData(volumeTrend);
            setStats({
              maxRm: calculatedMaxRm,
              totalVolume: Math.round(totalVolumeSum),
              totalSets: setsCount,
              delta: percentageDeltaStr,
            });
            return;
          }
        }

        // Fallback to Mock Data curves if database is empty of active logs
        setIsRealData(false);
        setVolumeData(MOCK_VOLUME_DATA[selectedExId]);
        setRmData(MOCK_1RM_DATA[selectedExId]);
        
        // Calculate mock stats
        const activeRmList = MOCK_1RM_DATA[selectedExId];
        const activeVolList = MOCK_VOLUME_DATA[selectedExId];
        const maxRm = Math.max(...activeRmList.map((d) => d.value));
        const totalVolume = activeVolList.reduce((acc, curr) => acc + curr.value, 0);
        const startVal = activeRmList[0].value;
        const endVal = activeRmList[activeRmList.length - 1].value;
        const deltaPct = ((endVal - startVal) / startVal) * 100;
        
        setStats({
          maxRm,
          totalVolume,
          totalSets: selectedExId === 'ex-bench' ? 18 : selectedExId === 'ex-squat' ? 12 : 8,
          delta: `${deltaPct >= 0 ? '+' : ''}${deltaPct.toFixed(1)}%`,
        });
      } catch (err) {
        console.warn('Failed to load SQLite analytics data:', err);
      }
    };
    loadAnalyticsData();
  }, [selectedExId, timeframe]);

  const activeExercise = MOCK_EXERCISES.find((e) => e.id === selectedExId);

  return (
    <View flex={1} bg="$background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 80 }}>
        
        {/* Header Console */}
        <XStack jc="space-between" ai="center" mb="$4" mt="$4">
          <YStack>
            <Text color="$color" fontSize="$5" fontFamily="$heading">TELEMETRY DECK</Text>
            <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
              TRAINING VOLUME & 1RM LOGS
            </Text>
          </YStack>
          <XStack bg="$bgSurface" p="$1.5" br="$2" borderWidth={1} borderColor="$borderHairline" ai="center" gap="$1.5">
            <RefreshCw size={12} color={isRealData ? (theme.accentPrimary.get() as string) : (theme.textSecondary.get() as string)} />
            <Text color={isRealData ? '$accentPrimary' : '$textSecondary'} fontSize="$1" fontFamily="$mono">
              {isRealData ? 'LIVE SYNCED' : 'SIM FALLBACK'}
            </Text>
          </XStack>
        </XStack>

        {/* Horizontal Scroll Exercise Selector */}
        <View mb="$4">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ py: 4 }}>
            {MOCK_EXERCISES.map((ex) => (
              <FilterChip
                key={ex.id}
                active={selectedExId === ex.id}
                onPress={() => {
                  setSelectedExId(ex.id);
                  setSelectedBarIdx(null);
                  setSelectedNodeIdx(null);
                }}
              >
                <Text 
                  fontFamily="$heading" 
                  fontSize="$2" 
                  color={selectedExId === ex.id ? '$accentPrimary' : '$textSecondary'}
                >
                  {ex.name.toUpperCase()}
                </Text>
              </FilterChip>
            ))}
          </ScrollView>
        </View>

        {/* Timeframe Selectors */}
        <XStack jc="space-between" ai="center" mb="$4">
          <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FILTER INTERVAL</Text>
          <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline">
            {(['1W', '1M', '3M', 'ALL'] as const).map((t) => (
              <TimeframeButton 
                key={t} 
                active={timeframe === t}
                onPress={() => setTimeframe(t)}
              >
                <Text 
                  fontFamily="$mono" 
                  fontSize="$1" 
                  color={timeframe === t ? '#0A0E0C' : '$textSecondary'} 
                  fontWeight="bold"
                >
                  {t}
                </Text>
              </TimeframeButton>
            ))}
          </XStack>
        </XStack>

        {/* Card 1: 1RM Progression Line Chart */}
        <Card mb="$4" raised>
          <XStack jc="space-between" ai="center" mb="$3">
            <YStack>
              <CardTitle>PROGRESSIVE OVERLOAD</CardTitle>
              <CardSubtitle>Estimated 1RM trend (lbs)</CardSubtitle>
            </YStack>
            <TrendingUp size={16} color={theme.accentPrimary.get() as string} />
          </XStack>

          <HUDLineChart 
            data={rmData} 
            selectedIdx={selectedNodeIdx} 
            onSelect={setSelectedNodeIdx} 
          />

          {/* Interactive Node Data Output */}
          <View mt="$3" h={38} jc="center" bg="$bgBase" px="$3" br="$2" borderWidth={1} borderColor="$borderHairline">
            {selectedNodeIdx !== null && rmData[selectedNodeIdx] ? (
              <XStack jc="space-between" ai="center">
                <Text color="$textSecondary" fontFamily="$mono" fontSize="$1">
                  DAT: {rmData[selectedNodeIdx].dateStr || 'N/A'}
                </Text>
                <Text color="$accentPrimary" fontFamily="$mono" fontSize="$2" fontWeight="bold">
                  EST. 1RM: {rmData[selectedNodeIdx].value} LBS
                </Text>
              </XStack>
            ) : (
              <Text color="$textDisabled" fontFamily="$mono" fontSize="$1" textAlign="center">
                TAP TELEMETRY NODE FOR CALIBRATION SPEC
              </Text>
            )}
          </View>
        </Card>

        {/* Card 2: Volume Bar Chart */}
        <Card mb="$4">
          <XStack jc="space-between" ai="center" mb="$3">
            <YStack>
              <CardTitle>TRAINING VOLUME</CardTitle>
              <CardSubtitle>Daily load summation (lbs × reps)</CardSubtitle>
            </YStack>
            <BarChart2 size={16} color={theme.accentPrimary.get() as string} />
          </XStack>

          <HUDBarChart 
            data={volumeData} 
            selectedIdx={selectedBarIdx} 
            onSelect={setSelectedBarIdx} 
          />

          {/* Interactive Bar Data Output */}
          <View mt="$3" h={38} jc="center" bg="$bgSurfaceRaised" px="$3" br="$2" borderWidth={1} borderColor="$borderHairline">
            {selectedBarIdx !== null && volumeData[selectedBarIdx] ? (
              <XStack jc="space-between" ai="center">
                <Text color="$textSecondary" fontFamily="$mono" fontSize="$1">
                  DAY: {volumeData[selectedBarIdx].label.toUpperCase()}
                </Text>
                <Text color="$accentPrimary" fontFamily="$mono" fontSize="$2" fontWeight="bold">
                  LOAD: {volumeData[selectedBarIdx].value} LBS
                </Text>
              </XStack>
            ) : (
              <Text color="$textDisabled" fontFamily="$mono" fontSize="$1" textAlign="center">
                TAP GRAPH COLUMN TO QUERY DAILY LOAD VALUE
              </Text>
            )}
          </View>
        </Card>

        {/* Diagnostic Panel Console (Stats) */}
        <Card mb="$4" raised>
          <Text color="$textSecondary" fontSize="$1" fontFamily="$body" mb="$3">SYSTEM DIAGNOSTICS</Text>
          
          <XStack flexWrap="wrap" gap="$3" w="100%">
            <DiagnosticItem label="MAX ESTIMATED 1RM" value={stats.maxRm} unit="LBS" />
            <DiagnosticItem label="LOAD VELOCITY DELTA" value={stats.delta} />
            <DiagnosticItem label="TOTAL LOGGED VOLUME" value={stats.totalVolume} unit="LBS" />
            <DiagnosticItem label="COMPLETED SETS COUPLER" value={stats.totalSets} unit="SETS" />
          </XStack>
        </Card>

      </ScrollView>
    </View>
  );
};
