--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
function __TS__ObjectRest(target, usedProperties)
    local result = {}
    for property in pairs(target) do
        if not usedProperties[property] then
            result[property] = target[property]
        end
    end
    return result
end

local ____exports = {}
local nk = require("nakama")
local function initialize_user(context, payload)
    if payload.created then
        local ____ = context.vars
        local address = ____.address
        local display_name = ____.display_name
        local avatar_url = ____.avatar_url
        local metadata = __TS__ObjectRest(____, {address = true, display_name = true, avatar_url = true})
        nk.account_update_id(context.user_id, metadata, nil, display_name, nil, nil, nil, avatar_url)
    end
end
nk.register_req_after(initialize_user, "AuthenticateCustom")
return ____exports
