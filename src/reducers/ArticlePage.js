import Immutable        from 'immutable';
import { createDuck }   from 'redux-duck'
import LRU              from 'lru-cache'

import * as utils       from './utils'
import * as serverUtils from './ServerUtils'

import * as constants   from '../constants/Constants'
import { DEFAULT_USER_NAME,
         DEFAULT_USER_IMAGE }   from '../constants/Constants'
import { toJson }               from '../utils/utils'

export const myClass  = 'ARTICLE_PAGE'

export const myDuck   = createDuck(myClass, 'article_page')

const INIT            = myDuck.defineType('INIT')
const ADD_CHILD       = myDuck.defineType('ADD_CHILD')
const SET_ROOT        = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS   = myDuck.defineType('REMOVE_CHILDS')
const REMOVE          = myDuck.defineType('REMOVE')
const SET_DATA        = myDuck.defineType('SET_DATA')
const APPEND_ARTICLE  = myDuck.defineType('APPEND_ARTICLE')
const APPEND_COMMENT  = myDuck.defineType('APPEND_COMMENT')
const ADD_COMMENT     = myDuck.defineType('ADD_COMMENT')
const DELETE_COMMENT  = myDuck.defineType('DELETE_COMMENT')

export const init = (myId, parentId, parentClass, parentDuck) => {
  return (dispatch, getState) => {
    dispatch(utils.init({myId, myClass, myDuck, parentId, parentClass, parentDuck}))
  }
}

export const initParams = (myId, params) => {
  return (dispatch, getState) => {
    dispatch({
      myId,
      myClass,
      type: SET_DATA,
      data: {
        boardId:    decodeURIComponent(params.boardId),
        articleId:  decodeURIComponent(params.articleId)
      }
    })
  }
}

/*                          */
/*  Get Board level Info    */
/*                          */

export const getBoardInfo = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoard(boardId))
      .then(({response: {result}, type, error, query}) => {
        dispatch(postprocessGetBoardInfo(myId, result))
      })
  }
}

const postprocessGetBoardInfo = (myId, result) => {

  result = serverUtils.deserialize(result)

  const boardInfo = {
      ID:               result.ID,
      Status:           result.S,
      Title:            result.Title,
      LastSeen:         result.LastSeen ? result.LastSeen : utils.emptyTimeStamp(),
      UpdateTS:         result.UpdateTS ? result.UpdateTS : utils.emptyTimeStamp(),
      ArticleCreateTS:  result.ArticleCreateTS ? result.ArticleCreateTS : utils.emptyTimeStamp(),
  }

  console.log('doArticlePage.postprocessGetBoardInfo: boardInfo:', boardInfo)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { boardInfo: boardInfo }
  }
}

/*                            */
/*  Get Article level Info    */
/*                            */

export const getArticleInfo = (myId, boardId, articleId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getArticle(boardId, articleId))
      .then(({response: {result}, type, error, query}) => {
          let creatorIds = [result.CreatorID]
          dispatch(serverUtils.getUsersInfo(creatorIds))
            .then((usersInfo) => {
              dispatch(postprocessGetArticleInfo(myId, result, usersInfo))
            })
      })
  }
}

const postprocessGetArticleInfo = (myId, result, usersInfo) => {

  result = serverUtils.deserialize(result)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let userId      = result.CreatorID
  let userNameMap = usersInfo['userName'] || {}
  let userImgMap  = usersInfo['userImg'] || {}

  let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
  let userImg   = userImgMap[userId]  ? userImgMap[userId].I : DEFAULT_USER_IMAGE

  const articleInfo = {
    ID:            result.ID,
    CreateTS:      result.CreateTS ? result.CreateTS : utils.emptyTimeStamp(),
    UpdateTSkey:   result.UpdateTSkey,
    CreatorID:     result.CreatorID,
    CreatorName:   userName,
    CreatorImg:    userImg,
    BoardID:       result.BoardID,
    ContentBlockID:result.ContentBlockID,
    NBlock:        result.NBlock,
    NPush:         result.NPush,
    NBoo:          result.NBoo,
    Title:         result.Title,
    LastSeen:      result.LastSeen ? result.LastSeen : utils.emptyTimeStamp(),
  }

  console.log('doArticlePage.postprocessGetArticleInfo: articleInfo:', articleInfo)

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: { articleInfo: articleInfo }
  }
}

/*                              */
/*  Update Article level Info   */
/*                              */

export const markArticle = (myId, boardId, articleId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.markArticle(boardId, articleId))
      .then(({response: {result}, type, error, query}) => {
        dispatch(postprocessMarkArticle(myId, result))
      })
  }
}

const postprocessMarkArticle = (myId, result) => {
  /* Do nothing */
  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {}
  }
}


/*                                */
/*  Get Article/Comment Content   */
/*                                */

export const getArticleContent = (myId, boardId, articleId, blockId, limit) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getArticle(boardId, articleId))
      .then(({response: articleResult, type, error, query}) => {
        const subContentId  = articleResult.result.ContentBlockID
        const totalBlockNum = articleResult.result.NBlock
        const artilceLimit = (totalBlockNum < limit) ? totalBlockNum : limit
        dispatch(serverUtils.getContent(boardId, articleId, subContentId, constants.CONTENT_TYPE_ARTICLE, blockId, artilceLimit, constants.LIST_ORDER_NEXT))
          .then(({response: {result}, type, error, query}) => {
            let creatorIds = result.map(each => each.CID).filter(each => each)
            dispatch(serverUtils.getUsersInfo(creatorIds))
              .then((usersInfo) => {
                dispatch(postprocessGetArticleContent(myId, result, blockId, usersInfo))
              })
          })
      })
  }
}

const postprocessGetArticleContent = (myId, result, blockId, usersInfo) => {

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let articleContents = result.map((each) => {

    let userId      = each.CID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      contentBlockArray:  each.B.map((e)=> { return toJson(serverUtils.b64decode(e)) }),
      blockId:            each.BID,
      subContentId:       each.ID,
      articleId:          each.RID,
      contentType:        each.ct,
      commentType:        each.mt,
      creatorId:          each.CID,
      status:             each.S,
      creatorName:        userName,
      creatorImg:         userImg,
    }
  })

  console.log('doArticlePage.postprocessGetArticleContent: result:', articleContents)

  if (articleContents.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allArticleLoaded: true }
    }
  } else if (blockId === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { articleContentsList: articleContents }
    }
  } else {
    return {
      myId,
      myClass,
      type: APPEND_ARTICLE,
      data: { articleContents: articleContents }
    }
  }
}

export const _appendArticle = (state, action) => {

  const {myId, data: { articleContents }} = action

  let articleContentsList = state.getIn([myId, 'articleContentsList'], Immutable.List())

  let matchIndex = articleContentsList.length
  if (articleContents.length > 0) {
    matchIndex = articleContentsList.toJS().findIndex((each) => each.blockId === articleContents[0].blockId)
  }
  if (matchIndex === -1) {
    matchIndex = articleContentsList.length
  }

  return state.setIn([myId, 'articleContentsList'], articleContentsList.slice(0, matchIndex).concat(articleContents))
}

export const getCommentContent = (myId, boardId, articleId, latestSubContentId, blockId, limit) => {
  return (dispatch, getState) => {
    let listOrder = null
    if (latestSubContentId === constants.EMPTY_ID) {
      /* get initial comments */
      listOrder = constants.LIST_ORDER_NEXT
    } else {
      /* get latest comments */
      listOrder = constants.LIST_ORDER_PREV
    }
    dispatch(serverUtils.getContent(boardId, articleId, latestSubContentId, constants.CONTENT_TYPE_COMMENT, blockId, limit, listOrder))
      .then(({response: {result}, type, error, query}) => {
        let creatorIds = result.map(each => each.CID).filter(each => each)
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((usersInfo) => {
            dispatch(postprocessGetCommentContent(myId, result, latestSubContentId, usersInfo))
          })
      })
  }
}

const postprocessGetCommentContent = (myId, result, latestSubContentId, usersInfo) => {

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  let commentContentsList = result.map((each) => {

    let userId      = each.CID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      contentBlockArray:  each.B.map((e)=> { return serverUtils.b64decode(e) }),
      blockId:            each.BID,
      subContentId:       each.ID,
      articleId:          each.RID,
      contentType:        each.ct,
      commentType:        each.mt,
      creatorId:          each.CID,
      status:             each.S,
      creatorName:        userName,
      creatorImg:         userImg,
      createTS:           each.CT ? each.CT : utils.emptyTimeStamp(),
      updateTS:           each.UT ? each.UT : utils.emptyTimeStamp(),
    }
  })

  console.log('doArticlePage.postprocessGetCommentContent: result:', commentContentsList)

  if (latestSubContentId === constants.EMPTY_ID) {
    /* get initial comments */
    let lruCache = new LRU(constants.NUM_CACHE_COMMENT)
    commentContentsList.forEach((comment, index) => {
      lruCache.set(comment.subContentId, { index: index, comment: comment })
    })
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { commentContents: { lru: lruCache, commentContentsList: commentContentsList }}
    }
  } else {
    /* get latest comments */
    return {
      myId,
      myClass,
      type: APPEND_COMMENT,
      data: { comments: commentContentsList.reverse() }
    }
  }
}

export const _appendComment = (state, action) => {

  const {myId, data: { comments }} = action

  let commentContents     = state.getIn([myId, 'commentContents'], Immutable.Map()).toJS()
  let commentContentsList = commentContents.commentContentsList || []
  let lruCache            = commentContents.lru || new LRU(constants.NUM_CACHE_COMMENT)

  let resultCommentList  = []
  if (commentContentsList.length === 0) {
    /* append comments */
    comments.forEach((comment, index) => {
      resultCommentList.push(comment)
      lruCache.set(comment.subContentId, { index: index, comment: comment })
    })
  } else {
    /* 1. find earlist start comment and save to local lru */
    let localLRU     = new LRU(constants.NUM_CONTENT_PER_REQ)
    let startComment = null
    let earlistTS    = 2147483648 /* year 2038 */
    comments.forEach((comment, index) => {
      localLRU.set(comment.subContentId, comment)
      if (lruCache.get(comment.subContentId) && lruCache.get(comment.subContentId).comment.updateTS.T < earlistTS) {
        startComment  = lruCache.get(comment.subContentId)
        earlistTS     = startComment.comment.updateTS.T
      }
    })
    /* 2. start merge  */
    let oriIndex    = startComment ? startComment.index : commentContentsList.length
    let newIndex    = 0
    let mergeIndex  = oriIndex
    let oriList     = commentContentsList.slice(0, oriIndex)
    let mergedList = []

    while(commentContentsList.length > oriIndex || comments.length > newIndex){
      if (commentContentsList.length > oriIndex && comments.length > newIndex) {
        let oriComment = commentContentsList[oriIndex]
        let newComment = comments[newIndex]
        /* both left */
        if (oriComment.updateTS.T <= newComment.updateTS.T) {
          if (!localLRU.get(oriComment.subContentId)) {
            mergedList.push(oriComment)
            lruCache.set(oriComment.subContentId, { index: mergeIndex, comment: oriComment })
            mergeIndex += 1
          }
          oriIndex += 1
        } else {
          mergedList.push(newComment)
          lruCache.set(newComment.subContentId, { index: mergeIndex, comment: newComment })
          mergeIndex += 1
          newIndex += 1
        }
      } else if (commentContentsList.length > oriIndex) {
        /* only ori */
        let oriComment = commentContentsList[oriIndex]
        if (!localLRU.get(oriComment.subContentId)) {
          mergedList.push(oriComment)
          lruCache.set(oriComment.subContentId, { index: mergeIndex, comment: oriComment })
          mergeIndex += 1
        }
        oriIndex += 1
      } else {
        /* only new */
        let newComment = comments[newIndex]
        mergedList.push(newComment)
        lruCache.set(newComment.subContentId, { index: mergeIndex, comment: newComment })
        mergeIndex += 1
        newIndex += 1
      }
    }
    resultCommentList = oriList.concat(mergedList)
    localLRU.reset()
  }

  state = state.setIn([myId, 'commentContents', 'lru'], lruCache)
  state = state.setIn([myId, 'commentContents', 'commentContentsList'], Immutable.List(resultCommentList))

  return state
}

export const getMoreComments = (myId, boardId, articleId, startSubContentId, limit) => {
  return (dispatch, getState) => {
    dispatch(preprocessSetStartLoading(myId))
    dispatch(serverUtils.getContent(boardId, articleId, startSubContentId, constants.CONTENT_TYPE_COMMENT, 0, limit, constants.LIST_ORDER_NEXT))
      .then(({response: {result}, type, error, query}) => {
        let creatorIds = result? result.map(each => each.CID).filter(each => each):[]
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((maps) => {
            dispatch(postprocessGetMoreComments(myId, result, startSubContentId, maps))
            dispatch(postprocessSetFinshLoading(myId))
          })
      })
  }
}

const postprocessGetMoreComments = (myId, result, startSubContentId, usersInfo) => {

  if (!result) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allCommentsLoaded: true }
    }
  }

  result = result.map(serverUtils.deserialize)
  result = result.slice(1)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const commentContentsList = result.map(each => {

    let userId      = each.CID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId]  ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      contentBlockArray:  each.B.map((e)=> { return serverUtils.b64decode(e) }),
      blockId:            each.BID,
      subContentId:       each.ID,
      articleId:          each.RID,
      contentType:        each.ct,
      commentType:        each.mt,
      status:             each.S,
      creatorId:          each.CID,
      creatorName:        userName,
      creatorImg:         userImg,
      createTS:           each.CT ? each.CT : utils.emptyTimeStamp(),
      updateTS:           each.UT ? each.UT : utils.emptyTimeStamp(),
    }
  })

  console.log('doArticlePage.postprocessGetMoreComments: commentContentsList:', commentContentsList)

  if (commentContentsList.length === 0) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { allCommentsLoaded: true }
    }
  } else {
    return {
      myId,
      myClass,
      type: APPEND_COMMENT,
      data: { comments: commentContentsList }
    }
  }
}

/*                            */
/*  Update Article Content    */
/*                            */


export const editArticle = (myId, boardId, articleId, article, mediaIds) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.updateArticle(boardId, articleId, article, mediaIds))
      .then(({response: {result}, type, query, error}) => {
        dispatch(serverUtils.getContent(result.BID, result.AID, result.cID, 0, 0, constants.NUM_CONTENT_PER_REQ, constants.LIST_ORDER_NEXT))
          .then(({response: contentResult, type, error, query}) => {
            let creatorIds = contentResult.result.map(each => each.CID).filter(each => each)
            let articleResult = contentResult.result
            dispatch(serverUtils.getUsersInfo(creatorIds))
              .then((usersInfo) => {
                dispatch(postprocessGetArticleContent(myId, articleResult, 0, usersInfo))
              })
          })
      })
  }
}

export const deleteArticle = (myId, boardId, articleId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.deleteArticle(boardId, articleId))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessDeleteArticle(myId, boardId, articleId))
      })
  }
}

const postprocessDeleteArticle = (myId, boardId, articleId) => {
  console.log('doArticlePage.postprocessDeleteArticle: result:', articleId)
}

/*                            */
/*  Update Comment Content    */
/*                            */


export const addComment = (myId, boardId, articleId, comment, userName, userImg, userId, mediaId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.createComment(boardId, articleId, comment, mediaId))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessAddComment(myId, boardId, articleId, result.CID, comment, userName, userImg, userId))
      })
  }
}

const postprocessAddComment = (myId, boardId, articleId, commentId, comment, userName, userImg, userId) => {

  const newComment = {
      contentBlockArray:  [comment],
      blockId:            0,
      subContentId:       commentId,
      articleId:          articleId,
      contentType:        1, /* Comment is 1 */
      commentType:        null,
      status:             0,
      creatorId:          userId,
      creatorName:        userName,
      creatorImg:         userImg,
      createTS:           utils.emptyTimeStamp(),
      updateTS:           utils.emptyTimeStamp(),
  }

  console.log('doArticlePage.postprocessAddComment: newComment:', newComment)

  return {
    myId,
    myClass,
    type: ADD_COMMENT,
    data: { comment: newComment}
  }
}

export const _addComment = (state, action) => {
  const {myId, data: { comment }} = action

  let commentContents     = state.getIn([myId, 'commentContents'], Immutable.Map()).toJS()
  let commentContentsList = commentContents.commentContentsList || []
  let lruCache            = commentContents.lru

  lruCache.set(comment.subContentId, { index: commentContentsList.length, comment: comment })

  state = state.setIn([myId, 'commentContents', 'lru'], lruCache)
  state = state.updateIn([myId, 'commentContents', 'commentContentsList'], arr => arr.push(Immutable.Map(comment)))

  return state
}

export const deleteComment = (myId, boardId, articleId, commentId, mediaId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.deleteComment(boardId, articleId, commentId, mediaId))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessDeleteComment(myId, commentId))
      })
  }
}

const postprocessDeleteComment = (myId, commentId) => {

  console.log('doArticlePage.postprocessDeleteComment: commentId:', commentId)

  return {
    myId,
    myClass,
    type: DELETE_COMMENT,
    data: { commentId: commentId }
  }
}

export const _deleteComment = (state, action) => {
  const {myId, data: { commentId }} = action

  let commentContentsList = state.getIn([myId, 'commentContentsList'], Immutable.List())
  commentContentsList = commentContentsList.filter(each => { return each.subContentId !== commentId })

  return state.setIn([myId, 'commentContentsList'], commentContentsList)
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
    data: {
      articleContentsList: [],
      commentContents:  { lru: null, commentContentsList: [] },
      allArticleLoaded: false,
      allCommentsLoaded: false
    }
  }
}

/*             */
/*  Loading    */
/*             */

const preprocessSetStartLoading = (myId) => {

  console.log('doArticlePage.preprocessSetStartLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {isCommentLoading: true}
  }
}

const postprocessSetFinshLoading = (myId) => {

  console.log('doArticlePage.postprocessSetFinshLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {isCommentLoading: false}
  }
}

/*                                */
/*  Download/Upload File/Image    */
/*                                */

export const downloadFile = (myId, boardId, mediaId, callBack) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.downloadFile(boardId, mediaId))
      .then(({response: result, type, query, error}) => {
        callBack(result)
      })
  }
}

function uploadAttachments(boardId, attachments) {
  return dispatch => Promise.all(attachments.map((attachment) => {
    if (attachment.type === 'IMAGE') {
      /* for image */
      return dispatch(serverUtils.uploadImg(boardId, attachment))
        .then(({response: {result}, type, query, error}) => {
          return { 'attachmentId':attachment.id, 'mediaId': result.ID, 'boardId': result.BID, 'type':'IMAGE' }
        })
    } else {
      /* for file */
      return dispatch(serverUtils.uploadFile(boardId, attachment))
        .then(({response: {result}, type, query, error}) => {
          return { 'attachmentId':attachment.id, 'mediaId': result.ID, 'boardId': result.BID, 'type':'FILE' }
        })
    }
  }));
}

export const createArticleWithAttachments = (myId, userName, userImg, boardId, articleId, reducedArticleArray, attachments) => {
  return (dispatch, getState) => {
    dispatch(uploadAttachments(boardId, attachments))
      .then((attachmentIdObjs) => {

        /* Attachment ID - data url map */
        let attachmentIdMap = attachmentIdObjs.reduce((acc, current) => {
          acc[current.attachmentId] = current.mediaId
          return acc
        },{})

        /* Replace attachment ID with mediaId */
        let articleArray = reducedArticleArray.map((each, index) => {

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

        /* Update article with attachment Ids */
        dispatch(serverUtils.updateArticle(boardId, articleId, articleArray, mediaIds))
          .then(({response: {result}, type, query, error}) => {
            let boardId       = result.BID
            let articleId     = result.AID
            let subContentId  = result.cID
            let totalBlockNum = result.NB
            let artilceLimit  = (totalBlockNum < constants.NUM_CONTENT_PER_REQ) ? totalBlockNum : constants.NUM_CONTENT_PER_REQ
            let blockId       = 0

            dispatch(serverUtils.getContent(boardId, articleId, subContentId, constants.CONTENT_TYPE_ARTICLE, blockId, artilceLimit, constants.LIST_ORDER_NEXT))
              .then(({response: contentResult, type, error, query}) => {
                let creatorIds = contentResult.result.map(each => each.CID).filter(each => each)
                dispatch(serverUtils.getUsersInfo(creatorIds))
                  .then((usersInfo) => {
                    dispatch(postprocessGetArticleContent(myId, contentResult.result, 0, usersInfo))
                  })
              })
          })
      })
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]:           utils.reduceInit,
  [ADD_CHILD]:      utils.reduceAddChild,
  [SET_ROOT]:       utils.reduceSetRoot,
  [REMOVE_CHILDS]:  utils.reduceRemoveChilds,
  [REMOVE]:         utils.reduceRemove,
  [SET_DATA]:       utils.reduceSetData,
  [APPEND_ARTICLE]: _appendArticle,
  [ADD_COMMENT]:    _addComment,
  [DELETE_COMMENT]: _deleteComment,
  [APPEND_COMMENT]: _appendComment,
}, Immutable.Map())

export default reducer
