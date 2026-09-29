import { RentalProperty } from '../types/rental';

export const DEFAULT_N8N_WEBHOOK_URL =
  'https://harithalalam.app.n8n.cloud/webhook/b8f061d0-ddcd-4725-a42b-56d891fea6cc/chat';

export const DEFAULT_N8N_TEST_WEBHOOK_URL =
  'https://harithalalam.app.n8n.cloud/webhook-test/b8f061d0-ddcd-4725-a42b-56d891fea6cc/chat';

export interface N8nConfig {
  enabled: boolean;
  webhookUrl: string;
  isTestMode: boolean;
}

const STORAGE_KEY = 'haven_n8n_config';

export function getN8nConfig(): N8nConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        enabled: parsed.enabled ?? true,
        webhookUrl: parsed.webhookUrl || DEFAULT_N8N_WEBHOOK_URL,
        isTestMode: parsed.isTestMode ?? false,
      };
    }
  } catch (e) {
    console.warn('Could not read n8n config from localStorage', e);
  }

  return {
    enabled: true,
    webhookUrl: DEFAULT_N8N_WEBHOOK_URL,
    isTestMode: false,
  };
}

export function saveN8nConfig(config: N8nConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Could not save n8n config to localStorage', e);
  }
}

export interface N8nChatRequest {
  message: string;
  property?: RentalProperty;
  sessionId?: string;
  webhookUrl?: string;
}

export interface N8nChatResponse {
  success: boolean;
  reply: string;
  raw?: any;
  status?: number;
  isWorkflowInactive?: boolean;
  error?: string;
}

/**
 * Extracts a human-readable reply from any typical n8n AI Agent / Chat response shape
 */
export function extractN8nText(data: any): string {
  if (!data) return '';

  if (typeof data === 'string') {
    return data;
  }

  // If array returned by n8n
  if (Array.isArray(data) && data.length > 0) {
    return extractN8nText(data[0]);
  }

  // Standard n8n AI Agent node outputs
  if (typeof data.output === 'string') return data.output;
  if (typeof data.text === 'string') return data.text;
  if (typeof data.message === 'string') return data.message;
  if (typeof data.response === 'string') return data.response;
  if (typeof data.reply === 'string') return data.reply;
  if (typeof data.answer === 'string') return data.answer;

  // Nested structures like data.data.output or data.body
  if (data.data && typeof data.data === 'object') {
    return extractN8nText(data.data);
  }

  if (data.body && typeof data.body === 'object') {
    return extractN8nText(data.body);
  }

  // If object has JSON string inside
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

/**
 * Sends a message to the n8n webhook via the backend proxy
 */
export async function sendN8nChatMessage({
  message,
  property,
  sessionId,
  webhookUrl,
}: N8nChatRequest): Promise<N8nChatResponse> {
  const config = getN8nConfig();
  const effectiveUrl =
    webhookUrl ||
    (config.isTestMode
      ? config.webhookUrl.replace('/webhook/', '/webhook-test/')
      : config.webhookUrl);

  const payload = {
    webhookUrl: effectiveUrl,
    chatInput: message,
    message: message,
    sessionId: sessionId || `haven-user-${Date.now()}`,
    property: property
      ? {
          id: property.id,
          title: property.title,
          address: property.address,
          price: property.price,
          neighborhood: property.neighborhood,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          sqft: property.sqft,
          petPolicy: property.petPolicy?.type,
          parking: property.parking,
          availabilityStatus: property.availabilityStatus,
        }
      : undefined,
    landlord: property?.landlord
      ? {
          name: property.landlord.name,
          role: property.landlord.role,
        }
      : undefined,
  };

  try {
    // 1. Try local proxy route first (completely avoids CORS and browser preflight issues)
    const proxyRes = await fetch('/api/n8n-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (proxyRes.ok) {
      const result = await proxyRes.json();
      const n8nStatus = result.status;
      const n8nData = result.data;

      // Handle inactive workflow case
      if (n8nStatus === 404 && n8nData?.code === 404) {
        return {
          success: false,
          isWorkflowInactive: true,
          status: 404,
          reply:
            'Notice from n8n: The workflow is currently inactive in your n8n cloud dashboard. Please toggle the workflow to "Active" in the top-right corner of your n8n editor, or switch to Test Webhook mode.',
          raw: n8nData,
          error: n8nData.message || 'Workflow not active in n8n',
        };
      }

      if (result.ok && n8nData) {
        const extracted = extractN8nText(n8nData);
        return {
          success: true,
          reply: extracted || 'Received confirmation from your n8n AI agent.',
          raw: n8nData,
          status: n8nStatus,
        };
      }

      return {
        success: false,
        reply: extractN8nText(n8nData) || 'n8n webhook returned an empty response.',
        raw: n8nData,
        status: n8nStatus,
        error: n8nData?.message || 'Non-OK status from n8n',
      };
    }
  } catch (err: any) {
    console.warn('Proxy route failed, attempting direct fetch...', err);
  }

  // 2. Direct client fallback (if running statically or proxy unavailable)
  try {
    const directRes = await fetch(effectiveUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const directData = await directRes.json().catch(async () => {
      const text = await directRes.text();
      return { output: text };
    });

    if (directRes.status === 404 && directData?.code === 404) {
      return {
        success: false,
        isWorkflowInactive: true,
        status: 404,
        reply:
          'Notice from n8n: The workflow is currently inactive in your n8n dashboard. Please toggle the workflow to "Active" in the top-right of the n8n editor.',
        raw: directData,
      };
    }

    const reply = extractN8nText(directData);
    return {
      success: directRes.ok,
      reply: reply || 'Response received from n8n.',
      raw: directData,
      status: directRes.status,
    };
  } catch (directErr: any) {
    return {
      success: false,
      reply: `Connection error: ${directErr.message || 'Could not reach n8n webhook'}. Check that your n8n instance is online and active.`,
      error: directErr.message,
    };
  }
}

/**
 * Pings n8n webhook to test connectivity
 */
export async function testN8nConnection(targetUrl?: string): Promise<{
  ok: boolean;
  status: number;
  message: string;
  isWorkflowInactive?: boolean;
}> {
  try {
    const config = getN8nConfig();
    const url =
      targetUrl ||
      (config.isTestMode
        ? config.webhookUrl.replace('/webhook/', '/webhook-test/')
        : config.webhookUrl);

    const res = await fetch('/api/n8n-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: url,
        message: 'Ping connection test',
        chatInput: 'Ping connection test',
        sessionId: 'ping-test',
      }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.status === 200) {
        return {
          ok: true,
          status: 200,
          message: 'Connected successfully to n8n AI Agent!',
        };
      }
      if (result.status === 404) {
        return {
          ok: false,
          status: 404,
          isWorkflowInactive: true,
          message:
            'n8n received request, but the workflow is inactive. Toggle "Active" to ON in your n8n cloud canvas.',
        };
      }
      return {
        ok: false,
        status: result.status,
        message: `n8n returned status ${result.status}`,
      };
    }

    return {
      ok: false,
      status: res.status,
      message: `Proxy returned status ${res.status}`,
    };
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      message: e.message || 'Network error connecting to n8n',
    };
  }
}
