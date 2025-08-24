import { useState, useCallback } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { 
  HiPlus, 
  HiCube,
  HiClipboardList,
  HiMenuAlt2,
  HiSave,
  HiTrash
} from "react-icons/hi";
import Sidebar from "../components/Sidebar";
import FlowCanvas from "../components/FlowCanvas";
import BackgroundLoader from "../components/BackgroundLoader";
import { showToast } from "../utils/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [flowOperations, setFlowOperations] = useState({});

  const menuItems = [
    {
      id: 'add-prompt',
      label: 'Add Prompt Node',
      icon: HiCube,
      onClick: () => {
        if (flowOperations.addPromptNode) {
          flowOperations.addPromptNode();
        }
      }
    },
    {
      id: 'add-task',
      label: 'Add Task Node', 
      icon: HiClipboardList,
      onClick: () => {
        if (flowOperations.addTaskNode) {
          flowOperations.addTaskNode();
        }
      }
    }
  ];

  const controlItems = [
    {
      id: 'save-flow',
      label: 'Save Locally',
      icon: HiSave,
      onClick: () => {
        if (flowOperations.saveFlow) {
          flowOperations.saveFlow();
        }
      }
    },
    {
      id: 'clear-flow',
      label: 'Clear Flow',
      icon: HiTrash,
      onClick: () => {
        if (flowOperations.clearFlow) {
          showToast.confirm(
            'Are you sure you want to clear the entire flow? This action cannot be undone.',
            () => {
              flowOperations.clearFlow();
              showToast.success('Flow cleared successfully');
            }
          );
        }
      }
    }
  ];

  const handleInputSubmit = async (text) => {
    if (!flowOperations.getCurrentFlow || !flowOperations.applyAIFlow) {
      showToast.warning('Flow operations not ready. Please wait a moment.');
      return;
    }

    try {
      // Show loading toast
      const loadingToast = showToast.loading('Generating AI flow...');
      
      const currentFlow = flowOperations.getCurrentFlow();
      
      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          currentFlow: currentFlow,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flow');
      }

      if (data.success && data.flow) {
        const success = flowOperations.applyAIFlow(data.flow);
        if (success) {
          showToast.update(loadingToast, {
            render: 'AI flow generated successfully! 🎉',
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          });
        } else {
          throw new Error('Failed to apply AI-generated flow');
        }
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      showToast.error(`AI Generation Error: ${error.message}`, {
        autoClose: 6000,
      });
    }
  };

  const handleNodesChange = useCallback((operations) => {
    setFlowOperations(prev => ({ ...prev, ...operations }));
  }, []);

  const handleEdgesChange = useCallback((operations) => {
    setFlowOperations(prev => ({ ...prev, ...operations }));
  }, []);

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      <BackgroundLoader />

      <div className="relative flex h-screen">
        {/* Sidebar Component */}
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          logoIcon={HiCube}
          appName="Promptinator"
          menuItems={menuItems}
          controlItems={controlItems}
          onInputSubmit={handleInputSubmit}
          inputPlaceholder="Enter your prompt or task..."
        />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-80'
        }`}>
          {/* Mobile Header */}
          <div className="lg:hidden glass border-b border-white/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 glass-item"
              >
                <HiMenuAlt2 className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-lg font-bold text-gray-800">
                Promptinator
              </h1>
              <div className="w-10"></div> {/* Spacer */}
            </div>
          </div>

          {/* Content Area - React Flow Canvas */}
          <main className="flex-1 p-6 overflow-hidden">
            <FlowCanvas 
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
            />
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 z-40 blur"
          style={{background: 'rgba(0, 0, 0, 0.2)'}}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
}
