export const CREATE_BOARD_MODAL 	= 'CREATE_BOARD_MODAL'
export const MANAGE_BOARD_MODAL     = 'MANAGE_BOARD_MODAL'
export const CREATE_ARTICLE_MODAL 	= 'CREATE_ARTICLE_MODAL'
export const CREATE_MY_ARTICLE_MODAL= 'CREATE_MY_ARTICLE_MODAL'
export const EDIT_ARTICLE_MODAL     = 'EDIT_ARTICLE_MODAL'
export const FIRST_POPUP_MODAL      = 'FIRST_POPUP_MODAL'
export const ADD_KNOWN_BOARD_MODAL  = 'ADD_KNOWN_BOARD_MODAL'
export const EDIT_NAME_MODAL        = 'EDIT_NAME_MODAL'
export const SHOW_DEVICE_INFO       = 'SHOW_DEVICE_INFO'
export const ADD_FRIEND_MODAL       = 'ADD_FRIEND_MODAL'
export const ADD_DEVICE_MODAL       = 'ADD_DEVICE_MODAL'
export const ADD_DEVICE_SCANNER_MODAL = 'ADD_DEVICE_SCANNER_MODAL'
export const BOARD_ACTION_MODAL     = 'BOARD_ACTION_MODAL'
export const SETTING_MENU_MODAL     = 'SETTING_MENU_MODAL'
export const LATEST_PAGE_MODAL      = 'LATEST_PAGE_MODAL'
export const SHOW_OP_LOG_MODAL      = 'SHOW_OP_LOG_MODAL'

export const EMPTY_ID               = ''
export const DEFAULT_USER_NAME      = 'guest'
export const DEFAULT_USER_IMAGE     = '/images/icon_avatar@2x.png'

export const REFRESH_INTERVAL           = 5000
export const CONTENT_REFETCH_INTERVAL   = 1000
export const ATTACHMENT_LOAD_INTERVAL   = 100
export const PRESS_TO_EDIT_DELAY        = 400
export const ARTICLE_PULL_COUNT_DOWN    = 10

export const NUM_BOARD_PER_REQ      = 100
export const NUM_FRIEND_PER_REQ     = 100
export const NUM_MEMBER_PER_REQ     = 100
export const NUM_ARTICLE_PER_REQ    = 50
export const NUM_NEWS_PER_REQ       = 20
export const NUM_CONTENT_PER_REQ    = 100
export const NUM_MESSAGE_PER_REQ    = 30
export const NUM_OPLOG_PER_REQ      = 100

export const NUM_CACHE_MESSAGE      = 100
export const NUM_CACHE_ARTILCE      = 100
export const NUM_CACHE_COMMENT      = 100


export const MAX_USER_IMG_SIZE      = 32000
export const MAX_USER_IMG_WIDTH     = 256
export const MAX_FILE_UPLOAD_SIZE   = 10485760
export const MAX_USER_NAME_SIZE     = 25
export const MAX_COMMENT_SIZE       = 500
export const MAX_ARTICLE_SIZE       = 131072
export const MAX_BOARDNAME_SIZE     = 50


export const MAX_EDITOR_IMG_SIZE    = 32000
export const MAX_EDITOR_IMG_WIDTH   = 1024

export const SHOW_PTT_MASTER_TAB         = 'SHOW_PTT_MASTER_TAB'
export const SHOW_PTT_ME_TAB             = 'SHOW_PTT_ME_TAB'
export const SHOW_CONTENT_BOARD_TAB      = 'SHOW_CONTENT_BOARD_TAB'
export const SHOW_CONTENT_COMMENT_TAB    = 'SHOW_CONTENT_COMMENT_TAB'
export const SHOW_CONTENT_MASTER_TAB     = 'SHOW_CONTENT_MASTER_TAB'
export const SHOW_CONTENT_MEMBER_TAB     = 'SHOW_CONTENT_MEMBER_TAB'
export const SHOW_FRIEND_FRIEND_TAB      = 'SHOW_FRIEND_FRIEND_TAB'
export const SHOW_PTT_PEERS_TAB          = 'SHOW_PTT_PEERS_TAB'
export const SHOW_LAST_ANNOUNCE_P2P_TAB  = 'SHOW_LAST_ANNOUNCE_P2P_TAB'

export const CONTENT_TYPE_ARTICLE   = 0
export const CONTENT_TYPE_COMMENT   = 1
export const CONTENT_TYPE_REPLY     = 2
export const BOARD_TYPE_GENERAL     = 0
export const BOARD_TYPE_PERSONAL    = 1

export const PTT_EDITOR_CLASS_NAME  = 'ql-editor'
export const IFRAME_CLASS_NAME      = 'ql-attachment'
export const ATTACHMENT_CLASS_NAME  = 'pttai-editor-file-attachment'

export const LIST_ORDER_PREV        = 1
export const LIST_ORDER_NEXT        = 2

export const MESSAGE_TYPE_TEXT      = 1
export const MESSAGE_TYPE_INVITE    = 2

export const PEER_TYPE_ARRAY = [
    'PeerTypeErr',
    'PeerTypeRemoved',
    'PeerTypeRandom',
    'PeerTypeMember',
    'PeerTypeImportant',
    'PeerTypeMe'
]

export const OP_TYPE_ARRAY = [
    'JoinMsg',
    'JoinAckChallengeMsg',

    'JoinEntityMsg',
    'ApproveJoinMsg',

    'JoinAlreadyRegisteredMsg',
    'JoinAckAlreadyRegistedMsg',

    'AddOpKeyOplogMsg', // 7
    'AddOpKeyOplogsMsg',
    'AddPendingOpKeyOplogMsg',
    'AddPendingOpKeyOplogsMsg',

    'SyncOpKeyOplogMsg',
    'SyncOpKeyOplogAckMsg',
    'SyncPendingOpKeyOplogMsg',
    'SyncPendingOpKeyOplogAckMsg',

    'SyncCreateOpKeyMsg',
    'SyncCreateOpKeyAckMsg',

    // master
    'AddMasterOplogMsg', // 17
    'AddMasterOplogsMsg',

    'AddPendingMasterOplogMsg',
    'AddPendingMasterOplogsMsg',

    'SyncMasterOplogMsg',
    'SyncMasterOplogAckMsg',
    'SyncMasterOplogNewOplogsMsg',
    'SyncMasterOplogNewOplogsAckMsg',

    'SyncPendingMasterOplogMsg',
    'SyncPendingMasterOplogAckMsg',

    // member
    'AddMemberOplogMsg', // 27
    'AddMemberOplogsMsg',

    'AddPendingMemberOplogMsg',
    'AddPendingMemberOplogsMsg',

    'SyncMemberOplogMsg',
    'SyncMemberOplogAckMsg',
    'SyncMemberOplogNewOplogsMsg',
    'SyncMemberOplogNewOplogsAckMsg',

    'SyncPendingMemberOplogMsg',
    'SyncPendingMemberOplogAckMsg',

    // peer
    'IdentifyPeerMsg', // 37
    'IdentifyPeerAckMsg',

    'BoardLastSeenMsg',
    'ArticleLastSeenMsg',

    'NMsg',
]

export const STATUS_ARRAY = [
    'StatusInvalid',
    'StatusInit',
    'StatusInternalSync',
    'StatusInternalPending',
    'StatusPending',
    'StatusSync',
    'StatusToBeSynced',
    'StatusAlive',
    'StatusFailed',
    // Putting intenal-deleted after alive.
    // Because it's the competition between update-object and pending-delete, which does not affect the new-object, and no dead-lock for pending-delete (referring to new-object).
    'StatusInternalDeleted',
    'StatusInternalRevoke',
    'StatusInternalTransfer',
    'StatusInternalMigrate',
    'StatusInternalTerminal',
    'StatusPendingDeleted',
    'StatusPendingRevoke',
    'StatusPendingTransfer',
    'StatusPendingMigrate',
    'StatusPendingTerminal',
    'StatusDeleted',
    'StatusRevoked',
    'StatusTransferred',
    'StatusMigrated',
    'StatusTerminal',
]

export const JOIN_STATUS_ARRAY = [
    'JoinStatusPending',
    'JoinStatusRequested',
    'JoinStatusWaitAccepted',
    'JoinStatusAccepted',
]
