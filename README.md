# 🚀 Promptinator

A modern, AI-powered node-based workflow builder for creating and managing prompt flows with a beautiful glassmorphism UI.

![Promptinator Demo](https://img.shields.io/badge/Status-Active-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black) ![React](https://img.shields.io/badge/React-19.1.0-blue) ![React Flow](https://img.shields.io/badge/React%20Flow-12.8.4-purple)

## ✨ Features

### 🔗 **Node-Based Workflow Builder**
- **Drag-and-drop interface** powered by React Flow
- **Two node types**: Prompt Nodes and Task Nodes
- **Visual connections** between nodes with conditional transitions
- **Real-time edge synchronization** with node changes

### 🤖 **AI-Powered Flow Generation**
- **Google Gemini integration** for intelligent flow creation
- **Natural language prompts** to generate workflows
- **Context-aware suggestions** based on existing flow
- **Automatic node positioning** and connection logic

### 📝 **Advanced Node Features**

#### **Prompt Nodes**
- **Inline text editing** for titles and prompts
- **Variable system** with `{{variable}}` syntax
- **Conditional transitions** with custom conditions
- **Connection status indicators** with purple glow effects
- **Drag-and-drop connections** via transition handles

#### **Task Nodes**
- **Simple task management** with title and description
- **Clean, focused interface** for general tasks
- **Consistent styling** with the overall theme

### 💾 **Data Management**
- **Local storage persistence** - flows survive page refreshes
- **Save/Load functionality** with one-click operations
- **JSON export/import** for flow data
- **Circular dependency validation** to prevent invalid flows

### 🎯 **User Experience**
- **Collapsible sidebar** with quick actions
- **Triple-dot menus** for node-specific actions
- **Plus icons** for quick addition of variables/transitions
- **Toast notifications** for all user feedback
- **Keyboard shortcuts** (Enter to save, Escape to cancel)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4
- **Flow Editor**: React Flow 12.8.4
- **Icons**: React Icons 5.5.0
- **AI Integration**: Google Generative AI 0.24.1
- **Notifications**: React Toastify 11.0.5

## 🚀 Getting Started

### Prerequisites
- Node.js 18.18.0 or higher
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sarvam-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## 📖 Usage Guide

### Creating Your First Flow

1. **Add a Prompt Node**
   - Click "Add Prompt Node" in the sidebar
   - Edit the title by clicking on it
   - Add your prompt text in the text area
   - Add variables using the `{{variable}}` syntax

2. **Add Variables**
   - Click the "+" icon next to "Variables"
   - Type the variable name and press Enter
   - Variables automatically appear in your prompt

3. **Create Transitions**
   - Click the "+" icon next to "Transitions"
   - Edit the condition text (e.g., "user says yes")
   - Drag from the green handle to connect to another node

4. **Add Task Nodes**
   - Click "Add Task Node" in the sidebar
   - Add a description for the task
   - Connect it to other nodes as needed

### Using AI Generation

1. **Type a natural language prompt** in the sidebar input
   - Example: "Create a customer support flow"
   - Example: "Add a welcome node at the beginning"

2. **Click Generate** and watch the AI create your flow

3. **The AI will**:
   - Preserve your existing nodes
   - Add new nodes with proper positioning
   - Create logical connections
   - Add appropriate variables and transitions

### Saving and Loading

- **Save Flow**: Click the save icon in the sidebar
- **Clear Flow**: Click the trash icon (with confirmation)
- **Auto-save**: Flows are automatically saved to local storage

## 🏗️ Architecture

### Component Structure

```
components/
├── nodes/
│   ├── BaseNode.js          # Reusable node functionality
│   ├── PromptNode.js         # AI prompt nodes
│   └── TaskNode.js           # General task nodes
├── FlowCanvas.js             # React Flow container
└── Sidebar.js                # Navigation and controls

pages/
├── index.js                  # Main dashboard
├── _app.js                   # App wrapper with toast container
└── api/
    └── ai-generate.js        # Gemini AI integration

utils/
└── toast.js                  # Toast notification utilities
```

### Key Design Patterns

#### **Base Node Architecture**
```javascript
// Reusable hook for all node types
export const useBaseNode = (id, data) => {
  // Common state and handlers
  return { isEditing, handleUpdate, handleDelete, ... };
};

// Reusable UI components
export const BaseNodeContainer = ({ children, ... }) => { ... };
export const BaseNodeHeader = ({ title, menuItems, ... }) => { ... };
```

#### **AI Integration**
```javascript
// Configurable AI prompt at top of file
const AI_SYSTEM_PROMPT = `
You are a React Flow diagram assistant...
{{currentFlow}}
{{userPrompt}}
`;

// Template-based prompt generation
const flowContext = AI_SYSTEM_PROMPT
  .replace('{{currentFlow}}', JSON.stringify(currentFlow, null, 2))
  .replace('{{userPrompt}}', prompt);
```

## 🎨 Customization

### Adding New Node Types

1. **Create a new node component**:
   ```javascript
   import { useBaseNode, BaseNodeContainer, BaseNodeHeader } from './BaseNode';
   
   export default function CustomNode({ id, data }) {
     const baseNode = useBaseNode(id, data);
     
     return (
       <BaseNodeContainer>
         <BaseNodeHeader title={data.title} menuItems={[]} />
         {/* Custom content */}
       </BaseNodeContainer>
     );
   }
   ```

2. **Register in FlowCanvas.js**:
   ```javascript
   const nodeTypes = {
     promptNode: PromptNode,
     taskNode: TaskNode,
     customNode: CustomNode, // Add your new node type
   };
   ```

### Customizing AI Behavior

Edit the `AI_SYSTEM_PROMPT` constant in `pages/api/ai-generate.js`:

```javascript
const AI_SYSTEM_PROMPT = `
You are a specialized assistant for...
// Modify the prompt to change AI behavior
`;
```

## 🔧 Development

### Project Scripts

```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run start  # Start production server
```

### Code Structure Guidelines

- **Components**: Use the base node architecture for consistency
- **Styling**: Follow the glass theme patterns
- **State Management**: Use React hooks and local state
- **API Routes**: Keep AI logic in dedicated API routes
- **Toast Messages**: Use the toast utility for all user feedback

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- **React Flow** for the excellent flow editor
- **Google Gemini** for AI capabilities
- **Tailwind CSS** for the utility-first styling
- **Next.js** for the robust framework
- **React Icons** for the beautiful icon set

---

**Built with ❤️ using modern web technologies**

For questions or support, please open an issue on GitHub.