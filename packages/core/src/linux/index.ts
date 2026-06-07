declare global {
  interface Window {
    receiveSignalFromCpp: (data: unknown) => void;
    webkit: {
      messageHandlers: {
        webnative: {
          postMessage: (message: string) => void;
        };
      };
    };
  }
}

type Resolver = (data: unknown) => void;
let pendingResolver: Resolver | undefined;

window.receiveSignalFromCpp = (data: unknown) => {
  pendingResolver?.(data);
  pendingResolver = undefined;
};

export function makeApiRequest<T = unknown>(
  action: Action,
  body: object = {},
): Promise<T> {
  return new Promise((resolve) => {
    pendingResolver = resolve as Resolver;
    window.webkit.messageHandlers.webnative.postMessage(
      JSON.stringify({ action, body }),
    );
  });
}

type Action = "authenticate";
