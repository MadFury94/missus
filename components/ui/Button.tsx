import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
    href?: string;
    fullWidth?: boolean;
}

const base = "inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-200 cursor-pointer";

const variants = {
    primary: "bg-secondary text-white hover:bg-secondary/85",
    secondary: "bg-primary text-white hover:bg-primary-dark",
    ghost: "bg-transparent text-secondary border border-secondary hover:bg-secondary hover:text-white",
    outline: "bg-transparent text-secondary border border-secondary/30 hover:border-secondary",
};

const sizes = {
    sm: "text-xs px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-sm px-8 py-4 tracking-widest uppercase",
};

export default function Button({
    variant = "primary",
    size = "md",
    href,
    fullWidth,
    className = "",
    children,
    ...props
}: ButtonProps) {
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`;

    if (href) {
        return (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}
