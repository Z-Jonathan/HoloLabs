import type { Metadata } from "next";
import { StudioApp } from "./StudioApp";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "Sign with Holo: a real-time, two-way sign language conversation. You sign into your camera; Holo's 3D avatar signs back.",
};

export default function StudioPage() {
  return <StudioApp />;
}
