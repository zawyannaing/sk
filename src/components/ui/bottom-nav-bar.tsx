"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  LineChart,
  CreditCard,
  MessageCircle,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  id?: string;
}

const defaultNavItems: NavItem[] = [
  { label: "Home", icon: Home, id: "home" },
  { label: "Portfolio", icon: LineChart, id: "portfolio" },
  { label: "Transactions", icon: CreditCard, id: "transactions" },
  { label: "Messages", icon: MessageCircle, id: "messages" },
  { label: "Rewards", icon: Trophy, id: "rewards" },
  { label: "Profile", icon: User, id: "profile" },
];

const MOBILE_LABEL_WIDTH = 72;

export type BottomNavBarProps = {
  className?: string;
  defaultIndex?: number;
  stickyBottom?: boolean;
  items?: NavItem[];
  onSelect?: (index: number, item: NavItem) => void;
};

export function BottomNavBar({
  className,
  defaultIndex = 0,
  stickyBottom = false,
  items = defaultNavItems,
  onSelect,
}: BottomNavBarProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  const handleSelect = (idx: number, item: NavItem) => {
    setActiveIndex(idx);
    if (onSelect) {
      onSelect(idx, item);
    }
  };

  return (
    <motion.nav
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      role="navigation"
      aria-label="Bottom Navigation"
      className={cn(
        "bg-[#0d121c]/90 dark:bg-card border border-white/10 dark:border-sidebar-border rounded-full flex items-center p-2 shadow-xl backdrop-blur-xl space-x-1 min-w-[320px] max-w-[95vw] h-[52px]",
        stickyBottom && "fixed inset-x-0 bottom-4 mx-auto z-50 w-fit",
        className,
      )}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        const isActive = activeIndex === idx;

        return (
          <motion.button
            key={item.label}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "flex items-center gap-0 px-3 py-2 rounded-full transition-colors duration-200 relative h-10 min-w-[44px] min-h-[40px] max-h-[44px] cursor-pointer",
              isActive
                ? "bg-emerald-500/15 text-emerald-400 gap-2 border border-emerald-500/30"
                : "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5",
              "focus:outline-none focus-visible:ring-0",
            )}
            onClick={() => handleSelect(idx, item)}
            aria-label={item.label}
            type="button"
          >
            <Icon
              size={20}
              strokeWidth={2}
              aria-hidden
              className="transition-colors duration-200 flex-shrink-0"
            />

            <motion.div
              initial={false}
              animate={{
                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                opacity: isActive ? 1 : 0,
                marginLeft: isActive ? "8px" : "0px",
              }}
              transition={{
                width: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.19 },
                marginLeft: { duration: 0.19 },
              }}
              className={cn("overflow-hidden flex items-center max-w-[72px]")}
            >
              <span
                className={cn(
                  "font-medium text-xs whitespace-nowrap select-none transition-opacity duration-200 overflow-hidden text-ellipsis text-[clamp(0.625rem,0.5263rem+0.5263vw,1rem)] leading-[1.9]",
                  isActive ? "text-emerald-400 font-semibold" : "opacity-0",
                )}
                title={item.label}
              >
                {item.label}
              </span>
            </motion.div>
          </motion.button>
        );
      })}
    </motion.nav>
  );
}

export default BottomNavBar;
