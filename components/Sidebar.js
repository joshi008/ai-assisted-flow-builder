import { useState } from "react";
import { 
  HiMenuAlt2, 
  HiChevronLeft,
  HiCube,
  HiClipboardList,
  HiPaperAirplane
} from "react-icons/hi";

export default function Sidebar({ 
  isCollapsed, 
  onToggleCollapse, 
  logoIcon: LogoIcon = HiCube,
  appName = "Promptinator",
  menuItems = [],
  controlItems = [],
  className = "",
  onInputSubmit = () => {},
  inputPlaceholder = "Enter your AI prompt..."
}) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (inputText.trim() && !isLoading) {
      setIsLoading(true);
      try {
        await onInputSubmit(inputText);
        setInputText("");
      } catch (error) {
        console.error('Submit error:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-80'}
      glass-strong lg:relative lg:translate-x-0 ${className}
    `}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <LogoIcon className="w-8 h-8 text-gray-700" />
            </div>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-800">
                {appName}
              </h1>
            )}
          </div>
        </div>

        {/* AI Input Section - Only visible when not collapsed */}
        {!isCollapsed && (
          <div className="p-4 border-b border-white/20">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  AI Flow Generator
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="w-full px-4 py-3 glass-input text-sm resize-none h-20"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isLoading}
                className="w-full px-4 py-2.5 font-medium text-sm
                  flex items-center justify-center space-x-2 group
                  disabled:opacity-50 disabled:cursor-not-allowed rounded-xl
                  backdrop-filter backdrop-blur-lg border border-white/30
                  shadow-lg hover:shadow-xl transition-all duration-200"
                style={{
                  background: (!inputText.trim() || isLoading)
                    ? 'rgba(59, 130, 246, 0.6)' 
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.9))',
                  color: 'white'
                }}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <HiPaperAirplane className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Generate</span>
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500">
                Try: "Add a welcome node" or "Create a customer support flow"
              </p>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
          {/* Node Creation Section */}
          {!isCollapsed && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Add Nodes
              </h4>
            </div>
          )}
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`
                  w-full flex items-center px-3 py-2.5 glass-item group
                  ${isCollapsed ? 'justify-center' : 'space-x-3'}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Control Items Section */}
          {controlItems.length > 0 && (
            <>
              {!isCollapsed && (
                <div className="mt-6 mb-4">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Flow Controls
                  </h4>
                </div>
              )}
              <div className="space-y-2">
                {controlItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.onClick}
                    className={`
                      w-full flex items-center px-3 py-2.5 glass-item group
                      ${isCollapsed ? 'justify-center' : 'space-x-3'}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium truncate">
                        {item.label}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Collapse Toggle - At Bottom */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 glass-item"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <HiMenuAlt2 className="w-5 h-5 text-gray-700" />
            ) : (
              <div className="flex items-center space-x-2">
                <HiChevronLeft className="w-5 h-5 text-gray-700" />
                <span className="text-sm text-gray-700 font-medium">Collapse</span>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
