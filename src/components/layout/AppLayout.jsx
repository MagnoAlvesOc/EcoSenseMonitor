import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import FloatingMapBg from "./FloatingMapBg";
import SideNav from "./SideNav";
import InstallAppBanner from "./InstallAppBanner";
import AlertsNotifier from "../dashboard/AlertsNotifier";

export default function AppLayout() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Fullscreen map background — receives pointer events where nothing overlaps */}
      <FloatingMapBg />

      {/* Fixed sidebar */}
      <SideNav />

      {/* Critical alerts overlay */}
      <AlertsNotifier />

      {/* Mobile install hint */}
      <InstallAppBanner />

      {/* Page content — pointer-events-none so map stays interactive in empty areas.
          Each page is responsible for re-enabling pointer-events on its own panels. */}
      <div className="absolute inset-0 z-40 pointer-events-none overflow-y-auto overflow-x-hidden">
        <div className="min-h-full p-3 pb-[calc(7rem+env(safe-area-inset-bottom))] md:p-5 md:pb-6 md:pl-[182px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}