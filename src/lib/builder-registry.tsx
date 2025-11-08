"use client";

import { builder } from "@builder.io/react";
import { Button } from "@/components/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Badge } from "@/components/ui";
import { ReactNode } from "react";

// Register UI components with Builder.io for visual editing
// Note: Builder.io initialization is handled in BuilderInit component

// Register Button component
builder.registerComponent(Button, {
  name: "Button",
  inputs: [
    {
      name: "variant",
      type: "string",
      enum: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      defaultValue: "default",
    },
    {
      name: "size",
      type: "string",
      enum: ["default", "sm", "lg", "icon"],
      defaultValue: "default",
    },
    {
      name: "children",
      type: "string",
      defaultValue: "Click me",
    },
    {
      name: "disabled",
      type: "boolean",
      defaultValue: false,
    },
  ],
});

// Register Card components
builder.registerComponent(Card, {
  name: "Card",
  inputs: [
    {
      name: "className",
      type: "string",
    },
    {
      name: "children",
      type: "blocks",
      defaultValue: [],
    },
  ],
});

builder.registerComponent(CardHeader, {
  name: "CardHeader",
  inputs: [
    {
      name: "children",
      type: "blocks",
      defaultValue: [],
    },
  ],
});

builder.registerComponent(CardTitle, {
  name: "CardTitle",
  inputs: [
    {
      name: "children",
      type: "string",
      defaultValue: "Card Title",
    },
  ],
});

builder.registerComponent(CardDescription, {
  name: "CardDescription",
  inputs: [
    {
      name: "children",
      type: "string",
      defaultValue: "Card description goes here",
    },
  ],
});

builder.registerComponent(CardContent, {
  name: "CardContent",
  inputs: [
    {
      name: "children",
      type: "blocks",
      defaultValue: [],
    },
  ],
});

// Register Badge component
builder.registerComponent(Badge, {
  name: "Badge",
  inputs: [
    {
      name: "variant",
      type: "string",
      enum: ["default", "secondary", "destructive", "outline"],
      defaultValue: "default",
    },
    {
      name: "children",
      type: "string",
      defaultValue: "Badge",
    },
  ],
});

// Register a custom section component
interface SectionProps {
  title?: string;
  children?: ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, className }) => (
  <section className={`py-8 px-4 ${className || ""}`}>
    {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
    {children}
  </section>
);

builder.registerComponent(Section, {
  name: "Section",
  inputs: [
    {
      name: "title",
      type: "string",
      defaultValue: "Section Title",
    },
    {
      name: "className",
      type: "string",
      defaultValue: "",
    },
    {
      name: "children",
      type: "blocks",
      defaultValue: [],
    },
  ],
});

export default builder;
