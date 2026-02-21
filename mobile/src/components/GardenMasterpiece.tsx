import { useId, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Path, Circle, Ellipse, Line, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

const AnimatedG = Animated.createAnimatedComponent(G);

const sizeMap = {
    sm: { width: 80, height: 80 },
    md: { width: 160, height: 160 },
    lg: { width: 240, height: 240 },
    xl: { width: 320, height: 320 }
};

export function getStageIndex(streak: number): number {
    if (streak >= 1000) return 10;
    if (streak >= 365) return 9;
    if (streak >= 200) return 8;
    if (streak >= 100) return 7;
    if (streak >= 60) return 6;
    if (streak >= 30) return 5;
    if (streak >= 14) return 4;
    if (streak >= 7) return 3;
    if (streak >= 3) return 2;
    if (streak >= 1) return 1;
    return 0;
}

const palettes = [
    { bg1: '#E8E6E1', bg2: '#D1CFC7', ground: '#9C9681', accent: '#7A7562', leaf: '#8DAA91', energy: '#D1C8B4' },
    { bg1: '#E2E8DE', bg2: '#BDD2B6', ground: '#789470', accent: '#4E6E45', leaf: '#A8C999', energy: '#E5F1DB' },
    { bg1: '#DCEBDE', bg2: '#A5C9A6', ground: '#638A64', accent: '#375E38', leaf: '#82B984', energy: '#B7E4BC' },
    { bg1: '#D4EBE0', bg2: '#8CC4A4', ground: '#4A8E67', accent: '#23613F', leaf: '#57BA82', energy: '#95E3BA' },
    { bg1: '#D7ECD9', bg2: '#A6CFD5', ground: '#519C91', accent: '#1D6864', leaf: '#34A090', energy: '#F2D399' },
    { bg1: '#CCE4DE', bg2: '#7DC8C4', ground: '#288784', accent: '#0E5755', leaf: '#1AB5AD', energy: '#FFC8B4' },
    { bg1: '#C0DEDD', bg2: '#53B2B6', ground: '#1A6E75', accent: '#0B4146', leaf: '#0BAFB8', energy: '#FFA0A0' },
    { bg1: '#B9CCED', bg2: '#688EEB', ground: '#2F4B98', accent: '#152554', leaf: '#4470DE', energy: '#FFEAB6' },
    { bg1: '#D2C2EE', bg2: '#916DD5', ground: '#522E9B', accent: '#271154', leaf: '#7D47E2', energy: '#FFB8D2' },
    { bg1: '#1A1121', bg2: '#3D2054', ground: '#1A0C27', accent: '#D69AF5', leaf: '#F9C4F8', energy: '#FFD700' },
    { bg1: '#050714', bg2: '#16234B', ground: '#050811', accent: '#7AF0FF', leaf: '#CFF8FF', energy: '#FFFFFF' }
];

export default function GardenMasterpiece({
    streak = 0,
    size = 'md',
    style
}: {
    streak?: number;
    size?: keyof typeof sizeMap;
    style?: any;
}) {
    const uniqueId = useId();
    const { width, height } = sizeMap[size] || sizeMap.md;
    const stageIndex = getStageIndex(streak);
    const clr = palettes[Math.min(stageIndex, 10)];

    // Shared values for animations
    const swayValue = useSharedValue(-2);
    const floatValue = useSharedValue(0);
    const pulseValue = useSharedValue(0.98);
    const pulseOpacityValue = useSharedValue(0.6);
    const rotateValue = useSharedValue(0);
    const orbitValue = useSharedValue(360);

    useEffect(() => {
        swayValue.value = withRepeat(
            withTiming(2, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
            -1, true
        );
        floatValue.value = withRepeat(
            withTiming(-12, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
            -1, true
        );
        pulseValue.value = withRepeat(
            withTiming(1.02, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1, true
        );
        pulseOpacityValue.value = withRepeat(
            withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
            -1, true
        );
        rotateValue.value = withRepeat(
            withTiming(360, { duration: 30000, easing: Easing.linear }),
            -1, false
        );
        orbitValue.value = withRepeat(
            withTiming(0, { duration: 20000, easing: Easing.linear }),
            -1, false
        );
    }, []);

    const animatedSwayProps = useAnimatedProps(() => {
        return {
            transform: [
                { translateX: 200 },
                { translateY: 350 },
                { rotate: `${swayValue.value}deg` },
                { translateX: -200 },
                { translateY: -350 },
            ]
        };
    });

    const animatedFloatProps = useAnimatedProps(() => {
        return {
            transform: [{ translateY: floatValue.value }]
        };
    });

    const animatedPulseProps = useAnimatedProps(() => {
        return {
            transform: [{ scale: pulseValue.value }],
            opacity: pulseOpacityValue.value,
        };
    });

    const animatedRotateProps = useAnimatedProps(() => {
        return {
            transform: [
                { translateX: 200 },
                { translateY: 200 },
                { rotate: `${rotateValue.value}deg` },
                { translateX: -200 },
                { translateY: -200 },
            ]
        };
    });

    const animatedOrbitProps = useAnimatedProps(() => {
        return {
            transform: [
                { translateX: 200 },
                { translateY: 200 },
                { rotate: `${orbitValue.value}deg` },
                { translateX: -200 },
                { translateY: -200 },
            ]
        };
    });

    // Determine container radius based on size to keep it circular/rounded
    const borderRadius = width === 80 ? 20 : width === 160 ? 32 : 48;

    return (
        <View style={[
            {
                width, height,
                borderRadius, overflow: 'hidden',
                backgroundColor: clr.bg1, // Fallback background if gradient doesn't cover
            },
            style
        ]}>
            <Svg width="100%" height="100%" viewBox="0 0 400 400">
                <Defs>
                    <LinearGradient id={`bg-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={clr.bg1} />
                        <Stop offset="100%" stopColor={clr.bg2} />
                    </LinearGradient>
                    <RadialGradient id={`glow-${uniqueId}`} cx="50%" cy="50%" rx="50%" ry="50%">
                        <Stop offset="0%" stopColor={clr.energy} stopOpacity="0.8" />
                        <Stop offset="50%" stopColor={clr.energy} stopOpacity="0.3" />
                        <Stop offset="100%" stopColor={clr.energy} stopOpacity="0" />
                    </RadialGradient>
                    <LinearGradient id={`ground-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={clr.ground} />
                        <Stop offset="100%" stopColor={clr.accent} />
                    </LinearGradient>
                </Defs>

                {/* Base Background */}
                <Path d="M0,0 h400 v400 h-400 z" fill={`url(#bg-${uniqueId})`} />

                {/* --- BACKGROUND RHYTHM --- */}
                {stageIndex >= 9 && (
                    <AnimatedG animatedProps={animatedRotateProps} opacity={0.15}>
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Line
                                key={`ray-${i}`} x1="200" y1="0" x2="200" y2="100"
                                stroke={clr.energy} strokeWidth="2"
                                rotation={i * 30} origin="200, 200"
                            />
                        ))}
                        <Circle cx="200" cy="200" r="140" fill="none" stroke={clr.energy} strokeWidth="1" strokeDasharray="5,15" />
                        <Circle cx="200" cy="200" r="180" fill="none" stroke={clr.leaf} strokeWidth="0.5" />
                    </AnimatedG>
                )}

                {/* Energy Core / Sun / Moon */}
                {stageIndex >= 5 && (
                    <AnimatedG animatedProps={animatedPulseProps}>
                        <Circle
                            cx="200" cy={stageIndex >= 9 ? 200 : 120}
                            r={stageIndex >= 9 ? 160 : 60}
                            fill={`url(#glow-${uniqueId})`}
                        />
                    </AnimatedG>
                )}

                {/* --- GROUND TOPOGRAPHY --- */}
                {stageIndex < 9 && (
                    <Path d="M-50,330 Q100,280 200,320 T450,310 L450,450 L-50,450 Z" fill={`url(#ground-${uniqueId})`} />
                )}
                {stageIndex >= 3 && stageIndex < 9 && (
                    <Path d="M-50,360 Q150,310 250,370 T450,350 L450,450 L-50,450 Z" fill={clr.accent} opacity="0.3" />
                )}

                {/* --- CENTRAL FLORA / STRUCTURE --- */}
                <AnimatedG animatedProps={stageIndex >= 9 ? animatedFloatProps : animatedSwayProps}>
                    {/* Trunk */}
                    {stageIndex >= 1 && stageIndex < 9 && (
                        <Path d="M200,350 Q205,280 200,200" fill="none" stroke={clr.accent} strokeWidth={Math.min(stageIndex * 2.5, 20)} strokeLinecap="round" />
                    )}

                    {/* Primary Seed */}
                    {stageIndex < 9 && (
                        <Ellipse cx="200" cy="350" rx={stageIndex === 0 ? 12 : 20} ry={stageIndex === 0 ? 6 : 8} fill={clr.accent} />
                    )}

                    {/* Branches */}
                    {stageIndex >= 3 && stageIndex < 9 && (
                        <>
                            <Path d="M200,260 Q150,220 120,170" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 1.2} strokeLinecap="round" />
                            <Path d="M200,240 Q250,200 280,150" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 1.2} strokeLinecap="round" />
                        </>
                    )}
                    {stageIndex >= 5 && stageIndex < 9 && (
                        <>
                            <Path d="M200,200 Q140,140 100,90" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 0.8} strokeLinecap="round" />
                            <Path d="M200,180 Q260,120 300,70" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 0.8} strokeLinecap="round" />
                            <Path d="M200,200 Q200,120 200,50" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 0.8} strokeLinecap="round" />
                        </>
                    )}
                    {stageIndex >= 7 && stageIndex < 9 && (
                        <>
                            <Path d="M120,170 Q80,140 60,110" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 0.5} strokeLinecap="round" />
                            <Path d="M280,150 Q320,120 340,90" fill="none" stroke={clr.accent} strokeWidth={stageIndex * 0.5} strokeLinecap="round" />
                        </>
                    )}

                    {/* Canopy */}
                    {stageIndex >= 2 && stageIndex < 9 && (
                        <Circle cx="200" cy="200" r={stageIndex * 4} fill={clr.leaf} opacity="0.9" />
                    )}
                    {stageIndex >= 4 && stageIndex < 9 && (
                        <>
                            <Circle cx="120" cy="170" r={stageIndex * 5} fill={clr.energy} opacity="0.85" />
                            <Circle cx="280" cy="150" r={stageIndex * 5} fill={clr.energy} opacity="0.85" />
                        </>
                    )}
                    {stageIndex >= 6 && stageIndex < 9 && (
                        <>
                            <Circle cx="100" cy="90" r="40" fill={clr.leaf} opacity="0.8" />
                            <Circle cx="300" cy="70" r="45" fill={clr.leaf} opacity="0.8" />
                            <Circle cx="200" cy="50" r="55" fill={clr.energy} opacity="0.9" />
                            <Circle cx="200" cy="130" r="65" fill={clr.leaf} opacity="0.75" />
                        </>
                    )}
                    {stageIndex >= 8 && stageIndex < 9 && (
                        <>
                            <Circle cx="60" cy="110" r="25" fill={clr.energy} opacity="0.9" />
                            <Circle cx="340" cy="90" r="25" fill={clr.energy} opacity="0.9" />
                        </>
                    )}

                    {/* High-Tier Geometry */}
                    {stageIndex >= 9 && (
                        <G>
                            {Array.from({ length: stageIndex >= 10 ? 24 : 12 }).map((_, i) => (
                                <G key={`mandala-${i}`} rotation={i * (360 / (stageIndex >= 10 ? 24 : 12))} origin="200, 200">
                                    <Path d="M200,200 Q260,100 200,30 Q140,100 200,200" fill={clr.leaf} opacity="0.2" stroke={clr.energy} strokeWidth="1.5" />
                                    <Circle cx="200" cy="30" r="4" fill={clr.energy} />
                                </G>
                            ))}
                            <Circle cx="200" cy="200" r="35" fill={clr.energy} />
                            <Circle cx="200" cy="200" r="45" fill="none" stroke={clr.accent} strokeWidth="3" />
                            <Circle cx="200" cy="200" r="70" fill="none" stroke={clr.leaf} strokeWidth="1.5" strokeDasharray="3,6" />
                            {stageIndex === 10 && (
                                <AnimatedG animatedProps={animatedOrbitProps}>
                                    <Circle cx="200" cy="50" r="6" fill={clr.energy} />
                                    <Circle cx="200" cy="350" r="6" fill={clr.energy} />
                                    <Circle cx="50" cy="200" r="6" fill={clr.energy} />
                                    <Circle cx="350" cy="200" r="6" fill={clr.energy} />
                                </AnimatedG>
                            )}
                        </G>
                    )}
                </AnimatedG>

                {/* --- FLOATING AMBIENCE --- */}
                {stageIndex >= 4 && (
                    <AnimatedG animatedProps={animatedFloatProps}>
                        {Array.from({ length: stageIndex * 3 }).map((_, i) => {
                            const angle = (i * 137.5) * (Math.PI / 180);
                            const radius = 30 + (i * (150 / (stageIndex * 3)));
                            const cx = 200 + Math.cos(angle) * radius;
                            const cy = 200 + Math.sin(angle) * (radius * (stageIndex >= 9 ? 1 : 0.7));
                            return (
                                <Circle
                                    key={`particle-${i}`}
                                    cx={cx}
                                    cy={cy - (stageIndex < 9 ? 60 : 0)}
                                    r={i % 3 === 0 ? 2.5 : 1.5}
                                    fill={clr.energy}
                                    opacity="0.75"
                                />
                            );
                        })}
                    </AnimatedG>
                )}
            </Svg>
        </View>
    );
}
