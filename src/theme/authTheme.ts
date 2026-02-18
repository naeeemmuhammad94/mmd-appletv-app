import { rs } from './responsive';

// ─── Shared Auth Screen Values ──────────────────────────────────────
export const AUTH_SCREEN_THEME = {
    layout: {
        containerWidth: rs(1680), // w-[1680px]
        headerWidth: rs(592),     // w-[592px]
        cardContentWidth: rs(1459), // w-[1459px]
        cardHeight: rs(600),      // h-[600px] (Login default)
        cardHeightForgotPassword: rs(517), // h-[517px] (Forgot Password default)
        borderRadius: rs(40),     // rounded-[40px]
        inputHeight: rs(96),      // h-24 -> 96px
        inputRadius: rs(16),      // rounded-2xl -> 16px
    },
    spacing: {
        mainGap: rs(64),          // gap-16 -> 64px
        headerGap: rs(10),        // gap-2.5 -> 10px
        headerIconGap: rs(14),    // gap-3.5 -> 14px
        cardInnerGap: rs(28),     // gap-7 -> 28px (Login default)
        cardInnerGapLarge: rs(96), // gap-24 -> 96px (Forgot Password)
        forgotPasswordTop: rs(482), // top-[482px] absolute
        showButtonTop: rs(16),    // top-[16px] absolute inside input
        backButtonTop: rs(370),   // top-[370px] absolute
    },
    typography: {
        headerSubtitleSize: rs(36), // text-4xl -> 36px
        labelSize: rs(48),        // text-5xl -> 48px
        buttonTextSize: rs(48),   // text-5xl -> 48px
        showTextSize: rs(36),     // text-4xl -> 36px
        logoSize: rs(64),         // w-16 h-16 -> 64px
    },
    colors: {
        headerText: 'rgba(255, 255, 255, 0.6)', // text-white/60
        cardBg: 'rgba(31, 41, 55, 0.7)',        // bg-gray-800/70
        inputBg: 'rgba(0, 0, 0, 0.2)',          // bg-black/20
        borderColor: '#A3A3A3',                 // border-neutral-400
        blueButtonStart: '#3B82F6',             // from-blue-500
        blueButtonEnd: '#1E40AF',               // to-blue-800
        forgotPasswordText: '#3B82F6',          // text-blue-500
        backButtonText: '#3B82F6',              // text-blue-500
    },
} as const;
