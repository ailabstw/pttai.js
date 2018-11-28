import Immutable                from 'immutable';
import { createDuck }           from 'redux-duck'
import { API_ROOT2 }            from 'config'

import * as utils               from './utils'
import * as serverUtils         from './ServerUtils'

import * as constants           from '../constants/Constants'
import { EMPTY_ID,
         DEFAULT_USER_NAME,
         DEFAULT_USER_IMAGE }   from '../constants/Constants'

export const myClass = 'BOARD_PAGE'

export const myDuck = createDuck(myClass, 'board_page')

const INIT              = myDuck.defineType('INIT')
const ADD_CHILD         = myDuck.defineType('ADD_CHILD')
const SET_ROOT          = myDuck.defineType('SET_ROOT')
const REMOVE_CHILDS     = myDuck.defineType('REMOVE_CHILDS')
const REMOVE            = myDuck.defineType('REMOVE')
const SET_DATA          = myDuck.defineType('SET_DATA')
const UPDATE_DATA       = myDuck.defineType('UPDATE_DATA')

const ADD_ARTICLE       = myDuck.defineType('ADD_ARTICLE')
const DELETE_ARTICLE    = myDuck.defineType('DELETE_ARTICLE')
const PREPEND_ARTICLES  = myDuck.defineType('PREPEND_ARTICLES')
const APPEND_ARTICLES   = myDuck.defineType('APPEND_ARTICLES')
const INSERT_SUMMARIES  = myDuck.defineType('INSERT_SUMMARIES')


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
      data: {boardId:decodeURIComponent(params.boardId)}
    })
  }
}


/*                          */
/*  Get Board level Info    */
/*                          */

export const getBoardInfo = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.getBoard(boardId))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessGetBoardInfo(myId, result))
      })
  }
}

const postprocessGetBoardInfo = (myId, result) => {

  let boardInfo = {
      ID:               result.ID,
      Title:            result.Title,
      CreatorID:        result.C,
      BoardType:        result.BT,
      Status:           result.Status,
      LastSeen:         result.LastSeen ? result.LastSeen : utils.emptyTimeStamp(),
      UpdateTS:         result.UpdateTS ? result.UpdateTS : utils.emptyTimeStamp(),
      ArticleCreateTS:  result.ArticleCreateTS ? result.ArticleCreateTS : utils.emptyTimeStamp(),
  }

  boardInfo = serverUtils.deserialize(boardInfo)

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

export const setBoardName = (myId, boardId, name) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.setBoardName(boardId, name))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessSetBoardName(myId, boardId, name))
      })
  }
}

const postprocessSetBoardName = (myId, boardId, name) => {

  const combinedBoardInfo = {
      ID:     boardId,
      Title:  name,
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
      .then(({response: {result}, type, error, query}) => {
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

export const deleteBoard = (myId, boardId) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.deleteBoard(boardId))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessDeleteBoard(myId, boardId))
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
  }}

/*                     */
/*  Get Article List   */
/*                     */

export const getArticleList = (myId, boardId, latestArticleId, limit) => {
  return (dispatch, getState) => {
    if (latestArticleId === constants.EMPTY_ID) {
      dispatch(preprocessSetStartLoading(myId))
    }
    dispatch(serverUtils.getArticles(boardId, constants.EMPTY_ID, limit))
      .then(({response: {result}, type, query, error}) => {
        let creatorIds = result.map(each => each.CreatorID)
        let articleIds = result.map(each => each.ID)
        let cBlockIds  = result.map(each => each.ContentBlockID)
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((usersInfo) => {
            dispatch(postprocessGetArticleList(myId, result, latestArticleId, usersInfo))
          })
        let articleInfos = []
        for (let i = 0; i < articleIds.length; i++) {
          articleInfos.push({
            'A': articleIds[i],
            'B': cBlockIds[i],
          })
        }
        dispatch(serverUtils.getArticleSummaryByIds(boardId, articleInfos))
          .then(({response: summariesResult, type, query, error}) => {
            let summaries = summariesResult.result
            dispatch(postprocessGetSummaries(myId, summaries))
            if (latestArticleId === constants.EMPTY_ID) {
              dispatch(postprocessSetFinshLoading(myId))
            }
          })
      })
  }
}

const postprocessGetArticleList = (myId, result, latestArticleId, usersInfo) => {

  result = result.map(serverUtils.deserialize)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})


  const articleList = result.map(each => {

    let userId      = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId] ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      BoardID:          each.BoardID,
      ContentBlockID:   each.ContentBlockID,
      CreatorID:        each.CID,
      CreatorName:      userName,
      CreatorImg:       userImg,
      Status:           each.S,
      ID:               each.ID,
      NBlock:           each.NBlock,
      NBoo:             each.NB,
      NPush:            each.NP,
      Title:            each.Title,
      CreateTS:         each.CreateTS ? each.CreateTS : utils.emptyTimeStamp(),
      UpdateTS:         each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
      LastSeen:         each.L ? each.L : utils.emptyTimeStamp(),
      CommentCreateTS:  each.c ? each.c : utils.emptyTimeStamp(),
    }
  });

  console.log('doBoardPage.postprocessGetArticleList: articleList:', articleList)

  let matchIndex = articleList.findIndex((each) => each.ID === latestArticleId)

  if (articleList.length === 0 && latestArticleId === EMPTY_ID) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { noArticle: true }
    }
  } else if (matchIndex === -1) {
    return {
      myId,
      myClass,
      type: SET_DATA,
      data: { articleList: articleList.reverse(), noArticle: false }
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

const postprocessGetSummaries = (myId, summaries) => {

  console.log('doBoardPage.postprocessGetSummaries: summaries:', summaries)

  return {
    myId,
    myClass,
    type: INSERT_SUMMARIES,
    data: { summaries: summaries }
  }
}

export const _insertSummaries = (state, action) => {
  const {myId, data: { summaries }} = action

  let articleSummaries = state.getIn([myId, 'articleSummaries'], Immutable.Map())

  return state.setIn([myId, 'articleSummaries'], articleSummaries.merge(summaries))
}


export const getMoreArticles = (myId, boardId, startArticleId, limit) => {
  return (dispatch, getState) => {
    dispatch(preprocessSetStartLoading(myId))
    dispatch(serverUtils.getArticles(boardId, startArticleId, limit))
      .then(({response: {result}, type, query, error}) => {
        let creatorIds = result.map(each => each.CreatorID)
        let articleIds = result.map(each => each.ID)
        let cBlockIds  = result.map(each => each.ContentBlockID)
        dispatch(serverUtils.getUsersInfo(creatorIds))
          .then((usersInfo) => {
            dispatch(postprocessGetMoreArticles(myId, result, usersInfo))
          })
        let articleInfos = []
        for (let i = 0; i < articleIds.length; i++) {
          articleInfos.push({
            'A': articleIds[i],
            'B': cBlockIds[i],
          })
        }
        dispatch(serverUtils.getArticleSummaryByIds(boardId, articleInfos))
          .then(({response: summariesResult, type, query, error}) => {
            let summaries = summariesResult.result
            dispatch(postprocessGetSummaries(myId, summaries))
            dispatch(postprocessSetFinshLoading(myId))
          })
      })
  }
}

const postprocessGetMoreArticles = (myId, result, usersInfo) => {

  result = result.map(serverUtils.deserialize)
  result = result.slice(1)

  usersInfo = usersInfo.reduce((acc, each) => {
    acc[each.key] = each.value
    return acc
  }, {})

  const articleList = result.map(each => {

    let userId      = each.CreatorID
    let userNameMap = usersInfo['userName'] || {}
    let userImgMap  = usersInfo['userImg'] || {}

    let userName  = userNameMap[userId] ? serverUtils.b64decode(userNameMap[userId].N) : DEFAULT_USER_NAME
    let userImg   = userImgMap[userId]  ? userImgMap[userId].I : DEFAULT_USER_IMAGE

    return {
      BoardID:          each.BoardID,
      ContentBlockID:   each.ContentBlockID,
      CreatorID:        each.CreatorID,
      CreatorName:      userName,
      CreatorImg:       userImg,
      Status:           each.S,
      ID:               each.ID,
      NBlock:           each.NBlock,
      NBoo:             each.NBoo,
      NPush:            each.NPush,
      Title:            each.Title,
      CreateTS:         each.CreateTS ? each.CreateTS : utils.emptyTimeStamp(),
      UpdateTS:         each.UpdateTS ? each.UpdateTS : utils.emptyTimeStamp(),
      LastSeen:         each.L ? each.L : utils.emptyTimeStamp(),
      CommentCreateTS:  each.c ? each.c : utils.emptyTimeStamp(),
    }
  })

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

  const {myId, data: { articles }} = action

  let articleList = state.getIn([myId, 'articleList'], Immutable.List())

  return state.setIn([myId, 'articleList'], Immutable.List(articles).concat(articleList))
}

export const _appendArticles = (state, action) => {

  const {myId, data: { articles, noArticle }} = action

  let articleList = state.getIn([myId, 'articleList'], Immutable.List())

  let matchIndex = articleList.length
  if (articles.length > 0) {
    matchIndex = articleList.toJS().findIndex((each) => each.ID === articles[0].ID)
  }

  state = state.setIn([myId, 'noArticle'], noArticle)

  return state.setIn([myId, 'articleList'], articleList.slice(0, matchIndex).concat(articles))
}

/*                         */
/*  Update Article List    */
/*                         */


export const addArticle = (myId, userName, userImg, boardId, title, article, mediaStr) => {
  return (dispatch, getState) => {
    dispatch(serverUtils.createArticle(boardId, title, article, mediaStr))
      .then(({response: {result}, type, query, error}) => {
        dispatch(postprocessCreateArticle(myId, userName, userImg, title, article, result))
      })
  }
}

const postprocessCreateArticle = (myId, userName, userImg, title, articleArray, result) => {

  let newArticle = {
      BoardID:        result.BID,
      ContentBlockID: result.cID,
      CreateTS:       null,
      CreatorID:      null,
      CreatorName:    userName,
      CreatorImg:     userImg,
      PreviewText:    articleArray && articleArray.length > 0? articleArray[0]:null,
      Status:         0,
      ID:             result.AID,
      LastSeen:       utils.emptyTimeStamp(),
      NBlock:         null,
      NBoo:           0,
      NPush:          0,
      Title:          title,
      CommentCreateTS:utils.emptyTimeStamp(),
      UpdateTS:       utils.emptyTimeStamp(),
  }

  console.log('doBoardPage.postprocessCreateArticle: result:', newArticle)
  return {
    myId,
    myClass,
    type: ADD_ARTICLE,
    data: { article: newArticle, noArticle: false }
  }
}

export const _addArticle = (state, action) => {

  const {myId, data:{article, noArticle}} = action

  let articleList = state.getIn([myId, 'articleList'], Immutable.List())
  state = state.setIn([myId, 'noArticle'], noArticle)
  return state.setIn([myId, 'articleList'], articleList.push(Immutable.Map(article)))
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

  console.log('doBoardPage.postprocessDeleteArticle: result:', articleId)

  return {
    myId,
    myClass,
    type: DELETE_ARTICLE,
    data: { articleId: articleId }
  }
}

export const _deteleArticle = (state, action) => {
  const {myId, data:{articleId}} = action

  let articleList = state.getIn([myId, 'articleList'], Immutable.List())
  articleList = articleList.filter(each => { return each.get('ID') !== articleId })
  return state.setIn([myId, 'articleList'], articleList)
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
    data: { articleList: [], allArticlesLoaded: false }
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
    data: {isLoading: true}
  }
}

const postprocessSetFinshLoading = (myId) => {
  console.log('doBoardPage.postprocessSetFinshLoading')

  return {
    myId,
    myClass,
    type: SET_DATA,
    data: {isLoading: false}
  }
}

/*                                */
/*  Download/Upload File/Image    */
/*                                */

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

export const createArticleWithAttachments = (myId, userName, userImg, boardId, title, reducedArticleArray, attachments) => {
  return (dispatch, getState) => {
    dispatch(uploadAttachments(boardId, attachments))
      .then((attachmentIdObjs) => {

        /* Attachment ID - data url map */
        let attachmentIdMap = attachmentIdObjs.reduce((acc, current) => {
          acc[current.attachmentId] = current.mediaId
          return acc
        },{})

        /* Replace attachment ID with data url */
        let articleArray = reducedArticleArray.map((each) => {
          let replaced = each
          attachments.forEach((attachment) => {
            if (replaced.indexOf(attachment.id) !== -1) {
              if (attachment.type === 'IMAGE') {
                replaced = replaced.replace(attachment.id, API_ROOT2 + '/api/img/' + boardId + '/' + attachmentIdMap[attachment.id])
              } else {
                replaced = replaced.replace(attachment.id, attachmentIdMap[attachment.id])
              }
            }
          })
          return replaced
        })

        let mediaIds = attachmentIdObjs.map((attachment) => {
          return attachment.mediaId
        })

        /* Create article with attachment Ids */
        dispatch(serverUtils.createArticle(boardId, title, articleArray, mediaIds))
          .then(({response: {result}, type, query, error}) => {
            dispatch(postprocessCreateArticle(myId, userName, userImg, title, articleArray, result))
          })
      })
  }
}

// reducers
const reducer = myDuck.createReducer({
  [INIT]:             utils.reduceInit,
  [ADD_CHILD]:        utils.reduceAddChild,
  [SET_ROOT]:         utils.reduceSetRoot,
  [REMOVE_CHILDS]:    utils.reduceRemoveChilds,
  [REMOVE]:           utils.reduceRemove,
  [SET_DATA]:         utils.reduceSetData,
  [UPDATE_DATA]:      utils.reduceUpdateData,
  [ADD_ARTICLE]:      _addArticle,
  [DELETE_ARTICLE]:   _deteleArticle,
  [PREPEND_ARTICLES]: _prependArticles,
  [APPEND_ARTICLES]:  _appendArticles,
  [INSERT_SUMMARIES]: _insertSummaries,
}, Immutable.Map())

export default reducer
