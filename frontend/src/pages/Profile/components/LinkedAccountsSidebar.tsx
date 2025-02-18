import { LinkedAccountsView } from "./LinkedAccountsView";

export const LinkedAccountsSidebar = ({
  isOpen,
  onClose,
  playerName,
}: {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 
        shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
      >
        <div className="p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500"
          >
            ✕
          </button>
          <LinkedAccountsView playerName={playerName} />
        </div>
      </div>
    </>
  );
};
