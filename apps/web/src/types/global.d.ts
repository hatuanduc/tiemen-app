export {};

declare global {
  interface Window {
    __TIEMEN__?: {
      apiBaseUrl?: string;
    };
  }
}
