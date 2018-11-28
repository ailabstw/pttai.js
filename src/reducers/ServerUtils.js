import { API_ROOT2 }  from 'config'
import { Base64 }     from 'js-base64'

import * as api       from '../middleware/api'
import { getUUID }    from '../utils/utils'

import { LIST_ORDER_PREV, LIST_ORDER_NEXT } from '../constants/Constants'

/*                      */
/*  Content - Boards    */
/*                      */

export const createBoard = (title) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_createBoard", "params": [b64encode(title), true]},
    }
  }
}

export const getBoard = (boardId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getBoard", "params": [boardId]},
    }
  }
}

export const getBoardUrl = (boardId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_showBoardURL", "params": [boardId]},
    }
  }
}

export const getBoards = (startBoardId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getBoardList", "params": [startBoardId, limit, LIST_ORDER_NEXT]},
    }
  }
}

export const joinBoard = (boardUrl) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_joinBoard", "params": [boardUrl]},
    }
  }
}

export const markBoard = (boardId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_markBoardSeen", "params": [boardId]},
    }
  }
}

export const setBoardName = (boardId, boardName) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_setTitle", "params": [boardId, b64encode(boardName)]},
    }
  }
}

export const getMemberList = (boardId, starUserId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getMemberList", "params": [boardId, starUserId, limit]},
    }
  }
}

export const deleteBoard = (boardId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_deleteBoard", "params": [boardId]},
    }
  }
}

/*                      */
/*  Content - Articles  */
/*                      */

export const createArticle = (boardId, title, articleArray, mediaStr) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_createArticle", "params": [boardId, b64encode(title), articleArray.map(b64encode), mediaStr]},
    }
  }
}

export const updateArticle = (boardId, articleId, articleArray, mediaIds) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_updateArticle", "params": [boardId, articleId, articleArray.map(b64encode), mediaIds]},
    }
  }
}

export const deleteArticle = (boardId, articleId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_deleteArticle", "params": [boardId, articleId]},
    }
  }
}

export const getArticle = (boardId, articleId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getArticle", "params": [boardId, articleId]},
    }
  }
}

export const getArticles = (boardId, startArticleId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getArticleList", "params": [boardId, startArticleId, limit, 1]},
    }
  }
}

export const getArticleSummaryByIds = (boardId, articleInfos) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getArticleSummaryByIDs", "params": [boardId, articleInfos]},
    }
  }
}

export const markArticle = (boardId, articleId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_markArticleSeen", "params": [boardId, articleId]},
    }
  }
}

/*                      */
/*  Content - Content   */
/*                      */

export const getContent = (boardId, articleId, subContentId, contentType, blockId, limit, listOrder) => {
/* Only fetch article, set limit = 0        */
/* Only fetch comment, set contentType = 1  */
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getArticleBlockList", "params": [boardId, articleId, subContentId, contentType, blockId, limit, listOrder]},
    }
  }
}

export const createComment = (boardId, articleId, comment, mediaId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"content_createComment", "params":[boardId, articleId, 0 , b64encode(comment), mediaId]},
    }
  }
}

export const deleteComment = (boardId, articleId, commentId, mediaId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"content_deleteComment", "params":[boardId, articleId, commentId]},
    }
  }
}


/*           */
/*  Friend   */
/*           */

export const getFriend = (friendId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"friend_getFriendByFriendID", "params":[friendId]},
    }
  }
}

export const getFriends = (startFriendId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "friend_getFriendList", "params": [startFriendId, limit]},
    }
  }
}

export const addNewFriend = (name) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_joinFriend", "params": [name]},
    }
  }
}

export const markFriendSeen = (chatId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "friend_markFriendSeen", "params": [chatId]},
    }
  }
}

/*           */
/*  Message  */
/*           */

export const getMessageList = (chatId, startMessageId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"friend_getMessageList", "params":[chatId, startMessageId, limit, 1]},
    }
  }
}

export const getMessageBlockList = (friendId, messageId, subContentId, contentType, blockID, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"friend_getMessageBlockList", "params":[friendId, messageId, subContentId, contentType, blockID, limit]},
    }
  }
}

export const postMessage = (friendId, message, mediaIds) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"friend_createMessage", "params":[friendId, message.map(b64encode), mediaIds]},
    }
  }
}

/*           */
/*  Users    */
/*           */

export const getUserNameByIds = (userIds) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"account_getUserNameByIDs", "params":[userIds]},
    }
  }
}

export const getUserName = (userId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"account_getUserName", "params":[userId]},
    }
  }
}

export const getUserImgByIds = (userIds) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"account_getUserImgByIDs", "params":[userIds]},
    }
  }
}

export const getUserImg = (userId) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"account_getUserImg", "params":[userId]},
    }
  }
}

export const editName = (name) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_setMyName", "params": [b64encode(name)]},
    }
  }
}

export const getUsersInfo = (userIds) => {
  return dispatch => Promise.all([
    dispatch(getUserNameByIds(userIds))
      .then(({response: {result}, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key':'userName', 'value': error }
        } else {
          return { 'error': false, 'key':'userName', 'value': result }
        }
      }),
    dispatch(getUserImgByIds(userIds))
      .then(({response: {result}, type, query, error}) => {
        if (error) {
          return { 'error': true, 'key':'userImg', 'value': error }
        } else {
          return { 'error': false, 'key':'userImg', 'value': result }
        }
      }),
  ]);
}

export const editProfileImg = (myImg) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_setMyImage", "params": [myImg]},
    }
  }
}

/*           */
/*  Oplog    */
/*           */

export const getPttOpLogList = (logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "ptt_getPttOplogList", "params": [logId, limit, LIST_ORDER_PREV]},
    }
  }
}

export const getPttMasterOpLog = (logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_getMasterOplogList", "params": [logId, limit, 2]},
    }
  }
}

export const getPttMeOpLog = (logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_getMeOplogList", "params": [logId, limit, LIST_ORDER_NEXT]},
    }
  }
}

export const getPeers = () => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "ptt_getPeers", "params": []},
    }
  }
}

export const getContentBoardOpLog = (boardId, logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getBoardOplogList", "params": [boardId, logId, limit, 2]},
    }
  }
}

export const getContentCommentOpLog = (boardId, logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getCommentOplogList", "params": [boardId, logId, limit, 2]},
    }
  }
}

export const getContentMasterOpLog = (boardId, logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getMasterOplogList", "params": [boardId, logId, limit, 2]},
    }
  }
}

export const getContentMemberOpLog = (boardId, logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "content_getMemberOplogList", "params": [boardId, logId, limit, 2]},
    }
  }
}

export const getFriendFriendOpLog = (logId, limit) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "friend_getFriendOplogList", "params": [logId, limit, 2]},
    }
  }
}

/*                */
/*  Multi-device  */
/*                */

export const getMyNodes = () => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method":"me_getMyNodes", "params":[]},
    }
  }
}

export const showMyURL = () => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_showMeURL", "params": []},
    }
  }
}

export const showURL = () => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_showURL", "params": []},
    }
  }
}

export const showMyKey = () => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_showMyKey", "params": []},
    }
  }
}

export const showMe = () => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_get", "params": []},
    }
  }
}

export const joinMe = (nodeId, key) => {
  return {
    [api.CALL_API]: {
      endpoint: '/',
      method: 'post',
      json: {"id": getUUID(false), "method": "me_joinMe", "params": [nodeId, key, false]},
    }
  }
}

/*                */
/*  Multi-media   */
/*                */

export const uploadImg = (boardId, image) => {
  return {
    [api.CALL_API]: {
      endpoint: API_ROOT2 + '/api/upload/' + boardId,
      method: 'post',
      files: { 'file': image.file },
    }
  }
}

export const uploadFile = (boardId, file) => {
  return {
    [api.CALL_API]: {
      endpoint: API_ROOT2 + '/api/uploadfile/' + boardId,
      method: 'post',
      files: { 'file': file.file },
    }
  }
}

export const downloadFile = (boardId, mediaId) => {
  return {
    [api.CALL_API]: {
      endpoint: API_ROOT2 + '/api/file/' + boardId + '/' + mediaId,
      method: 'get',
      files: { 'gzip': true },
      gzip: true,
    }
  }
}

/*              */
/*  Utilities   */
/*              */

export const deserialize = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if(typeof data[eachIdx] === "string" && !eachIdx.endsWith('ID')) {
      v = b64decode(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const serialize = (data) => {
  return Object.keys(data).reduce((r, eachIdx, i) => {
    let v = data[eachIdx]
    if(typeof data[eachIdx] === "string" && !eachIdx.endsWith('ID')) {
      v = b64encode(data[eachIdx])
    }
    r[eachIdx] = v
    return r
  }, {})
}

export const b64encodeByte = (str) => {
  return Base64.btoa(str)
}

export const b64encode = (str) => {
  return Base64.encode(str)
}

export const b64decode = (str) => {
  return Base64.decode(str)
}

export const b64decodeByte = (str) => {
  return Base64.atob(str)
}
