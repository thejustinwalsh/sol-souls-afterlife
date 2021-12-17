/** @noSelfInFile */
import * as nk from 'nakama';

function initialize_user(context: { user_id: string, username: string, vars: Record<string, string>}, payload: { created: boolean }) {
  if (payload.created) {
    const { address, display_name, avatar_url, ...metadata } = context.vars;
    nk.account_update_id(context.user_id, metadata, context.username, display_name, undefined, undefined, undefined, avatar_url);
  }
}

nk.register_req_after(initialize_user, 'AuthenticateCustom');
