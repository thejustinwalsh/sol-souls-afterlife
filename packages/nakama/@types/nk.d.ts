/** @noSelfInFile */

/** @noResolution */
declare module 'nakama' {
  export function account_update_id(user_id: string, metadata?: Record<string, string>, username?: string, display_name?: string, timezone?: string, location?: string, language?: string, avatar_url?: string): void;
  
  export function register_req_after(callback: (context: any, payload: any) => void, hook: string): void;

  export function json_encode(data: any): string;

  export function json_decode(data: string): any;
}
