enum Shape {
    Default,
    IconSquare,
}

enum Size {
    Default,
    Small,
    Large,
    Compact,
}

enum Variant {
    Primary,
    Secondary,
    Start,
    Restart,
    Stop,
    Kill,
}

export const Options = { Shape, Size, Variant };

export type ButtonProps = JSX.IntrinsicElements['button'] & {
    shape?: Shape;
    size?: Size;
    variant?: Variant;
};
