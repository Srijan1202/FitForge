import React from 'react';
import { View, Text, XStack, YStack, styled, useTheme } from 'tamagui';
import { TouchableOpacity } from 'react-native';

// Standard HUD color declarations
export const HUDBarChart = ({
  data,
  height = 160,
  selectedIdx,
  onSelect,
}: {
  data: { label: string; value: number; subLabel?: string }[];
  height?: number;
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
}) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.map((d) => d.value), 100);

  // Grid line calculations
  const gridLines = [0.25, 0.5, 0.75, 1.0];

  return (
    <YStack gap="$2" w="100%">
      <View h={height} w="100%" jc="flex-end" position="relative" px="$2" py="$1">
        
        {/* Horizontal Grid Lines */}
        {gridLines.map((percent, idx) => {
          const gridVal = Math.round(maxValue * percent);
          const topPosition = height - (percent * height);

          return (
            <XStack 
              key={idx} 
              position="absolute" 
              top={topPosition} 
              left={0} 
              right={0} 
              ai="center" 
              jc="space-between"
              zi={0}
            >
              <View 
                flex={1} 
                h={1} 
                borderBottomWidth={1} 
                borderBottomColor="$borderHairline" 
                borderStyle="dashed" 
                opacity={0.5}
              />
              <Text 
                fontFamily="$mono" 
                fontSize="$1" 
                color="$textDisabled" 
                pl="$2"
                bg="$bgSurface"
              >
                {gridVal >= 1000 ? `${(gridVal / 1000).toFixed(1)}K` : gridVal}
              </Text>
            </XStack>
          );
        })}

        {/* Chart Columns */}
        <XStack jc="space-around" ai="flex-end" h="100%" zi={1} w="100%">
          {data.map((item, idx) => {
            const isSelected = selectedIdx === idx;
            const barHeight = Math.max(8, (item.value / maxValue) * (height - 20));

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => onSelect(idx)}
                activeOpacity={0.8}
                style={{ alignItems: 'center', flex: 1 }}
              >
                <YStack ai="center" w="100%" gap="$1">
                  
                  {/* Glowing Target Value Indicator on hover/selected */}
                  {isSelected && (
                    <View 
                      bg="$accentPrimary" 
                      br="$1" 
                      px="$2" 
                      py="$1" 
                      position="absolute" 
                      bottom={barHeight + 10}
                      zi={5}
                      shadowColor="$accentGlow"
                      shadowRadius={10}
                      shadowOpacity={1}
                    >
                      <Text color="#0A0E0C" fontFamily="$mono" fontSize="$1" fontWeight="bold">
                        {item.value}
                      </Text>
                    </View>
                  )}

                  {/* Vertical Bar Column */}
                  <View
                    w={22}
                    h={barHeight}
                    br="$1"
                    borderWidth={1}
                    borderColor={isSelected ? '$accentPrimary' : '$accentDim'}
                    bg={isSelected ? '$accentPrimary' : '$bgSurfaceRaised'}
                    shadowColor={isSelected ? '$accentGlow' : 'transparent'}
                    shadowRadius={15}
                    shadowOpacity={1}
                    style={{
                      transition: 'all 0.2s ease-in-out',
                    }}
                  />
                  
                  {/* Axis Label */}
                  <Text 
                    fontFamily="$mono" 
                    fontSize="$1" 
                    color={isSelected ? '$accentPrimary' : '$textSecondary'} 
                    mt="$1"
                  >
                    {item.label}
                  </Text>
                </YStack>
              </TouchableOpacity>
            );
          })}
        </XStack>
      </View>
    </YStack>
  );
};

export const HUDLineChart = ({
  data,
  height = 150,
  width = 300,
  selectedIdx,
  onSelect,
}: {
  data: { label: string; value: number; dateStr?: string }[];
  height?: number;
  width?: number;
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
}) => {
  const theme = useTheme();

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0) * 0.95;
  const maxVal = Math.max(...values, 100) * 1.05;
  const valRange = maxVal - minVal;

  const chartPadding = 20;
  const plotWidth = width - chartPadding * 2;
  const plotHeight = height - chartPadding * 2;

  // Calculate pixel coordinates for points
  const points = data.map((d, idx) => {
    const x = chartPadding + (idx / (data.length - 1)) * plotWidth;
    const y = chartPadding + plotHeight - ((d.value - minVal) / valRange) * plotHeight;
    return { x, y, ...d };
  });

  return (
    <View h={height} w={width} position="relative" alignSelf="center" bg="$bgSurface" br="$3" overflow="hidden" borderWidth={1} borderColor="$borderHairline">
      
      {/* HUD Telemetry Grid Background */}
      <View position="absolute" top={0} left={0} right={0} bottom={0} opacity={0.15}>
        {/* Horizontal Grids */}
        {[0.25, 0.5, 0.75].map((percent, idx) => (
          <View 
            key={idx} 
            position="absolute" 
            top={height * percent} 
            left={0} 
            right={0} 
            h={1} 
            bg="$accentPrimary" 
          />
        ))}
        {/* Vertical Grids */}
        {[0.25, 0.5, 0.75].map((percent, idx) => (
          <View 
            key={idx} 
            position="absolute" 
            left={width * percent} 
            top={0} 
            bottom={0} 
            w={1} 
            bg="$accentPrimary" 
          />
        ))}
      </View>

      {/* Grid Values Labels */}
      <Text position="absolute" top={4} right={6} fontFamily="$mono" fontSize="$1" color="$textDisabled">
        MAX: {Math.round(maxVal)}
      </Text>
      <Text position="absolute" bottom={4} right={6} fontFamily="$mono" fontSize="$1" color="$textDisabled">
        MIN: {Math.round(minVal)}
      </Text>

      {/* Line Segments */}
      {points.map((pt, idx) => {
        if (idx === points.length - 1) return null;
        const nextPt = points[idx + 1];

        const dx = nextPt.x - pt.x;
        const dy = nextPt.y - pt.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const xc = (pt.x + nextPt.x) / 2;
        const yc = (pt.y + nextPt.y) / 2;

        return (
          <View
            key={`line-${idx}`}
            position="absolute"
            left={xc - length / 2}
            top={yc - 1}
            w={length}
            h={2}
            bg="$accentPrimary"
            opacity={0.7}
            shadowColor="$accentGlow"
            shadowRadius={4}
            shadowOpacity={0.8}
            style={{
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}

      {/* Vertical Guides for Selected Point */}
      {selectedIdx !== null && points[selectedIdx] && (
        <View
          position="absolute"
          left={points[selectedIdx].x}
          top={chartPadding}
          bottom={chartPadding}
          w={1}
          bg="$accentPrimary"
          opacity={0.3}
          style={{ borderStyle: 'dashed', borderWidth: 0.5, borderColor: theme.accentPrimary.get() }}
        />
      )}

      {/* Point Nodes */}
      {points.map((pt, idx) => {
        const isSelected = selectedIdx === idx;
        const nodeSize = isSelected ? 12 : 6;

        return (
          <TouchableOpacity
            key={`node-${idx}`}
            onPress={() => onSelect(idx)}
            activeOpacity={0.7}
            style={{
              position: 'absolute',
              left: pt.x - nodeSize / 2,
              top: pt.y - nodeSize / 2,
              width: nodeSize,
              height: nodeSize,
              borderRadius: 99,
              backgroundColor: isSelected ? theme.accentPrimary.get() as string : theme.bgBase.get() as string,
              borderWidth: 2,
              borderColor: theme.accentPrimary.get() as string,
              shadowColor: theme.accentGlow.get() as string,
              shadowRadius: isSelected ? 8 : 2,
              shadowOpacity: 1,
              zIndex: 10,
            }}
          />
        );
      })}
    </View>
  );
};
