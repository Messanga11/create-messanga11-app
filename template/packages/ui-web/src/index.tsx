import { createElement, type ReactNode } from "react";

interface ChildrenProps {
  readonly children: ReactNode;
}

interface IdentifiedProps extends ChildrenProps {
  readonly id: string;
}

interface CardProps extends ChildrenProps {
  readonly labelledBy: string;
}

interface ActionButtonProps extends ChildrenProps {
  readonly disabled?: boolean;
  readonly onPress: () => void;
}

export function Page({ children }: ChildrenProps) {
  return createElement("main", { className: "shell" }, children);
}

export function Eyebrow({ children }: ChildrenProps) {
  return createElement("p", { className: "eyebrow" }, children);
}

export function DisplayHeading({ children }: ChildrenProps) {
  return createElement("h1", { className: "display-heading" }, children);
}

export function IntroText({ children }: ChildrenProps) {
  return createElement("p", { className: "lede" }, children);
}

export function Card({ children, labelledBy }: CardProps) {
  return createElement(
    "section",
    { "aria-labelledby": labelledBy, className: "card" },
    children,
  );
}

export function CardCopy({ children }: ChildrenProps) {
  return createElement("div", { className: "card-copy" }, children);
}

export function Badge({ children }: ChildrenProps) {
  return createElement("span", { className: "badge" }, children);
}

export function SectionHeading({ children, id }: IdentifiedProps) {
  return createElement("h2", { className: "section-heading", id }, children);
}

export function MetadataText({ children }: ChildrenProps) {
  return createElement("p", { className: "metadata" }, children);
}

export function StatusText({ children }: ChildrenProps) {
  return createElement("p", { "aria-live": "polite", className: "status" }, children);
}

export function ActionButton({ children, disabled, onPress }: ActionButtonProps) {
  return createElement(
    "button",
    {
      className: "action-button",
      disabled,
      onClick: onPress,
      type: "button",
    },
    children,
  );
}
