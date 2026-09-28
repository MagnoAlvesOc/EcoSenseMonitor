import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import FloatingMapBg from "./FloatingMapBg";
import SideNav from "./SideNav";
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

      {/* Page content — pointer-events-none so map stays interactive in empty areas.
          Each page is responsible for re-enabling pointer-events on its own panels. */}
      <div className="absolute inset-0 z-40 pointer-events-none overflow-y-auto">
        <div className="min-h-full p-3 pb-28 md:p-5 md:pb-6 md:pl-[182px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}