import { ArrowRight } from "lucide-react";
import "./gradientDashboardButton.css";

export function GradientDashboardButton({
  onClick,
  label = "Go to Dashboard",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="gradient-dash-btn" onClick={onClick}>
      <div className="gradient-wrapper">
        <div className="shapes-wrapper">
          <div className="motion-shine-blob motion-shine-blob--a" />
          <div className="motion-shine-blob motion-shine-blob--b" />
          <div className="motion-shine-blob motion-shine-blob--c" />
        </div>
        <div className="blending-group-wrapper">
          <div className="green" />
          <div className="black" />
        </div>
        <div className="motion-shine-noise" />
      </div>
      <div className="text-wrapper">
        <span className="text">{label}</span>
        <ArrowRight size={14} className="text-icon" />
      </div>
    </button>
  );
}