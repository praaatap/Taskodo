declare module 'react-native-copilot' {
    import { ComponentType, ReactElement, ReactNode } from 'react';
    import { ViewStyle, ScrollView, LayoutRectangle, Animated } from 'react-native';

    export interface CopilotOptions {
        easing?: ((value: number) => number) | undefined;
        overlay?: "svg" | "view";
        animationDuration?: number;
        tooltipComponent?: ComponentType<any>;
        tooltipStyle?: ViewStyle;
        stepNumberComponent?: ComponentType<any>;
        animated?: boolean;
        labels?: {
            skip?: string;
            previous?: string;
            next?: string;
            finish?: string;
        };
        androidStatusBarVisible?: boolean;
        svgMaskPath?: any;
        verticalOffset?: number;
        arrowColor?: string;
        arrowSize?: number;
        margin?: number;
        stopOnOutsideClick?: boolean;
        backdropColor?: string;
    }

    export interface Step {
        name: string;
        order: number;
        visible: boolean;
        target: any;
        text: string;
        wrapper: any;
    }

    export interface TooltipProps {
        isFirstStep: boolean;
        isLastStep: boolean;
        handleNext: () => void;
        handlePrev: () => void;
        handleStop: () => void;
        currentStep: Step;
        labels: {
            skip?: string;
            previous?: string;
            next?: string;
            finish?: string;
        };
    }

    export interface CopilotContextType {
        start: (fromStep?: string, suppliedScrollView?: ScrollView | null) => Promise<void>;
        stop: () => Promise<void>;
        goToNext: () => Promise<void>;
        goToNth: (n: number) => Promise<void>;
        goToPrev: () => Promise<void>;
        currentStep: Step | undefined;
        visible: boolean;
        copilotEvents: any;
        isFirstStep: boolean;
        isLastStep: boolean;
        currentStepNumber: number;
    }

    export const CopilotProvider: ComponentType<CopilotOptions & { children: ReactNode }>;
    export const CopilotStep: ComponentType<{
        name: string;
        order: number;
        text: string;
        children: ReactElement;
        active?: boolean;
    }>;
    export const walkthroughable: <T>(component: ComponentType<T>) => ComponentType<T>;
    export const useCopilot: () => CopilotContextType;
}
