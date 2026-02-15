export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface ToolResult {
  [key: string]: unknown;
}

export interface HandlerInput {
  householdId: string;
  userId: string;
  [key: string]: unknown;
}
