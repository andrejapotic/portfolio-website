import { twMerge } from "tailwind-merge";

export const TechIcon = ({ component, className }: { component: React.ElementType; className?: string }) => {
    const Component = component;

    return (
        <Component className={twMerge("size-10 shrink-0 text-white", className)} />
    )
}
