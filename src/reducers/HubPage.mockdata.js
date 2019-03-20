import * as utils       from './utils'
import * as constants   from '../constants/Constants'

const commonInfo = {
  Title:            'dGVzdCBib2FyZA==', // test board
  C:                '8PekZyubu7TRhBZkB4BcWoYHBH1GAb5Cy1qXesUXwTdnphhuzfhXbRS',
  CreateTS:         utils.emptyTimeStamp(),
  UpdateTS:         utils.emptyTimeStamp(),
  JT:               utils.emptyTimeStamp(),
  ArticleCreateTS:  utils.emptyTimeStamp(),
  LastSeen:         utils.emptyTimeStamp(),
}

const personalBoard = {
  ID:               '948UChtsWe1EdMpYdfikv7eGbFJE9nmXvdiTXJ3VvEfoiSAQqqNtd8Q',
  S:                constants.STATUS_ARRAY.indexOf('StatusAlive'),
  BT:               constants.ENTITY_TYPE_ARRAY.indexOf('EntityTypePersonal'),
  ...commonInfo
}

const privateBoard = {
  ID:               '7b1WuAJhRh3ECAUyGv8ekXPLywDPbEDR41CAjjwHJoujiiRfz8UTz7E',
  S:                constants.STATUS_ARRAY.indexOf('StatusAlive'),
  BT:               constants.ENTITY_TYPE_ARRAY.indexOf('EntityTypePrivate'),
  ...commonInfo
}

const deletedPrivateBoard = {
  ID:               '7b1WuAJhRh3ECAUyGv8ekXPLywDPbEDR41CAjjwHJoujiiRfz8UTz7E',
  S:                constants.STATUS_ARRAY.indexOf('StatusDeleted'),
  BT:               constants.ENTITY_TYPE_ARRAY.indexOf('EntityTypePrivate'),
  ...commonInfo
}

const userName = {
  ID:   '8PekZyubu7TRhBZkB4BcWoYHBH1GAb5Cy1qXesUXwTdnphhuzfhXbRS',
  N:    'c2FtbXVp', // sammui
}

const userImg = {
    ID:     '8PekZyubu7TRhBZkB4BcWoYHBH1GAb5Cy1qXesUXwTdnphhuzfhXbRS',
    T:      constants.IMG_TYPE_ARRAY.indexOf('ImgTypeJPEG'),
    I:      '', // no image
    W:      100,
    H:      100,
}

export const testNoBoard = {
    content_getBoardList: [ ],
    me_getBoardRequests: [ ],
    account_getUserNameByIDs: [ userName ],
    account_getUserImgByIDs: [ userImg ],
}

export const testPrivateBoard = {
    content_getBoardList: [ privateBoard ],
    me_getBoardRequests: [ ],
    account_getUserNameByIDs: [ userName ],
    account_getUserImgByIDs: [ userImg ],
}

export const testPersonalBoard = {
    content_getBoardList: [ personalBoard ],
    me_getBoardRequests: [ ],
    account_getUserNameByIDs: [ userName ],
    account_getUserImgByIDs: [ userImg ],
}

export const testDeletedPrivateBoard = {
    content_getBoardList: [ deletedPrivateBoard ],
    me_getBoardRequests: [ ],
    account_getUserNameByIDs: [ userName ],
    account_getUserImgByIDs: [ userImg ],
}
