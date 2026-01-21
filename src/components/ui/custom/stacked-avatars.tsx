"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../shadcn/tooltip";

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

interface StackedAvatarsProps {
  members: TeamMember[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

const stackOffsets = {
  sm: "-ml-2",
  md: "-ml-3",
  lg: "-ml-4",
};

export function StackedAvatars({
  members,
  maxVisible = 3,
  size = "md",
  className,
}: StackedAvatarsProps) {
  const visibleMembers = members.slice(0, maxVisible);
  const remainingCount = Math.max(0, members.length - maxVisible);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center", className)}>
        {visibleMembers.map((member, index) => (
          <Tooltip key={member.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative ring-2 ring-background rounded-full",
                  index > 0 && stackOffsets[size]
                )}
                style={{ zIndex: visibleMembers.length - index }}
              >
                <Avatar className={sizeClasses[size]}>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">{member.name}</div>
                {member.email && (
                  <div className="text-muted-foreground">{member.email}</div>
                )}
                {member.role && (
                  <div className="text-muted-foreground text-xs">
                    {member.role}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}

        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "relative ring-2 ring-background rounded-full",
                  stackOffsets[size]
                )}
                style={{ zIndex: 0 }}
              >
                <Avatar className={cn(sizeClasses[size], "bg-muted")}>
                  <AvatarFallback className="text-xs font-medium text-muted-foreground">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <div className="font-medium">
                  {remainingCount} more member{remainingCount !== 1 ? "s" : ""}
                </div>
                {members.slice(maxVisible).map((member) => (
                  <div key={member.id} className="text-muted-foreground">
                    {member.name}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
