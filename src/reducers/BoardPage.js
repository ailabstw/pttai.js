import Immutable from 'immutable'
import { createDuck } from 'redux-duck'
import LRU from 'lru-cache'

import * as utils from './utils'
import * as serverUtils from './ServerUtils'

import * as constants from '../constants/Constants'
import { DEFAULT_USER_NAME,
  DEFAULT_USER_IMAGE,
  MESSAGE_TYPE_INVITE } from '../constants/Constants'
import { isUnRead, toJson, getSummaryTemplate } from '../utils/utils'

export const myClass = 'BOARD_PAGE'

export const myDuck = createDuck(myClass, 'board_page')

const INIT = myDuck.defineType('INIT')
const ADD_CHILD = myDuck.defineType('ADD_CHILD')
const SET_ROOT = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS = myDuck.defineType('REMOVE_CHILDS')
const REMOVE = myDuck.defineType('REMOVE')
const SET_DATA = myDuck.defineType('SET_DATA')
const UPDATE_DATA = myDuck.defineType('UPDATE_DATA')

const ADD_ARTICLE = myDuck.defineType('ADD_ARTICLE')
const PREPEND_ARTICLES = myDuck.defineType('PREPEND_ARTICLES')
const APPEND_ARTICLES = myDuck.defineType('APPEND_ARTICLES')

export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({ myId, myClass, myDuck, parentId, parentClass, parentDuck }))
  }
}

export const initParams = (myId, params) => {
  return (dispatch, getState) => {
    dispatch({
      myId,
      myClass,
      type: SET_DATA,
      data: { boardId: decodeURIComponent(params.boardId) }
    })
  }
}

/*                          */
/*  Get Board level Info    */
/*                          */

export const getBoardInfo = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoard(boardId))
      .then(({ response: { result }, type, query, error }) => {
        dispatch(postprocessGetBoardInfo(myId, result))
      })
  }
}

const postprocessGetBoardInfo = (myId, result) => {
  let boardInfo = {
    ID:        result.ID,
    BoardType: result.BT,
    CreatorID: result.C,
    Title:     serverUtils.b64decode(result.Title)
  }

  console.log('doBoardPage.postprocessGetBoardInfo: result:', boardInfo)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardInfo: boardInfo }
  }
}

/*                          */
/*  Update Board  Info      */
/*                          */

function sentInviteMessages (inviteMessages) {
  return dispatch => Promise.all(inviteMessages.map((invite) => {
    return dispatch(serverUtils.postMessage(invite.chatId, [invite.message], []))
      .then(({ response: { result }, type, query, error }) => {
        return { 'chatId': invite.chatId }
      })
  }))
}

function removeBoardMembers (boardId, memberToRemove) {
  return dispatch => Promise.all(memberToRemove.map((member) => {
    return dispatch(serverUtils.removeBoardMember(boardId, member.userId))
      .then(({ response: { result }, type, query, error }) => {
        return { 'userId': member.userId }
      })
  }))
}

export const inviteFriend = (myId, boardId, boardName, friendInvited) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoardUrl(boardId))
      .then(({ response: boardUrlResult, type, query, error }) => {
        const boardJoinKey = {
          C: boardUrlResult.result.C,
          ID: boardUrlResult.result.ID,
          Pn: boardUrlResult.result.Pn,
          T: boardUrlResult.result.T,
          URL: boardUrlResult.result.URL,
          UpdateTS: boardUrlResult.result.UT ? boardUrlResult.result.UT : utils.emptyTimeStamp(),
          expirePeriod: boardUrlResult.result.e
        }

        let inviteMessages = Object.keys(friendInvited).filter(fID => friendInvited[fID]).map(friendId => {
          let chatId = friendInvited[friendId]
          let message = {
            type: MESSAGE_TYPE_INVITE,
            value: `<div data-action-type="join-board" data-board-id="${boardId}" data-board-name="${boardName}" data-join-key="${boardJoinKey.URL}" data-update-ts="${boardJoinKey.UpdateTS.T}" data-expiration="${boardJoinKey.expirePeriod}"></div>`
          }
          return {
            chatId: chatId,
            message: JSON.stringify(message)
          }
        })

        dispatch(sentInviteMessages(inviteMessages))
          .then(({ response: inviteResult, type, error, query }) => {
            dispatch(postprocessInviteFriend(myId, boardId))
          })
      })
  }
}

const postprocessInviteFriend = (myId, boardId) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}

export const setBoardName = (myId, boardId, name) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.setBoardName(boardId, name))
      .then(({ response: { result }, type, query, error }) => {
        dispatch(postprocessSetBoardName(myId, boardId, name))
      })
  }
}

const postprocessSetBoardName = (myId, boardId, name) => {
  const combinedBoardInfo = {
    ID: boardId,
    Title: name
  }

  return {
    myId,
    myClass,
    type: UPDATE_DATA,
    data: { boardInfo: combinedBoardInfo }
  }
}

export const markBoard = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.markBoard(boardId))
      .then(({ response: { result }, type, error, query }) => {
        dispatch(postprocessMarkBoard(myId, result))
      })
  }
}

const postprocessMarkBoard = (myId, result) => {
  /* Do nothing */
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}

export const leaveBoard = (myId, boardId, callBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.leaveBoard(boardId))
      .then(({ response: { result, error }, type, query }) => {
        if (error) {
          callBackFunc({ error: true, data: error.message })
        } else {
          callBackFunc({ error: false, data: result })
          dispatch(postprocessLeaveBoard(myId, boardId))
        }
      })
  }
}

const postprocessLeaveBoard = (myId, boardId) => {
  /* Do nothing */
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}

export const deleteBoard = (myId, boardId, callBackFunc) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.deleteBoard(boardId))
      .then(({ response: { result, error }, type, query }) => {
        if (error) {
          callBackFunc({ error: true, data: error.message })
        } else {
          callBackFunc({ error: false, data: result })
          dispatch(postprocessDeleteBoard(myId, boardId))
        }
      })
  }
}

const postprocessDeleteBoard = (myId, boardId) => {
  /* Do nothing */
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}

export const removeMember = (myId, boardId, memberToRemove) => {
  return (dispatch, getState) => {
    let memberIds = Object.keys(memberToRemove).filter(mID => memberToRemove[mID]).map(memberId => {
      let chatId = memberToRemove[memberId]
      return {
        userId: memberId,
        chatId: chatId
      }
    })

    dispatch(removeBoardMembers(boardId, memberIds))
      .then(({ response: removeResult, type, error, query }) => {
        dispatch(postprocessRemoveMember(myId, boardId))
      })
  }
}

const postprocessRemoveMember = (myId, boardId) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}

/*                     */
/*  Get Article List   */
/*                     */


const fetchArticleList = (myId, boardId, startArticleId, shouldShowLoading, limit) => {
  return (dispatch, getState) => {
    if (shouldShowLoading) {
      dispatch(preprocessSetStartLoading(myId))
    }

    dispatch(serverUtils.getArticles(boardId, startArticleId, limit, constants.LIST_ORDER_PREV))
      .then(({ response: { result }, type, query, error }) => {
        let creatorIds = result.map(each => each.CreatorID)
        let articleIds = result.map(each => each.ID)
        let cBlockIds = result.map(each => each.ContentBlockID)

        let articleInfos = []
        for (let i = 0; i < articleIds.length; i++) {
          articleInfos.push({
            'A': articleIds[i],
            'B': cBlockIds[i]
          })
        }

        Promise.all([
          dispatch(serverUtils.getUsersInfo(creatorIds)),
          dispatch(serverUtils.getArticleSummaryByIds(boardId, articleInfos))
        ]).then( ([usersInfo, { response: { result: summariesResult } }]) => {
          if (startArticleId === constants.EMPTY_ID) {
            dispatch(postprocessGetArticleList(myId, result, usersInfo, summariesResult))
          }
          else {
            dispatch(postprocessGetMoreArticles(myId, result, usersInfo, summariesResult))
          }

          dispatch(postprocessSetFinshLoading(myId))
        })
      })
  }
}

export const getArticleList = (myId, boardId, isFirstFetch, limit) => {
  return (dispatch, getState) => {
    dispatch(fetchArticleList(myId, boardId, constants.EMPTY_ID, isFirstFetch, limit))
  }
}
export const getMoreArticles = (myId, boardId, startArticleId, limit) => {
  return (dispatch, getState) => {
    dispatch(fetchArticleList(myId, boardId, startArticleId, true, limit))
  }
}

const articleToArticleList = (myId, result, usersInfo, summaryResult) => {
  result = result.map(serverUtils.deserialize)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  return result.map(each => {
    let userId = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap = usersInfo['userImg'] || {}

    let userName = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    let createTS = utils.isNullTimeStamp(each.CreateTS) ? utils.emptyTimeStamp() : each.UpdateTS
    let updateTS = utils.isNullTimeStamp(each.UpdateTS) ? createTS : each.UpdateTS

    let CommentCreateTS = each.c && !utils.isNullTimeStamp(each.c) ? each.c : updateTS

    let summaryData = toJson(serverUtils.b64decode(summaryResult[each.ID].B[0]))
    let summary = getSummaryTemplate(summaryData, { CreatorName: userName, boardId: each.BoardID })

    return {
      ID:              each.ID,
      Status:          each.S,
      CreatorName:     userName,
      CreatorImg:      userImg,
      responseNumber:  each.NP || 0,
      Title:           each.Title,
      CommentCreateTS: CommentCreateTS,
      CreateTS:        createTS,
      UpdateTS:        updateTS,
      isUnread:        isUnRead(CommentCreateTS.T, each.L.T),
      summary:         summary
    }
  })
}

const postprocessGetArticleList = (myId, result, usersInfo, summariesResult) => {
  const articleList = articleToArticleList(myId, result, usersInfo, summariesResult)

  console.log('doBoardPage.postprocessGetArticleList: articleList:', articleList)

  // let matchIndex = articleList.findIndex((each) => each.ID === latestArticleId)

  if (articleList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { boardArticles: { lru: null, offset: 0, articleList: [] }, noArticle: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: APPEND_ARTICLES,
      data: { articles: articleList.reverse(), noArticle: false }
    }
  }
}

const postprocessGetMoreArticles = (myId, result, usersInfo, summariesResult) => {
  const articleList = articleToArticleList(myId, result.slice(1), usersInfo, summariesResult)

  console.log('doBoardPage.postprocessGetMoreArticles: articleList:', articleList)

  if (articleList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allArticlesLoaded: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: PREPEND_ARTICLES,
      data: { articles: articleList.reverse() }
    }
  }
}

export const _prependArticles = (state, action) => {
  const { myId, data: { articles } } = action

  let articleList = state.getIn([myId, 'boardArticles', 'articleList'], Immutable.List())
  let oriOffset = state.getIn([myId, 'boardArticles', 'offset'], 0)

  state = state.setIn([myId, 'boardArticles', 'offset'], oriOffset + articles.length)
  state = state.setIn([myId, 'boardArticles', 'articleList'], Immutable.List(articles).concat(articleList))

  return state
}

export const _appendArticles = (state, action) => {
  /* merge the newly fetched artilces to existing artilce list */
  const { myId, data: { articles, noArticle } } = action

  if (!articles || articles.length <= 0) {
    return state
  }

  let boardArticles = state.getIn([myId, 'boardArticles'], Immutable.Map()).toJS()
  let articleList = boardArticles.articleList || []
  let lruCache = boardArticles.lru || new LRU(constants.NUM_CACHE_ARTILCE)
  let offset = boardArticles.offset || 0

  let resultArticleList = []
  if (articleList.length === 0) {
    /* append message */
    articles.forEach((article, index) => {
      resultArticleList.push(article)
      lruCache.set(article.ID, { index: index - offset, article: article })
    })
  } else {
    /* 1. find earlist start node and save to local lru */
    let localLRU = new LRU(constants.NUM_ARTICLE_PER_REQ)

    let startArticle = null
    let earlistTS = 2147483648 /* year 2038 */
    articles.forEach((article, index) => {
      localLRU.set(article.ID, article)
      if (lruCache.get(article.ID) && lruCache.get(article.ID).article.CreateTS.T < earlistTS) {
        startArticle = lruCache.get(article.ID)
        earlistTS = startArticle.article.CreateTS.T
      }
    })
    /* 2. start merge  */
    let oriIndex = startArticle ? startArticle.index : articleList.length - offset
    let newIndex = 0
    let mergeIndex = oriIndex

    let oriList = articleList.slice(0, offset + oriIndex)
    let mergedList = []

    while (articleList.length > offset + oriIndex || articles.length > newIndex) {
      if (articleList.length > offset + oriIndex && articles.length > newIndex) {
        let oriArticle = articleList[offset + oriIndex]
        let newArticle = articles[newIndex]
        /* both left */
        if (oriArticle.CreateTS.T <= newArticle.CreateTS.T) {
          if (!localLRU.get(oriArticle.ID)) {
            mergedList.push(oriArticle)
            lruCache.set(oriArticle.ID, { index: mergeIndex, article: oriArticle })
            mergeIndex += 1
          }
          oriIndex += 1
        } else {
          mergedList.push(newArticle)
          lruCache.set(newArticle.ID, { index: mergeIndex, article: newArticle })
          mergeIndex += 1
          newIndex += 1
        }
      } else if (articleList.length > offset + oriIndex) {
        /* only ori */
        let oriArticle = articleList[offset + oriIndex]
        if (!localLRU.get(oriArticle.ID)) {
          mergedList.push(oriArticle)
          lruCache.set(oriArticle.ID, { index: mergeIndex, article: oriArticle })
          mergeIndex += 1
        }
        oriIndex += 1
      } else {
        /* only new */
        let newArticle = articles[newIndex]
        mergedList.push(newArticle)
        lruCache.set(newArticle.ID, { index: mergeIndex, article: newArticle })
        mergeIndex += 1
        newIndex += 1
      }
    }
    resultArticleList = oriList.concat(mergedList)
    localLRU.reset()
  }

  state = state.setIn([myId, 'noArticle'], noArticle)
  state = state.setIn([myId, 'boardArticles', 'offset'], offset)
  state = state.setIn([myId, 'boardArticles', 'lru'], lruCache)
  state = state.setIn([myId, 'boardArticles', 'articleList'], Immutable.List(resultArticleList))

  return state
}

/*                         */
/*  Update Article List    */
/*                         */

export const _addArticle = (state, action) => {
  const { myId, data: { article, noArticle } } = action

  if (!article || !article.ID || !article.BoardID) {
    return state
  }

  let boardArticles = state.getIn([myId, 'boardArticles'], Immutable.Map()).toJS()

  let lruCache = boardArticles.lru || new LRU(constants.NUM_CACHE_ARTILCE)
  let offset = boardArticles.offset || 0
  let articleList = boardArticles.articleList || []

  lruCache.set(article.ID, { index: articleList.length - offset, article: article })

  state = state.setIn([myId, 'noArticle'], noArticle)
  state = state.setIn([myId, 'boardArticles', 'lru'], lruCache)
  state = state.updateIn([myId, 'boardArticles', 'articleList'], arr => arr.push(Immutable.Map(article)))

  return state
}

export const clearData = (myId) => {
  return (dispatch, getState) => {
    dispatch(postprocessClearData(myId))
  }
}

const postprocessClearData = (myId) => {
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardArticles: { lru: null, offset: 0, articleList: [] }, allArticlesLoaded: false }
  }
}

/*             */
/*  Loading    */
/*             */

const preprocessSetStartLoading = (myId) => {
  console.log('doBoardPage.preprocessSetStartLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: true }
  }
}

const postprocessSetFinshLoading = (myId) => {
  console.log('doBoardPage.postprocessSetFinshLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { isLoading: false }
  }
}

/*                                */
/*  Download/Upload File/Image    */
/*                                */

function uploadAttachments (boardId, attachments) {
  return dispatch => Promise.all(attachments.map((attachment) => {
    if (attachment.type === 'IMAGE') {
      /* for image */
      return dispatch(serverUtils.uploadImg(boardId, attachment))
        .then(({ response: { result }, type, query, error }) => {
          return { 'attachmentId': attachment.id, 'mediaId': result.ID, 'boardId': result.BID, 'type': 'IMAGE' }
        })
    } else {
      /* for file */
      return dispatch(serverUtils.uploadFile(boardId, attachment))
        .then(({ response: { result }, type, query, error }) => {
          return { 'attachmentId': attachment.id, 'mediaId': result.ID, 'boardId': result.BID, 'type': 'FILE' }
        })
    }
  }))
}

export const createArticleWithAttachments = (myId, userName, userImg, boardId, title, reducedArticleArray, attachments) => {
  return (dispatch, getState) => {
    dispatch(uploadAttachments(boardId, attachments))
      .then((attachmentIdObjs) => {
        /* Attachment ID - data url map */
        let attachmentIdMap = attachmentIdObjs.reduce((acc, current) => {
          acc[current.attachmentId] = current.mediaId
          return acc
        }, {})

        /* Replace attachment ID with medaiId */
        let articleArray = reducedArticleArray.map((each) => {
          if (each.type === constants.CONTENT_TYPE_FILE || each.type === constants.CONTENT_TYPE_IMAGE) {
            let params = each.param
            attachments.forEach((attachment) => {
              if (params.id === attachment.id) {
                params.id = attachmentIdMap[attachment.id]
              }
            })
            each.param = params
          }

          return JSON.stringify(each)
        })

        let mediaIds = attachmentIdObjs.map((attachment) => {
          return attachment.mediaId
        })

        /* Create article with attachment Ids */
        dispatch(serverUtils.createArticle(boardId, title, articleArray, mediaIds))
          .then(({ response: { result }, type, query, error }) => {
            dispatch(serverUtils.markArticle(boardId, result.AID))
            dispatch(postprocessCreateArticle(myId, boardId, userName, userImg, title, articleArray, result))
          })
      })
  }
}

const postprocessCreateArticle = (myId, boardId, userName, userImg, title, articleArray, result) => {
  let summaryData = articleArray && articleArray.length > 0 ? toJson(articleArray[0]) : {}
  let summary = getSummaryTemplate(summaryData, { CreatorName: userName, boardId: boardId })

  let newArticle = {
    summary:         summary,
    ID:              result.AID,
    Status:          0,
    CreatorName:     userName,
    CreatorImg:      userImg,
    responseNumber:  0,
    Title:           title,
    CommentCreateTS: utils.emptyTimeStamp(),
    CreateTS:        utils.emptyTimeStamp(),
    UpdateTS:        utils.emptyTimeStamp(),
    isUnread:        false
  }

  console.log('doBoardPage.postprocessCreateArticle: result:', newArticle)
  return {
    myId,
    myClass,
    type: ADD_ARTICLE,
    data: { article: newArticle, noArticle: false }
  }
}


// reducers
const reducer = myDuck.createReducer({
  [INIT]: utils.reduceInit,
  [ADD_CHILD]: utils.reduceAddChild,
  [SET_ROOT]: utils.reduceSetRoot,
  [REMOVE_CHILDS]: utils.reduceRemoveChilds,
  [REMOVE]: utils.reduceRemove,
  [SET_DATA]: utils.reduceSetData,
  [UPDATE_DATA]: utils.reduceUpdateData,
  [ADD_ARTICLE]: _addArticle,
  [PREPEND_ARTICLES]: _prependArticles,
  [APPEND_ARTICLES]: _appendArticles
}, Immutable.Map())

export default reducer
