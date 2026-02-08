import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  createPingMessageV2,
  createGetConfigMessageV2,
  createGetChannelsMessageV2,
  createGetAssetsMessageV2,
  createGetLedgerBalancesMessage,
  createGetAppSessionsMessageV2,
  createAppSessionMessage,
  createCloseAppSessionMessage,
  createECDSAMessageSigner,
  getResult,
  getError,
  getRequestId,
  type MessageSigner,
  type RPCAppSession,
  type RPCAsset,
  type RPCBalance,
  RPCChannelStatus,
  RPCProtocolVersion,
} from "@erc7824/nitrolite";
import { type Address, type Hex } from "viem";

// ── Constants ────────────────────────────────────────────────
export const CLEARNODE_URL = "wss://clearnet.yellow.com/ws";

// ── Types ────────────────────────────────────────────────────
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "authenticating"
  | "connected"
  | "error";

export interface YellowConfig {
  nodeUrl: string;
  privateKey: Hex;
  applicationAddress: string;
}

export interface ClearNodeConnection {
  ws: WebSocket | null;
  status: ConnectionStatus;
  error: string | null;
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Send a JSON message over WebSocket and wait for a matching response by requestId.
 */
export function sendAndWait(
  ws: WebSocket,
  message: string,
  timeoutMs = 15000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = JSON.parse(message);
    const reqId = parsed.req?.[0] as number | undefined;

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Request timed out"));
    }, timeoutMs);

    function onMessage(event: MessageEvent) {
      try {
        const data = JSON.parse(event.data);
        const respId = getRequestId(data);
        if (reqId !== undefined && respId === reqId) {
          cleanup();
          const error = getError(data);
          if (error) {
            reject(new Error(`RPC error ${error.code}: ${error.message}`));
          } else {
            resolve(data);
          }
        }
      } catch {
        // not our message, ignore
      }
    }

    function cleanup() {
      clearTimeout(timer);
      ws.removeEventListener("message", onMessage);
    }

    ws.addEventListener("message", onMessage);
    ws.send(message);
  });
}

/**
 * Authenticate with ClearNode using ECDSA private key.
 * Flow: auth_challenge -> sign challenge -> auth_verify
 */
export async function authenticate(
  ws: WebSocket,
  signer: MessageSigner,
  walletAddress: Address
): Promise<void> {
  // Step 1 — Request auth challenge
  const challengeMsg = await createAuthRequestMessage({
    address: walletAddress,
    session_key: walletAddress,
    application: "brocrunch",
    allowances: [],
    expires_at: BigInt(Math.floor(Date.now() / 1000) + 86400),
    scope: "console",
  });
  const challengeResp = await sendAndWait(ws, challengeMsg);
  const challengeResult = getResult(challengeResp);
  if (!challengeResult?.[0]) {
    throw new Error("No challenge received from ClearNode");
  }

  // Step 2 — Sign and verify
  const verifyMsg = await createAuthVerifyMessage(
    signer,
    challengeResult[0]
  );
  await sendAndWait(ws, verifyMsg);
}

/**
 * Connect to ClearNode, authenticate, and return the WebSocket.
 */
export async function connectToClearNode(
  config: YellowConfig,
  onStatus: (s: ConnectionStatus, err?: string) => void
): Promise<WebSocket> {
  onStatus("connecting");

  const ws = new WebSocket(config.nodeUrl);
  const signer = createECDSAMessageSigner(config.privateKey);

  return new Promise((resolve, reject) => {
    ws.onopen = async () => {
      try {
        onStatus("authenticating");
        // Derive address from private key
        const { privateKeyToAccount } = await import("viem/accounts");
        const account = privateKeyToAccount(config.privateKey);
        await authenticate(ws, signer, account.address);
        onStatus("connected");
        resolve(ws);
      } catch (err: any) {
        onStatus("error", err.message);
        ws.close();
        reject(err);
      }
    };

    ws.onerror = (event) => {
      onStatus("error", "WebSocket connection failed");
      reject(new Error("WebSocket connection failed"));
    };

    ws.onclose = () => {
      onStatus("disconnected");
    };
  });
}

// ── Query helpers ────────────────────────────────────────────

export async function ping(ws: WebSocket): Promise<any> {
  const msg = createPingMessageV2();
  return sendAndWait(ws, msg);
}

export async function getConfig(ws: WebSocket): Promise<any> {
  const msg = createGetConfigMessageV2();
  const resp = await sendAndWait(ws, msg);
  return getResult(resp);
}

export async function getChannels(
  ws: WebSocket,
  participant?: Address,
  status?: RPCChannelStatus
): Promise<any> {
  const msg = createGetChannelsMessageV2(participant, status);
  const resp = await sendAndWait(ws, msg);
  return getResult(resp);
}

export async function getAssets(
  ws: WebSocket,
  chainId?: number
): Promise<RPCAsset[]> {
  const msg = createGetAssetsMessageV2(chainId);
  const resp = await sendAndWait(ws, msg);
  return getResult(resp) as RPCAsset[];
}

export async function getAppSessions(
  ws: WebSocket,
  participant: Address,
  status?: RPCChannelStatus
): Promise<RPCAppSession[]> {
  const msg = createGetAppSessionsMessageV2(participant, status);
  const resp = await sendAndWait(ws, msg);
  return getResult(resp) as RPCAppSession[];
}

export async function getLedgerBalances(
  ws: WebSocket,
  signer: MessageSigner,
  accountId?: string
): Promise<RPCBalance[]> {
  const msg = await createGetLedgerBalancesMessage(signer, accountId);
  const resp = await sendAndWait(ws, msg);
  return getResult(resp) as RPCBalance[];
}

export async function createAppSession(
  ws: WebSocket,
  signer: MessageSigner,
  params: {
    participants: Address[];
    weights: number[];
    quorum: number;
    challenge: number;
    application: string;
    allocations: { asset: string; amount: string; participant: Address }[];
  }
): Promise<any> {
  const msg = await createAppSessionMessage(signer, {
    definition: {
      application: params.application,
      protocol: RPCProtocolVersion.NitroRPC_0_4,
      participants: params.participants as Hex[],
      weights: params.weights,
      quorum: params.quorum,
      challenge: params.challenge,
    },
    allocations: params.allocations,
  });
  const resp = await sendAndWait(ws, msg);
  return getResult(resp);
}

export async function closeAppSession(
  ws: WebSocket,
  signer: MessageSigner,
  appSessionId: Hex,
  allocations: { asset: string; amount: string; participant: Address }[]
): Promise<any> {
  const msg = await createCloseAppSessionMessage(signer, {
    app_session_id: appSessionId,
    allocations,
  });
  const resp = await sendAndWait(ws, msg);
  return getResult(resp);
}
