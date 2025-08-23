import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, currentFlow } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Valid prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Create the context for the AI
    const flowContext = `
You are a React Flow diagram assistant for a node-based workflow builder called "Promptinator".

CURRENT FLOW STRUCTURE:
${JSON.stringify(currentFlow, null, 2)}

SUPPORTED NODE TYPES:
1. PROMPT NODE:
   - type: "promptNode"
   - data: { title: string, prompt: string, variables: string[], transitions: string[] }
   - Used for AI prompts with conditional transitions

2. TASK NODE:
   - type: "taskNode" 
   - data: { title: string, description: string }
   - Used for general tasks

JSON STRUCTURE REQUIREMENTS:
- Each node needs: id, type, position: {x, y}, data
- Node IDs should be: "prompt-{timestamp}" or "task-{timestamp}"
- Positions should be spread out (x: 100-800, y: 100-600) 
- Variables in prompts use {{variable_name}} format
- Transitions are conditions like "user says yes", "user asks for help"

RULES:
1. Always return valid JSON in exactly this format:
{
  "nodes": [...],
  "edges": [...]
}

2. Preserve existing nodes unless specifically asked to modify/delete them
3. Add new nodes with reasonable positioning (avoid overlaps)
4. Create edges between nodes when relationships are mentioned
5. For transitions, add them to the transitions array in node data
6. Variables should be in the variables array and used in prompt with {{}}

USER REQUEST: "${prompt}"

Please generate the updated flow JSON. Only return the JSON, no explanations.`;

    // Get the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Generate content
    const result = await model.generateContent(flowContext);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    let generatedFlow;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      generatedFlow = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return res.status(500).json({ 
        error: 'AI returned invalid JSON format',
        aiResponse: text 
      });
    }

    // Validate the structure
    if (!generatedFlow.nodes || !Array.isArray(generatedFlow.nodes)) {
      return res.status(500).json({ 
        error: 'Generated flow missing valid nodes array' 
      });
    }

    if (!generatedFlow.edges || !Array.isArray(generatedFlow.edges)) {
      return res.status(500).json({ 
        error: 'Generated flow missing valid edges array' 
      });
    }

    // Validate each node has required properties
    for (const node of generatedFlow.nodes) {
      if (!node.id || !node.type || !node.position || !node.data) {
        return res.status(500).json({ 
          error: 'Generated node missing required properties (id, type, position, data)' 
        });
      }

      if (!['promptNode', 'taskNode'].includes(node.type)) {
        return res.status(500).json({ 
          error: `Invalid node type: ${node.type}. Must be 'promptNode' or 'taskNode'` 
        });
      }

      // Validate position
      if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        return res.status(500).json({ 
          error: 'Node position must have numeric x and y values' 
        });
      }

      // Validate node data based on type
      if (node.type === 'promptNode') {
        if (!node.data.title || !node.data.prompt) {
          return res.status(500).json({ 
            error: 'Prompt node missing required title or prompt' 
          });
        }
        if (!Array.isArray(node.data.variables)) node.data.variables = [];
        if (!Array.isArray(node.data.transitions)) node.data.transitions = [];
      }

      if (node.type === 'taskNode') {
        if (!node.data.title || !node.data.description) {
          return res.status(500).json({ 
            error: 'Task node missing required title or description' 
          });
        }
      }
    }

    // Validate edges
    for (const edge of generatedFlow.edges) {
      if (!edge.id || !edge.source || !edge.target) {
        return res.status(500).json({ 
          error: 'Edge missing required properties (id, source, target)' 
        });
      }
    }

    return res.status(200).json({ 
      success: true, 
      flow: generatedFlow 
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate flow with AI',
      details: error.message 
    });
  }
}
