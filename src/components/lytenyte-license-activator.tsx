"use client";

// ✅ Using specific import for optimal tree shaking
import { activateLicense } from "@1771technologies/lytenyte-pro";
import { useEffect } from "react";

/**
 * LyteNyte License Activator Component
 * 
 * This component activates the LyteNyte Grid PRO license.
 * It should be included once in your root layout.
 * 
 * The license key is stored in the environment variable:
 * NEXT_PUBLIC_LYTENYTE_LICENSE_KEY
 */
export function LyteNyteLicenseActivator() {
  useEffect(() => {
    const licenseKey = process.env.NEXT_PUBLIC_LYTENYTE_LICENSE_KEY;
    
    if (licenseKey && licenseKey.trim() !== "") {
      try {
        activateLicense(licenseKey);
        console.log("✅ LyteNyte Grid PRO license activated successfully");
      } catch (error) {
        console.error("❌ Failed to activate LyteNyte Grid PRO license:", error);
      }
    } else {
      console.warn("⚠️ LyteNyte Grid PRO license key not found. Grid will display with watermarks.");
    }
  }, []);

  // This component doesn't render anything
  return null;
}

