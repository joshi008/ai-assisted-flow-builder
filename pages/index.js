import { useState } from "react";
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
        if (flowOperations.clearFlow && confirm('Are you sure you want to clear the entire flow?')) {
          flowOperations.clearFlow();
        }
      }
    }
  ];

  const handleInputSubmit = async (text) => {
    if (!flowOperations.getCurrentFlow || !flowOperations.applyAIFlow) {
      alert('Flow operations not ready. Please wait a moment.');
      return;
    }

    try {
      // Show loading state
      console.log('Generating AI flow for prompt:', text);
      
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
          console.log('AI flow applied successfully');
          // Could show success message here
        } else {
          throw new Error('Failed to apply AI-generated flow');
        }
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleNodesChange = (operations) => {
    setFlowOperations(prev => ({ ...prev, ...operations }));
  };

  const handleEdgesChange = (operations) => {
    setFlowOperations(prev => ({ ...prev, ...operations }));
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
      {/* Background Image with Glass Effect */}
      <div className="fixed inset-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/background.jpg)',
          }}
        />
        {/* Glass Overlay for Better Contrast */}
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/5 via-transparent to-blue-900/10" />
      </div>

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
