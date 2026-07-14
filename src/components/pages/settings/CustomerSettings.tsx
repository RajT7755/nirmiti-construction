import { Users } from "lucide-react";

export function CustomerSettings() {
  return (
    <div className="flex items-center justify-center p-16">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <Users size={24} className="text-blue-400" />
        </div>
        <h2 className="text-base font-semibold text-gray-700">Customer Settings</h2>
        <p className="text-sm text-gray-400 mt-1">This module is under construction.</p>
      </div>
    </div>
  );
}