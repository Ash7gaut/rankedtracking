import React, { useState } from "react";

interface RoleFilterProps {
  selectedRole: string | null;
  onRoleSelection: (role: string | null) => void;
}

const roles = [
  { id: "TOP", icon: "🛡️", name: "Top" },
  { id: "JUNGLE", icon: "🌲", name: "Jungle" },
  { id: "MID", icon: "⚔️", name: "Mid" },
  { id: "ADC", icon: "🎯", name: "ADC" },
  { id: "SUPPORT", icon: "💝", name: "Support" },
];

export const RoleFilter = ({
  selectedRole,
  onRoleSelection,
}: RoleFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtrer par rôle
        </h3>
        <span
          className="transform transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() =>
                onRoleSelection(selectedRole === role.id ? null : role.id)
              }
              className={`p-2 rounded flex flex-col items-center ${
                selectedRole === role.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-2xl">{role.icon}</span>
              <span className="text-sm mt-1">{role.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
