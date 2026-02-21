import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useThemeStore } from '../stores/themeStore';

export default function GlobalBackground() {
    const colors = useThemeStore((s) => s.colors);

    // These radial gradients match exactly what's in the PWA's CSS
    // radial-gradient(ellipse at 20% 50%, rgba(222, 185, 106, 0.04) 0%, transparent 50%),
    // radial-gradient(ellipse at 80% 20%, rgba(122, 158, 114, 0.05) 0%, transparent 40%),
    // radial-gradient(ellipse at 50% 90%, rgba(212, 136, 90, 0.03) 0%, transparent 45%);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />

            {/* Mesh Gradient Overlay */}
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient id="grad1" cx="20%" cy="50%" rx="50%" ry="50%" fx="20%" fy="50%">
                        <Stop offset="0%" stopColor="rgba(222, 185, 106, 0.04)" />
                        <Stop offset="100%" stopColor="rgba(222, 185, 106, 0)" />
                    </RadialGradient>
                    <RadialGradient id="grad2" cx="80%" cy="20%" rx="40%" ry="40%" fx="80%" fy="20%">
                        <Stop offset="0%" stopColor="rgba(122, 158, 114, 0.05)" />
                        <Stop offset="100%" stopColor="rgba(122, 158, 114, 0)" />
                    </RadialGradient>
                    <RadialGradient id="grad3" cx="50%" cy="90%" rx="45%" ry="45%" fx="50%" fy="90%">
                        <Stop offset="0%" stopColor="rgba(212, 136, 90, 0.03)" />
                        <Stop offset="100%" stopColor="rgba(212, 136, 90, 0)" />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad1)" />
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad2)" />
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad3)" />
            </Svg>

            {/* Noise Texture Overlay fallback: we use a semi-transparent view or image if needed, but in RN plain SVG with feTurbulence is buggy, so we omit the visual noise or load a png if required. Since the mesh gradient provides 99% of the vibe, we'll keep it clean. */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    { opacity: 0.03, zIndex: 9998 }
                ]}
            >
                <div style={{
                    position: 'absolute',
                    top: 0, right: 0, bottom: 0, left: 0,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '256px 256px',
                    mixBlendMode: 'overlay',
                }} />
            </View>
        </View>
    );
}
